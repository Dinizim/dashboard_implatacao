/**
 * Domínio do SLA por etapa
 *
 * Cada transição entre etapas da implantação tem um prazo máximo (em horas).
 * As horas configuradas ficam em `configuracao_sla` no banco (lib/queries/sla.ts)
 * e podem ser ajustadas pelo gerente em /gerente. SLA_HORAS_PADRAO é usado
 * como valor inicial/fallback caso a tabela ainda não tenha sido populada.
 */

import type { ClienteBruto } from "./cliente"

export type EtapaSla = "KICKOFF" | "INSTALACAO" | "CADASTRO" | "VENDAS" | "DEFINITIVO"

export type SlaConfig = Record<EtapaSla, number>

export type StatusSla = "NAO_INICIADO" | "OK" | "RISCO" | "ESTOURADO"

export type SlaEtapaCalculo = {
  horasDecorridas: number
  slaHoras: number
  status: StatusSla
  concluido: boolean
}

export type SlaEtapaResultado = SlaEtapaCalculo & { etapa: EtapaSla; label: string }

export const SLA_HORAS_PADRAO: SlaConfig = {
  KICKOFF: 48,
  INSTALACAO: 72,
  CADASTRO: 96,
  VENDAS: 96,
  DEFINITIVO: 48,
}

export const ETAPAS_SLA_ORDEM: EtapaSla[] = ["KICKOFF", "INSTALACAO", "CADASTRO", "VENDAS", "DEFINITIVO"]

const DEFINICAO_ETAPAS_SLA: {
  etapa: EtapaSla
  label: string
  campoInicio: keyof ClienteBruto
  campoFim: keyof ClienteBruto
}[] = [
  { etapa: "KICKOFF",    label: "Kick-off",           campoInicio: "dataassinaturacontrato", campoFim: "dataetapakickoff" },
  { etapa: "INSTALACAO", label: "Instalação",         campoInicio: "dataetapakickoff",       campoFim: "dataetapainstalacao" },
  { etapa: "CADASTRO",   label: "Trein. Cadastro",    campoInicio: "dataetapainstalacao",    campoFim: "dataetapacadastro" },
  { etapa: "VENDAS",     label: "Trein. Vendas",      campoInicio: "dataetapacadastro",      campoFim: "dataetapavendas" },
  { etapa: "DEFINITIVO", label: "Sup. Definitivo",    campoInicio: "dataetapavendas",        campoFim: "datasuportedefinitivo" },
]

/**
 * Calcula o status do SLA de uma etapa específica.
 *
 * Enquanto a etapa está em andamento (sem dataFim), fica em risco a partir de
 * 80% do prazo consumido e estourado ao atingir 100%. Uma etapa já concluída
 * só é marcada como estourada se o tempo total até a conclusão passou do SLA.
 */
export function calcularSlaEtapa(
  dataInicio: string | Date | null,
  dataFim: string | Date | null,
  slaHoras: number
): SlaEtapaCalculo {
  if (!dataInicio) {
    return { horasDecorridas: 0, slaHoras, status: "NAO_INICIADO", concluido: false }
  }

  const inicio = new Date(dataInicio).getTime()
  const referencia = dataFim ? new Date(dataFim).getTime() : Date.now()
  const horasDecorridas = Math.max(0, Math.round((referencia - inicio) / 3_600_000))
  const concluido = !!dataFim

  let status: StatusSla
  if (concluido) {
    status = horasDecorridas > slaHoras ? "ESTOURADO" : "OK"
  } else if (horasDecorridas >= slaHoras) {
    status = "ESTOURADO"
  } else if (horasDecorridas >= slaHoras * 0.8) {
    status = "RISCO"
  } else {
    status = "OK"
  }

  return { horasDecorridas, slaHoras, status, concluido }
}

/** Calcula o SLA de todas as etapas de um cliente. */
export function calcularSlaPorCliente(
  cliente: ClienteBruto,
  slaConfig: SlaConfig = SLA_HORAS_PADRAO
): SlaEtapaResultado[] {
  return DEFINICAO_ETAPAS_SLA.map(({ etapa, label, campoInicio, campoFim }) => ({
    etapa,
    label,
    ...calcularSlaEtapa(
      cliente[campoInicio] as string | null,
      cliente[campoFim] as string | null,
      slaConfig[etapa]
    ),
  }))
}

/** Retorna a etapa que o cliente está cursando agora (iniciada e ainda não concluída), se houver. */
export function etapaSlaEmAndamento(resultados: SlaEtapaResultado[]): SlaEtapaResultado | null {
  return resultados.find(r => r.status !== "NAO_INICIADO" && !r.concluido) ?? null
}
