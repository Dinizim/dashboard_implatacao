/**
 * POST /api/gerente/logout
 */

import { NextResponse } from "next/server"
import { GERENTE_COOKIE } from "@/lib/gerenteAuth"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(GERENTE_COOKIE)
  return response
}
