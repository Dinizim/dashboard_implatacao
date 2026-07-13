/**
 * GET /api/kpis?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
 *
 * Retorna os KPIs do dashboard para o período informado.
 * Inclui clientes do período + atrasados de períodos anteriores.
 */

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { REVENDAS_PERMITIDAS, placeholdersRevendas } from "@/lib/domain/revendas"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dataInicio = searchParams.get("inicio")
  const dataFim    = searchParams.get("fim")

  if (!dataInicio || !dataFim) {
    return Response.json(
      { error: "Parâmetros 'inicio' e 'fim' são obrigatórios (formato: YYYY-MM-DD)" },
      { status: 400 }
    )
  }

  try {
    const result = await db.query(`
      WITH base AS (
        SELECT
          c.*,
          -- Dias reais de implantação (assinatura → suporte definitivo)
          CASE
            WHEN c.dataassinaturacontrato IS NOT NULL
             AND c.datasuportedefinitivo  IS NOT NULL
            THEN c.datasuportedefinitivo - c.dataassinaturacontrato
          END AS dias_implantacao,

          -- Classifica a origem do cliente
          CASE
            WHEN c.dataassinaturacontrato IS NULL                         THEN 'NAO_ASSINADO'
            WHEN (c.datacadastro BETWEEN $1 AND $2
              AND c.revendanome IN (${placeholdersRevendas(2)}))          THEN 'PERIODO'
            WHEN c.etapasuportedefinitivo = false
             AND c.dataassinaturacontrato IS NOT NULL
             AND c.datacadastro < $1                                      THEN 'ATRASADO'
            ELSE 'OUTRO'
          END AS origem

        FROM cliente c
        WHERE c.datacadastro IS NOT NULL
          AND c.revendanome IN (${placeholdersRevendas(2)})
      )
      SELECT * FROM base WHERE origem != 'OUTRO'
    `, [dataInicio, dataFim, ...REVENDAS_PERMITIDAS])

    const clientes = result.rows

    const doPeriodo  = clientes.filter(c => c.origem === 'PERIODO')
    const atrasados  = clientes.filter(c => c.origem === 'ATRASADO')
    const naoAssinados = clientes.filter(c => c.origem === 'NAO_ASSINADO')

    const dataInicioDate = new Date(dataInicio)
    const dataFimDate    = new Date(dataFim)

    const naoAssinadosDoPeriodo = naoAssinados.filter(c => {
      const d = new Date(c.datacadastro)
      return d >= dataInicioDate && d <= dataFimDate
    })

    const emImplantacao  = doPeriodo.filter(c => c.dataassinaturacontrato && !c.etapasuportedefinitivo)
    const implantados    = doPeriodo.filter(c => c.etapainstalacao && !c.etapasuportedefinitivo)
    const supDefinitivo  = doPeriodo.filter(c => c.etapasuportedefinitivo)
    const cancelados     = doPeriodo.filter(c => c.bloqueaprazo)
    const semKickoff     = emImplantacao.filter(c => !c.etapakickoff)
    const dentroPrazo    = supDefinitivo.filter(c => c.dias_implantacao <= 60)
    const foraPrazo      = supDefinitivo.filter(c => c.dias_implantacao > 60)

    return Response.json({
      clientes,
      kpis: {
        vendidos:             doPeriodo.length,
        nao_assinado:         naoAssinadosDoPeriodo.length,
        em_implantacao:       emImplantacao.length,
        implantados:          implantados.length,
        dentro_prazo:         dentroPrazo.length,
        fora_prazo:           foraPrazo.length,
        suporte_definitivo:   supDefinitivo.length,
        sem_kickoff:          semKickoff.length,
        atrasados_anteriores: atrasados.length,
        cancelados:           cancelados.length,
      },
    })
  } catch (error) {
    console.error("[/api/kpis]", error)
    return Response.json({ error: "Erro interno ao buscar KPIs" }, { status: 500 })
  }
}