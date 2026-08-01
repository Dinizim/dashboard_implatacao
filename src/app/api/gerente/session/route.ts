/**
 * GET /api/gerente/session
 * Retorna { autenticado: boolean }
 */

import { NextRequest, NextResponse } from "next/server"
import { verificarSessaoGerente } from "@/lib/gerenteAuth"

export async function GET(request: NextRequest) {
  return NextResponse.json({ autenticado: verificarSessaoGerente(request) })
}
