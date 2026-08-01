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
import { buscarClientePorId } from "@/lib/queries/clientes"
import { buscarSlaConfig } from "@/lib/queries/sla"
import { parsearHistorico } from "@/lib/domain/historico"
import { calcularSlaPorCliente } from "@/lib/domain/sla"

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
    const clienteBruto = await buscarClientePorId(idcliente)
    const slaConfig = await buscarSlaConfig()
    const sla = clienteBruto ? calcularSlaPorCliente(clienteBruto, slaConfig) : []

    const ocorrencia = await buscarOcorrenciaImplantacao(idcliente)

    // Sem ocorrência: retorna estrutura vazia (não é erro, cliente pode não ter histórico)
    if (!ocorrencia) {
      return Response.json({
        kickoff: null,
        semanas: {},
        observacoesGerais: null,
        implantacaoFinalizada: false,
        sla,
      })
    }

    const registros = await buscarHistoricoOcorrencia(ocorrencia.idocorrencia)
    const historico = parsearHistorico(registros)

    return Response.json({ ...historico, sla })
  } catch (error) {
    console.error("[/api/cliente-historico]", error)
    return Response.json({ error: "Erro interno ao buscar histórico" }, { status: 500 })
  }
}