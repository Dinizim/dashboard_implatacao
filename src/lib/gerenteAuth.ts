/**
 * Autenticação simples do painel do gerente (/gerente).
 *
 * Credencial fixa por enquanto: usuário "Julio", senha "123".
 * Sem tabela de usuários — só protege o acesso ao painel de SLA.
 */

import type { NextRequest } from "next/server"

export const GERENTE_USUARIO = "Julio"
export const GERENTE_SENHA = "123"

export const GERENTE_COOKIE = "gerente_sessao"
const GERENTE_COOKIE_VALOR = "sjc-gerente-2026"
const GERENTE_COOKIE_MAX_AGE = 60 * 60 * 8 // 8 horas

export function credenciaisValidas(usuario: string, senha: string): boolean {
  return usuario === GERENTE_USUARIO && senha === GERENTE_SENHA
}

export function verificarSessaoGerente(request: NextRequest): boolean {
  return request.cookies.get(GERENTE_COOKIE)?.value === GERENTE_COOKIE_VALOR
}

export const gerenteCookieOptions = {
  value: GERENTE_COOKIE_VALOR,
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: GERENTE_COOKIE_MAX_AGE,
}
