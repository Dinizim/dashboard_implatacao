/**
 * Queries de clientes
 *
 * Centraliza os SELECTs do banco. As funções aqui retornam dados BRUTOS —
 * sem nenhuma regra de negócio aplicada. A interpretação fica em lib/domain/.
 */

import { db } from "../db"

// ─────────────────────────────────────────────
// SELECT base — campos que todas as queries precisam
// ─────────────────────────────────────────────
const SELECT_CLIENTE_BASE = `
  SELECT
    c.idcliente,
    c.nomecliente,
    c.revendanome,
    c.cnpj,
    c.quantidadelicenca,
    c.logradouro,
    c.numero,
    c.bairro,
    c.cidade,
    c.uf,
    c.ddd,
    c.telefone,
    c.datacadastro,
    c.dataassinaturacontrato,
    c.etapakickoff,
    c.etapainstalacao,
    c.etapacadastro,
    c.etapavendas,
    c.etapasuportedefinitivo,
    c.bloqueaprazo,
    c.dataetapakickoff,
    c.dataetapainstalacao,
    c.dataetapacadastro,
    c.dataetapavendas,
    c.datasuportedefinitivo,
    CURRENT_DATE - c.datacadastro AS dias
  FROM implantacao_ativa c
`

// ─────────────────────────────────────────────
// Período: clientes cadastrados entre duas datas
// ─────────────────────────────────────────────
export async function buscarClientesPorPeriodo(dataInicio: string, dataFim: string) {
  const result = await db.query(
    `${SELECT_CLIENTE_BASE}
     WHERE c.datacadastro BETWEEN $1 AND $2
     ORDER BY dias DESC`,
    [dataInicio, dataFim]
  )
  return result.rows
}

// ─────────────────────────────────────────────
// Ano: clientes cadastrados no ano + atrasados de anos anteriores
// ─────────────────────────────────────────────
export async function buscarClientesPorAno() {
  const result = await db.query(
    `${SELECT_CLIENTE_BASE}
     WHERE
       EXTRACT(YEAR FROM c.datacadastro) = EXTRACT(YEAR FROM CURRENT_DATE)
       OR (c.etapasuportedefinitivo = false AND c.dataassinaturacontrato IS NOT NULL)
     ORDER BY dias DESC`
  )
  return result.rows
}

// ─────────────────────────────────────────────
// Por etapa: clientes em uma etapa específica do funil
// ─────────────────────────────────────────────
export async function buscarClientesPorEtapa(etapa: string) {
  const condicoes: Record<string, string> = {
    "Kickoff Realizados":      "c.etapakickoff = true AND c.etapainstalacao = false AND c.etapasuportedefinitivo = false",
    "Instalação/Configuração": "c.etapainstalacao = true AND c.etapacadastro = false AND c.etapasuportedefinitivo = false",
    "Treinamento Cadastro":    "c.etapacadastro = true AND c.etapavendas = false AND c.etapasuportedefinitivo = false",
    "Trein. Vendas":           "c.etapavendas = true AND c.etapasuportedefinitivo = false",
    "Implantações Atrasadas":  "c.etapasuportedefinitivo = false AND (c.bloqueaprazo = false OR c.bloqueaprazo IS NULL) AND (CURRENT_DATE - c.datacadastro) >= 40",
  }

  const condicao = condicoes[etapa]
  if (!condicao) return []

  const result = await db.query(
    `${SELECT_CLIENTE_BASE}
     WHERE c.dataassinaturacontrato IS NOT NULL AND ${condicao}
     ORDER BY dias DESC`
  )
  return result.rows
}

// ─────────────────────────────────────────────
// Por KPI: clientes de um grupo específico do dashboard
// ─────────────────────────────────────────────
export async function buscarClientesPorKpi(
  kpi: string,
  dataInicio: string,
  dataFim: string
) {
  const queries: Record<string, { sql: string; params: string[] }> = {
    vendidos: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.dataassinaturacontrato IS NOT NULL ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
    implantados: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.dataetapainstalacao IS NOT NULL ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
    sem_kickoff: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.dataassinaturacontrato IS NOT NULL AND c.etapakickoff = false ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
    cancelados: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.bloqueaprazo = true ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
    suporte_definitivo: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.etapasuportedefinitivo = true ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
    fora_prazo: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.dataassinaturacontrato IS NOT NULL AND c.etapasuportedefinitivo = false AND (c.bloqueaprazo = false OR c.bloqueaprazo IS NULL) AND (CURRENT_DATE - c.datacadastro) >= 40 ORDER BY dias DESC`,
      params: [],
    },
    dentro_prazo: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.dataassinaturacontrato IS NOT NULL AND c.etapasuportedefinitivo = false AND (c.bloqueaprazo = false OR c.bloqueaprazo IS NULL) AND (CURRENT_DATE - c.datacadastro) < 40 ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
    nao_assinado: {
      sql: `${SELECT_CLIENTE_BASE} WHERE c.datacadastro BETWEEN $1 AND $2 AND c.dataassinaturacontrato IS NULL ORDER BY dias DESC`,
      params: [dataInicio, dataFim],
    },
  }

  const q = queries[kpi]
  if (!q) return []

  const result = await db.query(q.sql, q.params)
  return result.rows
}

// ─────────────────────────────────────────────
// SLA: clientes ativos (ainda sem suporte definitivo) para cálculo de SLA
// ─────────────────────────────────────────────
export async function buscarClientesAtivosParaSla() {
  const result = await db.query(
    `${SELECT_CLIENTE_BASE}
     WHERE c.dataassinaturacontrato IS NOT NULL
       AND c.etapasuportedefinitivo = false
       AND (c.bloqueaprazo = false OR c.bloqueaprazo IS NULL)
     ORDER BY dias DESC`
  )
  return result.rows
}

// ─────────────────────────────────────────────
// Um cliente específico (usado no histórico/SLA do modal)
// ─────────────────────────────────────────────
export async function buscarClientePorId(idcliente: number) {
  const result = await db.query(
    `${SELECT_CLIENTE_BASE} WHERE c.idcliente = $1`,
    [idcliente]
  )
  return result.rows[0] ?? null
}
