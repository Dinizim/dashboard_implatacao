import { NextRequest } from "next/server"
import { getKpisPorPeriodo } from "@/lib/queries"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dataInicio = searchParams.get("inicio")
  const dataFim    = searchParams.get("fim")

  if (!dataInicio || !dataFim) {
    return Response.json({ error: "Parâmetros início e fim são obrigatórios" }, { status: 400 })
  }

  try {
    const dados = await getKpisPorPeriodo(dataInicio, dataFim)
    return Response.json(dados)
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}