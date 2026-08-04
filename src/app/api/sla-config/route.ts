/**
 * GET  /api/sla-config  → configuração atual de horas de SLA por etapa
 * PUT  /api/sla-config  → atualiza a configuração (somente gerente autenticado)
 *   Body: { KICKOFF: number, INSTALACAO: number, CADASTRO: number, VENDAS: number, DEFINITIVO: number }
 */

import { NextRequest, NextResponse } from "next/server"
import { buscarSlaConfig, salvarSlaConfig } from "@/lib/queries/sla"
import { ETAPAS_SLA_ORDEM, type SlaConfig } from "@/lib/domain/sla"
import { verificarSessionToken, SESSION_COOKIE } from "@/lib/auth/session"

export async function GET() {
  try {
    const config = await buscarSlaConfig()
    return NextResponse.json({ config })
  } catch (error) {
    console.error("[/api/sla-config][GET]", error)
    return NextResponse.json({ error: "Erro interno ao buscar configuração de SLA" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const sessao = await verificarSessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  if (!sessao || sessao.role !== "gerente") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let body: Partial<SlaConfig>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const config = {} as SlaConfig
  for (const etapa of ETAPAS_SLA_ORDEM) {
    const horas = Number(body[etapa])
    if (!Number.isFinite(horas) || horas <= 0) {
      return NextResponse.json({ error: `Horas inválidas para a etapa ${etapa}` }, { status: 400 })
    }
    config[etapa] = Math.round(horas)
  }

  try {
    await salvarSlaConfig(config)
    return NextResponse.json({ ok: true, config })
  } catch (error) {
    console.error("[/api/sla-config][PUT]", error)
    return NextResponse.json({ error: "Erro interno ao salvar configuração de SLA" }, { status: 500 })
  }
}
