/**
 * POST /api/auth/login
 * Body: { usuario: string, senha: string }
 *
 * Valida contra as credenciais definidas em variáveis de ambiente
 * (GERENTE_USUARIO/GERENTE_SENHA, TECNICO_USUARIO/TECNICO_SENHA) e,
 * se válidas, cria uma sessão assinada (cookie httpOnly).
 */

import { NextRequest, NextResponse } from "next/server"
import { validarCredenciais } from "@/lib/auth/users"
import { criarSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SEGUNDOS } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  let usuario = ""
  let senha = ""
  try {
    const body = await request.json()
    usuario = typeof body.usuario === "string" ? body.usuario : ""
    senha = typeof body.senha === "string" ? body.senha : ""
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 })
  }

  const conta = validarCredenciais(usuario, senha)
  if (!conta) {
    return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
  }

  const exp = Date.now() + SESSION_MAX_AGE_SEGUNDOS * 1000
  const token = await criarSessionToken({ usuario: conta.usuario, role: conta.role, exp })

  const response = NextResponse.json({ ok: true, usuario: conta.usuario, role: conta.role })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEGUNDOS,
  })
  return response
}
