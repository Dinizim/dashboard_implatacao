/**
 * GET /api/sla-alertas
 *
 * Lista clientes ativos cuja etapa atual do SLA está em risco (>= 80% do prazo)
 * ou estourada (>= 100% do prazo). Usado pelo sino de notificações da sidebar.
 */

import { buscarClientesAtivosParaSla } from "@/lib/queries/clientes"
import { buscarSlaConfig } from "@/lib/queries/sla"
import { calcularSlaPorCliente, etapaSlaEmAndamento, type StatusSla } from "@/lib/domain/sla"

const PESO_STATUS: Record<string, number> = { ESTOURADO: 0, RISCO: 1 }

export async function GET() {
  try {
    const [clientes, slaConfig] = await Promise.all([
      buscarClientesAtivosParaSla(),
      buscarSlaConfig(),
    ])

    const alertas = clientes
      .map(c => {
        const resultados = calcularSlaPorCliente(c, slaConfig)
        const atual = etapaSlaEmAndamento(resultados)
        if (!atual || (atual.status !== "RISCO" && atual.status !== "ESTOURADO")) return null

        return {
          codigo: String(c.idcliente),
          nome: c.nomecliente as string,
          etapa: atual.etapa,
          etapaLabel: atual.label,
          horasDecorridas: atual.horasDecorridas,
          slaHoras: atual.slaHoras,
          status: atual.status as StatusSla,
        }
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => PESO_STATUS[a.status] - PESO_STATUS[b.status])

    const estourados = alertas.filter(a => a.status === "ESTOURADO").length
    const emRisco = alertas.filter(a => a.status === "RISCO").length

    return Response.json({ alertas, total: alertas.length, estourados, emRisco })
  } catch (error) {
    console.error("[/api/sla-alertas]", error)
    return Response.json({ error: "Erro interno ao buscar alertas de SLA" }, { status: 500 })
  }
}
