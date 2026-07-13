/**
 * GET /api/etapas?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
 *
 * Retorna a contagem de clientes por etapa do funil de implantação.
 * Usado pelo gráfico de pizza do dashboard.
 *
 * Inclui clientes do período + clientes de períodos anteriores
 * que ainda não finalizaram (sem suporte definitivo).
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
      { error: "Parâmetros 'inicio' e 'fim' são obrigatórios" },
      { status: 400 }
    )
  }

  try {
    const result = await db.query(`
      SELECT
        COUNT(CASE WHEN etapakickoff = true  AND etapainstalacao = false AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS kickoff_realizados,
        COUNT(CASE WHEN etapainstalacao = true AND etapacadastro = false  AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS instalacao_configuracao,
        COUNT(CASE WHEN etapacadastro = true  AND etapavendas = false     AND etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS treinamento_cadastro,
        COUNT(CASE WHEN etapavendas = true    AND etapasuportedefinitivo = false                             AND dataassinaturacontrato IS NOT NULL THEN 1 END) AS treinamento_vendas,
        COUNT(CASE WHEN etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL
                    AND (bloqueaprazo = false OR bloqueaprazo IS NULL)
                    AND (CURRENT_DATE - datacadastro) >= 40 THEN 1 END) AS implantacoes_atrasadas
      FROM cliente
      WHERE revendanome IN (${placeholdersRevendas(0)})
        AND (
          -- Clientes do período selecionado
          (datacadastro BETWEEN $${REVENDAS_PERMITIDAS.length + 1} AND $${REVENDAS_PERMITIDAS.length + 2})
          OR
          -- Clientes anteriores ainda em aberto
          (etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL
           AND (bloqueaprazo = false OR bloqueaprazo IS NULL)
           AND datacadastro < $${REVENDAS_PERMITIDAS.length + 1})
        )
    `, [...REVENDAS_PERMITIDAS, dataInicio, dataFim])

    const r = result.rows[0]

    return Response.json([
      { etapa: "Kickoff Realizados",      value: parseInt(r.kickoff_realizados)      || 0 },
      { etapa: "Instalação/Configuração", value: parseInt(r.instalacao_configuracao) || 0 },
      { etapa: "Treinamento Cadastro",    value: parseInt(r.treinamento_cadastro)    || 0 },
      { etapa: "Trein. Vendas",           value: parseInt(r.treinamento_vendas)      || 0 },
      { etapa: "Implantações Atrasadas",  value: parseInt(r.implantacoes_atrasadas)  || 0 },
    ])
  } catch (error) {
    console.error("[/api/etapas]", error)
    return Response.json({ error: "Erro interno ao buscar etapas" }, { status: 500 })
  }
}