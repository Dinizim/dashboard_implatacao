/**
 * GET /api/relatorio-anual?ano=2026
 *
 * Retorna os dados mês a mês do ano informado para a tabela estilo planilha.
 * Inclui vendas, etapas, cancelamentos, totais e déficit por mês.
 */

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { REVENDAS_PERMITIDAS, placeholdersRevendas } from "@/lib/domain/revendas"

const MESES = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ano = searchParams.get("ano")

  if (!ano || isNaN(Number(ano))) {
    return Response.json({ error: "Parâmetro 'ano' é obrigatório e deve ser numérico" }, { status: 400 })
  }

  try {
    const result = await db.query(`
      SELECT
        EXTRACT(MONTH FROM datacadastro) AS mes,
        COUNT(*)                                                                                                        AS qtd_vendas,
        COUNT(CASE WHEN dataassinaturacontrato IS NOT NULL AND etapakickoff = false THEN 1 END)                         AS qtd_sem_etapa,
        COUNT(CASE WHEN bloqueaprazo = true THEN 1 END)                                                                AS qtd_cancelados,
        COUNT(CASE WHEN etapakickoff = true  AND etapainstalacao = false AND etapasuportedefinitivo = false THEN 1 END) AS kickoff,
        COUNT(CASE WHEN etapainstalacao = true AND etapacadastro = false AND etapasuportedefinitivo = false THEN 1 END) AS instalacao,
        COUNT(CASE WHEN etapacadastro = true  AND etapavendas = false    AND etapasuportedefinitivo = false THEN 1 END) AS t_cadastro,
        COUNT(CASE WHEN etapavendas = true    AND etapasuportedefinitivo = false THEN 1 END)                           AS t_vendas,
        COUNT(CASE WHEN etapasuportedefinitivo = true THEN 1 END)                                                      AS sup_definitivo
      FROM cliente
      WHERE EXTRACT(YEAR FROM datacadastro) = $1
        AND revendanome IN (${placeholdersRevendas(1)})
      GROUP BY EXTRACT(MONTH FROM datacadastro)
      ORDER BY mes
    `, [ano, ...REVENDAS_PERMITIDAS])

    const porMes: Record<number, Record<string, string | number | null>> = {}
    result.rows.forEach(r => { porMes[Number(r.mes)] = r })

    const linhas = MESES.map((label, i) => {
      const mes = i + 1
      const d   = porMes[mes] ?? {}

      const n = (campo: string) => Number(d[campo]) || 0

      const totalImplantacoes = n("kickoff") + n("instalacao") + n("t_cadastro") + n("t_vendas") + n("sup_definitivo")
      const deficit           = n("qtd_vendas") - totalImplantacoes

      return {
        mes,
        label,
        qtdVendas:          n("qtd_vendas"),
        qtdSemEtapa:        n("qtd_sem_etapa"),
        qtdCancelados:      n("qtd_cancelados"),
        kickoff:            n("kickoff"),
        instalacao:         n("instalacao"),
        tCadastro:          n("t_cadastro"),
        tVendas:            n("t_vendas"),
        supDefinitivo:      n("sup_definitivo"),
        totalImplantacoes,
        deficit,
      }
    })

    const totais = linhas.reduce(
      (acc, l) => ({
        qtdVendas:          acc.qtdVendas         + l.qtdVendas,
        qtdSemEtapa:        acc.qtdSemEtapa        + l.qtdSemEtapa,
        qtdCancelados:      acc.qtdCancelados      + l.qtdCancelados,
        kickoff:            acc.kickoff            + l.kickoff,
        instalacao:         acc.instalacao         + l.instalacao,
        tCadastro:          acc.tCadastro          + l.tCadastro,
        tVendas:            acc.tVendas            + l.tVendas,
        supDefinitivo:      acc.supDefinitivo      + l.supDefinitivo,
        totalImplantacoes:  acc.totalImplantacoes  + l.totalImplantacoes,
        deficit:            acc.deficit            + l.deficit,
      }),
      { qtdVendas: 0, qtdSemEtapa: 0, qtdCancelados: 0, kickoff: 0,
        instalacao: 0, tCadastro: 0, tVendas: 0, supDefinitivo: 0,
        totalImplantacoes: 0, deficit: 0 }
    )

    return Response.json({ linhas, totais })
  } catch (error) {
    console.error("[/api/relatorio-anual]", error)
    return Response.json({ error: "Erro interno ao buscar relatório anual" }, { status: 500 })
  }
}
