/**
 * POST /api/gerente/login
 * Body: { usuario: string, senha: string }
 */

import { NextRequest, NextResponse } from "next/server"
import { credenciaisValidas, GERENTE_COOKIE, gerenteCookieOptions } from "@/lib/gerenteAuth"

export async function POST(request: NextRequest) {
  let usuario = ""
  let senha = ""
  try {
    const body = await request.json()
    usuario = body.usuario ?? ""
    senha = body.senha ?? ""
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  if (!credenciaisValidas(usuario, senha)) {
    return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  const { value, ...options } = gerenteCookieOptions
  response.cookies.set(GERENTE_COOKIE, value, options)
  return response
}
