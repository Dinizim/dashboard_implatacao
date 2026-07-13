/**
 * GET /api/kpis-anuais?ano=2026
 *
 * Retorna os 4 KPIs do card lateral da seção anual:
 *   - vendidos: total de clientes cadastrados no ano
 *   - implantados: total com dataetapainstalacao preenchida
 *   - pctImplantados: % implantados em relação aos vendidos
 *   - defasagem: % de vendas ainda não implantadas
 */

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { REVENDAS_PERMITIDAS, placeholdersRevendas } from "@/lib/domain/revendas"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ano = searchParams.get("ano")

  if (!ano || isNaN(Number(ano))) {
    return Response.json({ error: "Parâmetro 'ano' é obrigatório e deve ser numérico" }, { status: 400 })
  }

  try {
    const result = await db.query(`
      SELECT
        COUNT(*)                                                         AS vendidos,
        COUNT(CASE WHEN dataetapainstalacao IS NOT NULL THEN 1 END)     AS implantados
      FROM cliente
      WHERE EXTRACT(YEAR FROM datacadastro) = $1
        AND revendanome IN (${placeholdersRevendas(1)})
    `, [ano, ...REVENDAS_PERMITIDAS])

    const row         = result.rows[0]
    const vendidos    = parseInt(row.vendidos)    || 0
    const implantados = parseInt(row.implantados) || 0

    const pctImplantados = vendidos > 0 ? Math.round((implantados / vendidos) * 100) : 0
    const defasagem      = vendidos > 0 ? Math.round(((vendidos - implantados) / vendidos) * 100) : 0

    return Response.json({ vendidos, implantados, pctImplantados, defasagem })
  } catch (error) {
    console.error("[/api/kpis-anuais]", error)
    return Response.json({ error: "Erro interno ao buscar KPIs anuais" }, { status: 500 })
  }
}