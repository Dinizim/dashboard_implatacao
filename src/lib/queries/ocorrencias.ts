/**
 * Queries de ocorrências e histórico de implantação
 */

import { db } from "../db"

/**
 * Busca a ocorrência de "Processo de Implantação" de um cliente.
 * Retorna a mais recente caso exista mais de uma.
 */
export async function buscarOcorrenciaImplantacao(idcliente: number) {
  const result = await db.query(
    `SELECT idocorrencia, dataabertura, datafechamento
     FROM ocorrencia
     WHERE idcliente = $1
       AND descricao ILIKE '%Processo de Implantação%'
     ORDER BY dataabertura DESC
     LIMIT 1`,
    [idcliente]
  )
  return result.rows[0] ?? null
}

/**
 * Busca todos os registros do histórico de uma ocorrência,
 * ordenados por data e hora crescente.
 */
export async function buscarHistoricoOcorrencia(idocorrencia: number) {
  const result = await db.query(
    `SELECT iddescricaohistorico, descricao, datahistorico, horahistorico, solucao
     FROM descricao_historico
     WHERE idocorrencia = $1
     ORDER BY datahistorico ASC, horahistorico ASC`,
    [idocorrencia]
  )
  return result.rows
}