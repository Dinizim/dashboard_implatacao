/**
 * Domínio do Cliente
 *
 * Este arquivo centraliza TODAS as regras de negócio relacionadas ao cliente.
 */

export type ClienteBruto = {
  idcliente: number
  nomecliente: string
  revendanome: string | null
  datacadastro: string | null
  dataassinaturacontrato: string | null
  etapakickoff: boolean
  etapainstalacao: boolean
  etapacadastro: boolean
  etapavendas: boolean
  etapasuportedefinitivo: boolean
  dataetapakickoff: string | null
  dataetapainstalacao: string | null
  dataetapacadastro: string | null
  dataetapavendas: string | null
  datasuportedefinitivo: string | null
  bloqueaprazo: boolean | null
  cnpj: string | null
  logradouro: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  ddd: string | null
  telefone: string | null
}

/** Etapas possíveis no fluxo de implantação */
export type EtapaCliente =
  | "SEM_KICKOFF"
  | "KICKOFF"
  | "INSTALACAO"
  | "CADASTRO"
  | "VENDAS"
  | "DEFINITIVO"

/** Status de prazo do cliente */
export type StatusPrazo = "OK" | "PRIORIDADE" | "FORA_DO_PRAZO"

/** Status geral do cliente */
export type StatusCliente = "ATIVO" | "ATRASADO" | "CONCLUIDO" | "CANCELADO"

// ─────────────────────────────────────────────
// Constantes de negócio
// Altere aqui para mudar as regras de prazo em toda a aplicação
// ─────────────────────────────────────────────

export const PRAZO_PRIORIDADE_DIAS = 40  // amarelo: atenção
export const PRAZO_MAXIMO_DIAS     = 60  // vermelho: fora do prazo

// ─────────────────────────────────────────────
// Funções de domínio
// ─────────────────────────────────────────────

/**
 * Retorna a etapa atual do cliente no fluxo de implantação.
 * A etapa é determinada pela etapa mais avançada já concluída.
 */
export function calcularEtapaAtual(c: ClienteBruto): EtapaCliente {
  if (c.etapasuportedefinitivo) return "DEFINITIVO"
  if (c.etapavendas)            return "VENDAS"
  if (c.etapacadastro)          return "CADASTRO"
  if (c.etapainstalacao)        return "INSTALACAO"
  if (c.etapakickoff)           return "KICKOFF"
  return "SEM_KICKOFF"
}

/**
 * Calcula quantos dias o cliente está em implantação.
 * Conta a partir da data de cadastro.
 */
export function calcularDiasImplantacao(c: ClienteBruto): number {
  if (!c.datacadastro) return 0
  const inicio = new Date(c.datacadastro).getTime()
  const hoje   = Date.now()
  return Math.floor((hoje - inicio) / 86_400_000)
}

/**
 * Retorna o status de prazo baseado nos dias de implantação.
 */
export function calcularStatusPrazo(dias: number): StatusPrazo {
  if (dias >= PRAZO_MAXIMO_DIAS)     return "FORA_DO_PRAZO"
  if (dias >= PRAZO_PRIORIDADE_DIAS) return "PRIORIDADE"
  return "OK"
}

/**
 * Retorna o status geral do cliente (usado nos badges da tabela).
 */
export function calcularStatusCliente(c: ClienteBruto, dias: number): StatusCliente {
  if (c.bloqueaprazo)             return "CANCELADO"
  if (c.etapasuportedefinitivo)   return "CONCLUIDO"
  if (dias >= PRAZO_PRIORIDADE_DIAS) return "ATRASADO"
  return "ATIVO"
}

/**
 * Monta o endereço completo do cliente a partir dos campos separados.
 */
export function montarEndereco(c: ClienteBruto): string {
  return [c.logradouro, c.numero, c.bairro, c.cidade, c.uf]
    .filter(Boolean)
    .join(", ")
}

/**
 * Monta o telefone formatado com DDD.
 */
export function montarTelefone(c: ClienteBruto): string {
  if (c.ddd && c.telefone) return `(${c.ddd}) ${c.telefone}`
  return c.telefone ?? ""
}