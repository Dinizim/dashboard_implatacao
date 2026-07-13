/**
 * Labels de exibição
 *
 * Separa os textos de tela das regras de negócio.
 * Altere aqui para mudar como algo aparece na interface
 * sem precisar tocar nas regras de cálculo.
 */

import type { EtapaCliente, StatusCliente, StatusPrazo } from "./cliente"

export const ETAPA_LABEL: Record<EtapaCliente, string> = {
  SEM_KICKOFF: "Sem Kickoff",
  KICKOFF:     "Kickoff Realizado",
  INSTALACAO:  "Instalação/Configuração",
  CADASTRO:    "Treinamento Cadastro",
  VENDAS:      "Trein. Vendas",
  DEFINITIVO:  "Suporte Definitivo",
}

export const STATUS_LABEL: Record<StatusCliente, string> = {
  ATIVO:     "Ativo",
  ATRASADO:  "Atrasado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
}

export const PRAZO_LABEL: Record<StatusPrazo, string> = {
  OK:            "Dentro do prazo",
  PRIORIDADE:    "Atenção",
  FORA_DO_PRAZO: "Fora do prazo",
}