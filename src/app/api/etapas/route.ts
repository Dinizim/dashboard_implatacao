import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dataInicio = searchParams.get("inicio")
  const dataFim    = searchParams.get("fim")

  if (!dataInicio || !dataFim) {
    return Response.json({ error: "Parâmetros obrigatórios" }, { status: 400 })
  }

  try {
    const result = await db.query(`
      SELECT
        COUNT(CASE WHEN etapakickoff = true AND etapainstalacao = false AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS kickoff_realizados,
        COUNT(CASE WHEN etapainstalacao = true AND etapacadastro = false AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS instalacao_configuracao,
        COUNT(CASE WHEN etapacadastro = true AND etapavendas = false AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS treinamento_cadastro,
        COUNT(CASE WHEN etapavendas = true AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS treinamento_vendas,
        COUNT(CASE WHEN etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL AND (bloqueaprazo = false OR bloqueaprazo IS NULL) AND (CURRENT_DATE - datacadastro) >= 40 THEN 1 END) AS implantacoes_atrasadas
      FROM cliente
      WHERE
        -- Clientes do período selecionado
        (datacadastro BETWEEN $1 AND $2)
        OR
        -- Clientes de períodos anteriores ainda sem suporte definitivo
        (etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL AND (bloqueaprazo = false OR bloqueaprazo IS NULL) AND datacadastro < $1)
    `, [dataInicio, dataFim])

    const row = result.rows[0]

    return Response.json([
      { etapa: "Kickoff Realizados",      value: parseInt(row.kickoff_realizados)      || 0 },
      { etapa: "Instalação/Configuração", value: parseInt(row.instalacao_configuracao) || 0 },
      { etapa: "Treinamento Cadastro",    value: parseInt(row.treinamento_cadastro)    || 0 },
      { etapa: "Trein. Vendas",           value: parseInt(row.treinamento_vendas)      || 0 },
      { etapa: "Implantações Atrasadas",  value: parseInt(row.implantacoes_atrasadas)  || 0 },
    ])
  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar etapas" }, { status: 500 })
  }
}