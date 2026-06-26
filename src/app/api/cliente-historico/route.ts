import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const idcliente = searchParams.get("idcliente")

  if (!idcliente) {
    return Response.json({ error: "idcliente é obrigatório" }, { status: 400 })
  }

  try {
    // 1. Busca a ocorrência de "Processo de Implantação" do cliente
    const ocorrenciaResult = await db.query(`
      SELECT idocorrencia, dataabertura, datafechamento
      FROM ocorrencia
      WHERE idcliente = $1
        AND descricao ILIKE '%Processo de Implantação%'
      ORDER BY dataabertura DESC
      LIMIT 1
    `, [idcliente])

    if (ocorrenciaResult.rows.length === 0) {
      return Response.json({
        kickoff: null,
        semanas: [],
        observacoesGerais: null,
        implantacaoFinalizada: false,
      })
    }

    const idocorrencia = ocorrenciaResult.rows[0].idocorrencia

    // 2. Busca todos os registros do histórico dessa ocorrência
    const historicoResult = await db.query(`
      SELECT iddescricaohistorico, descricao, datahistorico, horahistorico, solucao
      FROM descricao_historico
      WHERE idocorrencia = $1
      ORDER BY datahistorico ASC, horahistorico ASC
    `, [idocorrencia])

    const registros = historicoResult.rows

    // 3. Classifica cada registro pelo conteúdo da descrição
    let kickoff: { data: string; observacao: string } | null = null
    const semanas: Record<number, { data: string; observacao: string }> = {}
    let observacoesGerais: { data: string; observacao: string } | null = null
    let implantacaoFinalizada = false

    registros.forEach(r => {
      const texto = r.descricao as string
      const data = r.datahistorico

      // Kick-off / primeiro contato
      if (/observa[çc][õo]es kick-?off|primeiro contato/i.test(texto)) {
        kickoff = {
          data,
          observacao: texto.split(":").slice(1).join(":").trim(),
        }
        return
      }

      // Semana N
      const matchSemana = texto.match(/semana\s*(\d+)/i)
      if (matchSemana) {
        const numero = parseInt(matchSemana[1])
        semanas[numero] = {
          data,
          observacao: texto.split(":").slice(1).join(":").trim(),
        }
        return
      }

      // Observações gerais
      if (/observa[çc][õo]es gerais/i.test(texto)) {
        observacoesGerais = {
          data,
          observacao: texto.split(":").slice(1).join(":").trim(),
        }
        return
      }

      // Implantação finalizada
      if (/implanta[çc][ãa]o finalizada/i.test(texto) || r.solucao === true) {
        implantacaoFinalizada = true
      }
    })

    return Response.json({
      kickoff,
      semanas, // objeto { 1: {...}, 2: {...} }
      observacoesGerais,
      implantacaoFinalizada,
    })

  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar histórico" }, { status: 500 })
  }
}