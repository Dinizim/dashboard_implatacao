import { NextRequest } from "next/server"
import { db } from "@/lib/db"

const MESES = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ano = searchParams.get("ano")

  if (!ano) {
    return Response.json({ error: "Parâmetro ano é obrigatório" }, { status: 400 })
  }

  try {
    const result = await db.query(`
      SELECT
        EXTRACT(MONTH FROM datacadastro) AS mes,
        COUNT(*) AS qtd_vendas,
        COUNT(CASE WHEN dataassinaturacontrato IS NOT NULL
                   AND etapakickoff = false THEN 1 END) AS qtd_sem_etapa,
        COUNT(CASE WHEN bloqueaprazo = true THEN 1 END) AS qtd_cancelados,
        COUNT(CASE WHEN etapakickoff = true AND etapainstalacao = false
                   AND etapasuportedefinitivo = false THEN 1 END) AS kickoff,
        COUNT(CASE WHEN etapainstalacao = true AND etapacadastro = false
                   AND etapasuportedefinitivo = false THEN 1 END) AS instalacao,
        COUNT(CASE WHEN etapacadastro = true AND etapavendas = false
                   AND etapasuportedefinitivo = false THEN 1 END) AS t_cadastro,
        COUNT(CASE WHEN etapavendas = true
                   AND etapasuportedefinitivo = false THEN 1 END) AS t_vendas,
        COUNT(CASE WHEN etapasuportedefinitivo = true THEN 1 END) AS sup_definitivo
      FROM cliente
      WHERE EXTRACT(YEAR FROM datacadastro) = $1
      GROUP BY EXTRACT(MONTH FROM datacadastro)
      ORDER BY mes
    `, [ano])

    // Monta array de 12 meses, preenchendo com zero onde não tiver dados
    const porMes: Record<number, any> = {}
    result.rows.forEach(r => { porMes[parseInt(r.mes)] = r })

    const linhas = MESES.map((label, i) => {
      const mes = i + 1
      const d = porMes[mes] ?? {
        qtd_vendas: 0, qtd_sem_etapa: 0, qtd_cancelados: 0,
        kickoff: 0, instalacao: 0, t_cadastro: 0, t_vendas: 0, sup_definitivo: 0
      }
      const totalImplantacoes =
        parseInt(d.kickoff) + parseInt(d.instalacao) +
        parseInt(d.t_cadastro) + parseInt(d.t_vendas) + parseInt(d.sup_definitivo)
      const deficit = parseInt(d.qtd_vendas) - totalImplantacoes

      return {
        mes: label,
        qtdVendas:       parseInt(d.qtd_vendas),
        qtdSemEtapa:     parseInt(d.qtd_sem_etapa),
        qtdCancelados:   parseInt(d.qtd_cancelados),
        kickoff:         parseInt(d.kickoff),
        instalacao:      parseInt(d.instalacao),
        tCadastro:       parseInt(d.t_cadastro),
        tVendas:         parseInt(d.t_vendas),
        supDefinitivo:   parseInt(d.sup_definitivo),
        totalImplantacoes,
        deficit,
      }
    })

    // Totalizadores (soma de todas as colunas)
    const totais = linhas.reduce((acc, l) => ({
      qtdVendas:         acc.qtdVendas + l.qtdVendas,
      qtdSemEtapa:       acc.qtdSemEtapa + l.qtdSemEtapa,
      qtdCancelados:     acc.qtdCancelados + l.qtdCancelados,
      kickoff:           acc.kickoff + l.kickoff,
      instalacao:        acc.instalacao + l.instalacao,
      tCadastro:         acc.tCadastro + l.tCadastro,
      tVendas:           acc.tVendas + l.tVendas,
      supDefinitivo:     acc.supDefinitivo + l.supDefinitivo,
      totalImplantacoes: acc.totalImplantacoes + l.totalImplantacoes,
      deficit:           acc.deficit + l.deficit,
    }), {
      qtdVendas: 0, qtdSemEtapa: 0, qtdCancelados: 0, kickoff: 0,
      instalacao: 0, tCadastro: 0, tVendas: 0, supDefinitivo: 0,
      totalImplantacoes: 0, deficit: 0,
    })

    return Response.json({ linhas, totais })

  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar relatório anual" }, { status: 500 })
  }
}