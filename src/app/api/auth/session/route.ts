/**
 * GET /api/auth/session
 * Retorna { autenticado: boolean, usuario?: string, role?: "gerente" | "tecnico" }
 */

import { NextRequest, NextResponse } from "next/server"
import { verificarSessionToken, SESSION_COOKIE } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const sessao = await verificarSessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  if (!sessao) {
    return NextResponse.json({ autenticado: false })
  }
  return NextResponse.json({ autenticado: true, usuario: sessao.usuario, role: sessao.role })
}
