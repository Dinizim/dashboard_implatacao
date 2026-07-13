/**
 * GET /api/clientes-viewer?filtro=...&inicio=YYYY-MM-DD&fim=YYYY-MM-DD
 *
 * Retorna a lista de clientes de um grupo específico.
 * Usado pelo painel de drill-down quando o usuário clica em um KPI
 * ou em uma fatia do gráfico de pizza.
 *
 * Filtros de KPI aceitos:
 *   vendidos | implantados | sem_kickoff | cancelados |
 *   suporte_definitivo | fora_prazo | dentro_prazo | nao_assinado
 *
 * Filtros de etapa (pizza) aceitos:
 *   Kickoff Realizados | Instalação/Configuração | Treinamento Cadastro |
 *   Trein. Vendas | Implantações Atrasadas
 */

import { NextRequest } from "next/server"
import { buscarClientesPorKpi, buscarClientesPorEtapa } from "@/lib/queries/clientes"
import {
  calcularEtapaAtual,
  calcularDiasImplantacao,
} from "@/lib/domain/cliente"
import { ETAPA_LABEL } from "@/lib/domain/labels"

// Etapas do gráfico de pizza (não usam filtro de período)
const ETAPAS_PIZZA = new Set([
  "Kickoff Realizados",
  "Instalação/Configuração",
  "Treinamento Cadastro",
  "Trein. Vendas",
  "Implantações Atrasadas",
])

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const filtro     = searchParams.get("filtro")
  const dataInicio = searchParams.get("inicio")
  const dataFim    = searchParams.get("fim")

  if (!filtro) {
    return Response.json({ error: "Parâmetro 'filtro' é obrigatório" }, { status: 400 })
  }

  if (!ETAPAS_PIZZA.has(filtro) && (!dataInicio || !dataFim)) {
    return Response.json({ error: "Parâmetros 'inicio' e 'fim' são obrigatórios" }, { status: 400 })
  }

  try {
    const brutos = ETAPAS_PIZZA.has(filtro)
      ? await buscarClientesPorEtapa(filtro)
      : await buscarClientesPorKpi(filtro, dataInicio!, dataFim!)

    const clientes = brutos.map(c => ({
      codigo:     String(c.idcliente),
      nome:       c.nomecliente,
      dias:       calcularDiasImplantacao(c),
      etapaAtual: ETAPA_LABEL[calcularEtapaAtual(c)],
      assinatura: c.dataassinaturacontrato,
      kickoff:    c.dataetapakickoff,
      instalacao: c.dataetapainstalacao,
      cadastro:   c.dataetapacadastro,
      vendas:     c.dataetapavendas,
      supDef:     c.datasuportedefinitivo,
    }))

    return Response.json({ clientes })
  } catch (error) {
    console.error("[/api/clientes-viewer]", error)
    return Response.json({ error: "Erro interno ao buscar clientes" }, { status: 500 })
  }
}