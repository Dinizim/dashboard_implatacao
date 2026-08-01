/**
 * Persistência da configuração de SLA (horas por etapa).
 *
 * A tabela `configuracao_sla` é criada sob demanda (não existia no schema
 * original) e semeada com os valores padrão de lib/domain/sla.ts.
 */

import { db } from "../db"
import { EtapaSla, SLA_HORAS_PADRAO, SlaConfig, ETAPAS_SLA_ORDEM } from "@/lib/domain/sla"

let tabelaGarantida = false

async function garantirTabelaSlaConfig() {
  if (tabelaGarantida) return

  await db.query(`
    CREATE TABLE IF NOT EXISTS configuracao_sla (
      etapa varchar(20) PRIMARY KEY,
      horas int NOT NULL
    )
  `)

  const valores = ETAPAS_SLA_ORDEM.flatMap((etapa) => [etapa, SLA_HORAS_PADRAO[etapa]])
  const placeholders = ETAPAS_SLA_ORDEM.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")

  await db.query(
    `INSERT INTO configuracao_sla (etapa, horas) VALUES ${placeholders}
     ON CONFLICT (etapa) DO NOTHING`,
    valores
  )

  tabelaGarantida = true
}

export async function buscarSlaConfig(): Promise<SlaConfig> {
  await garantirTabelaSlaConfig()

  const result = await db.query(`SELECT etapa, horas FROM configuracao_sla`)
  const config: SlaConfig = { ...SLA_HORAS_PADRAO }
  for (const row of result.rows) {
    if (ETAPAS_SLA_ORDEM.includes(row.etapa)) {
      config[row.etapa as EtapaSla] = Number(row.horas)
    }
  }
  return config
}

export async function salvarSlaConfig(config: SlaConfig): Promise<void> {
  await garantirTabelaSlaConfig()

  for (const etapa of ETAPAS_SLA_ORDEM) {
    const horas = config[etapa]
    await db.query(
      `INSERT INTO configuracao_sla (etapa, horas) VALUES ($1, $2)
       ON CONFLICT (etapa) DO UPDATE SET horas = $2`,
      [etapa, horas]
    )
  }
}
