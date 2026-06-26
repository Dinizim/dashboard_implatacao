import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ano = searchParams.get("ano")

  if (!ano) {
    return Response.json({ error: "Parâmetro ano é obrigatório" }, { status: 400 })
  }

  try {
    const result = await db.query(`
      SELECT
        COUNT(*) AS vendidos,
        COUNT(CASE WHEN dataetapainstalacao IS NOT NULL THEN 1 END) AS implantados
      FROM cliente
      WHERE EXTRACT(YEAR FROM datacadastro) = $1
    `, [ano])

    const row = result.rows[0]
    const vendidos    = parseInt(row.vendidos) || 0
    const implantados = parseInt(row.implantados) || 0

    const pctImplantados = vendidos > 0 ? Math.round((implantados / vendidos) * 100) : 0
    const defasagem      = vendidos > 0 ? Math.round(((vendidos - implantados) / vendidos) * 100) : 0

    return Response.json({
      vendidos,
      implantados,
      pctImplantados,
      defasagem,
    })

  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar KPIs anuais" }, { status: 500 })
  }
}