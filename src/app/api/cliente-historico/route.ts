/**
 * GET /api/cliente-historico?idcliente=123
 *
 * Retorna o histórico de acompanhamento semanal de um cliente específico,
 * extraído da ocorrência de "Processo de Implantação" registrada no sistema.
 *
 * Resposta:
 *   kickoff             – dados do kick-off / primeiro contato
 *   semanas             – objeto { 1: {...}, 2: {...}, ... } com cada semana registrada
 *   observacoesGerais   – observações finais antes do suporte definitivo
 *   implantacaoFinalizada – true se a ocorrência foi marcada como solução
 */

import { NextRequest } from "next/server"
import { buscarOcorrenciaImplantacao, buscarHistoricoOcorrencia } from "@/lib/queries/ocorrencias"
import { parsearHistorico } from "@/lib/domain/historico"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const idclienteParam = searchParams.get("idcliente")

  if (!idclienteParam) {
    return Response.json({ error: "Parâmetro 'idcliente' é obrigatório" }, { status: 400 })
  }

  const idcliente = parseInt(idclienteParam)
  if (isNaN(idcliente)) {
    return Response.json({ error: "Parâmetro 'idcliente' deve ser um número" }, { status: 400 })
  }

  try {
    const ocorrencia = await buscarOcorrenciaImplantacao(idcliente)

    // Sem ocorrência: retorna estrutura vazia (não é erro, cliente pode não ter histórico)
    if (!ocorrencia) {
      return Response.json({
        kickoff: null,
        semanas: {},
        observacoesGerais: null,
        implantacaoFinalizada: false,
      })
    }

    const registros = await buscarHistoricoOcorrencia(ocorrencia.idocorrencia)
    const historico = parsearHistorico(registros)

    return Response.json(historico)
  } catch (error) {
    console.error("[/api/cliente-historico]", error)
    return Response.json({ error: "Erro interno ao buscar histórico" }, { status: 500 })
  }
}