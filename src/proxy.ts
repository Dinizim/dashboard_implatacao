/**
 * Proxy de autenticação (roda antes de toda request, no runtime Node.js).
 *
 * Bloqueia por padrão TODAS as páginas e rotas de API (dados de clientes,
 * KPIs, relatórios, SLA etc.) para quem não tem uma sessão válida — inclusive
 * quem tenta acessar a URL pública direto, sem passar pelo frontend.
 *
 * Exceções: /login e /api/auth/* (login, logout, checagem de sessão).
 * A rota /gerente e o PUT em /api/sla-config exigem especificamente o
 * papel "gerente" (Julio); o técnico só acessa dashboard e clientes.
 */

import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verificarSessionToken } from "@/lib/auth/session"

const ROTAS_PUBLICAS = new Set(["/login"])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next()
  }

  if (ROTAS_PUBLICAS.has(pathname)) {
    return NextResponse.next()
  }

  const sessao = await verificarSessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  const isApi = pathname.startsWith("/api/")

  if (!sessao) {
    if (isApi) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const acessoGerenteApenas =
    pathname === "/gerente" ||
    (pathname === "/api/sla-config" && request.method === "PUT")

  if (acessoGerenteApenas && sessao.role !== "gerente") {
    if (isApi) {
      return NextResponse.json({ error: "Acesso restrito ao gerente" }, { status: 403 })
    }
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
