/**
 * Parser do histórico de implantação
 *
 * Os registros de histórico seguem um padrão textual:
 *   "Observações kick-off/Primeiro contato: ..."
 *   "Semana 1: ..."
 *   "Semana 2: ..."
 *   "Observações Gerais: ..."
 *   "Implantação Finalizada: ..."
 *
 * Este módulo lê esses textos e os organiza em uma estrutura tipada.
 */

export type RegistroHistorico = {
  descricao: string
  datahistorico: string
  solucao: boolean
}

export type Semana = {
  data: string
  observacao: string
}

export type HistoricoImplantacao = {
  kickoff: Semana | null
  semanas: Record<number, Semana>
  observacoesGerais: Semana | null
  implantacaoFinalizada: boolean
}

/**
 * Extrai o texto após o primeiro ":" de uma string.
 * Usado para remover o  "Semana 1:", "Observações Gerais:", etc.
 */
function extrairObservacao(texto: string): string {
  return texto.split(":").slice(1).join(":").trim()
}

/**
 * Processa a lista de registros brutos do banco e retorna
 * o histórico estruturado por seções (kickoff, semanas, etc.)
 */
export function parsearHistorico(registros: RegistroHistorico[]): HistoricoImplantacao {
  let kickoff: Semana | null = null
  const semanas: Record<number, Semana> = {}
  let observacoesGerais: Semana | null = null
  let implantacaoFinalizada = false

  for (const r of registros) {
    const texto = r.descricao ?? ""
    const data  = r.datahistorico

    // Kick-off / primeiro contato
    if (/observa[çc][õo]es kick-?off|primeiro contato/i.test(texto)) {
      kickoff = { data, observacao: extrairObservacao(texto) }
      continue
    }

    // Semana N
    const matchSemana = texto.match(/semana\s*(\d+)/i)
    if (matchSemana) {
      const numero = parseInt(matchSemana[1])
      semanas[numero] = { data, observacao: extrairObservacao(texto) }
      continue
    }

    // Observações gerais
    if (/observa[çc][õo]es gerais/i.test(texto)) {
      observacoesGerais = { data, observacao: extrairObservacao(texto) }
      continue
    }

    // Implantação finalizada
    if (/implanta[çc][ãa]o finalizada/i.test(texto) || r.solucao === true) {
      implantacaoFinalizada = true
    }
  }

  return { kickoff, semanas, observacoesGerais, implantacaoFinalizada }
}