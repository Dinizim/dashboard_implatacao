import { db } from "./db"

export async function getKpisPorPeriodo(dataInicio: string, dataFim: string) {
  const result = await db.query(`
    WITH base AS (
      SELECT
        c.*,

        -- tempo real de implantação (assinatura -> suporte definitivo)
        CASE 
          WHEN c.dataassinaturacontrato IS NOT NULL
           AND c.datasuportedefinitivo IS NOT NULL
          THEN c.datasuportedefinitivo - c.dataassinaturacontrato
        END AS dias_implantacao,

        CASE
          WHEN c.dataassinaturacontrato IS NULL THEN 'NAO_ASSINADO'
          WHEN c.datacadastro BETWEEN $1 AND $2 THEN 'PERIODO'
          WHEN c.etapasuportedefinitivo = false 
               AND c.dataassinaturacontrato IS NOT NULL
               AND c.datacadastro < $1 THEN 'ATRASADO'         
          ELSE 'OUTRO'
        END AS origem

      FROM cliente c
      WHERE c.datacadastro IS NOT NULL
    )

    SELECT *
    FROM base
    WHERE origem != 'OUTRO';
  `, [dataInicio, dataFim])

  const clientes = result.rows

  // =========================
  // 📊 GRUPOS BASE
  // =========================
  const doPeriodo    = clientes.filter(c => c.origem === 'PERIODO')
  const atrasados    = clientes.filter(c => c.origem === 'ATRASADO')
  const naoAssinados = clientes.filter(c => c.origem === 'NAO_ASSINADO')
  const dataInicioDate = new Date(dataInicio)
  const dataFimDate = new Date(dataFim)
  
 const naoAssinadosDoPeriodo = naoAssinados.filter(c => {
  const data = new Date(c.datacadastro)
  return data >= dataInicioDate && data <= dataFimDate
})

  // Implantados = implatação realizada
  const implantados = doPeriodo.filter(c => c.etapainstalacao === true && c.etapasuportedefinitivo === false)
  // Suporte definitivo = chegou no suporte definitivo
  const suporteDefinitivo = doPeriodo.filter(c => c.etapasuportedefinitivo === true)

  const cancelados = doPeriodo.filter(c => c.bloqueaprazo === true)
  // Prazo só conta pra quem implantou
  const dentroPrazo = suporteDefinitivo.filter(c => c.dias_implantacao <= 60 && c.etapasuportedefinitivo === true)
  const foraPrazo   = suporteDefinitivo.filter(c => c.dias_implantacao > 60 && c.etapasuportedefinitivo === true) 

  // Em implantação = assinou mas não finalizou
  const emImplantacao = doPeriodo.filter(c =>
    c.dataassinaturacontrato !== false &&
    c.etapasuportedefinitivo === false
  )

  // Sem kickoff = gargalo inicial
  const semKickoff = emImplantacao.filter(c =>
    c.etapakickoff == false 
  )

  // =========================
  // 📈 LOG (debug)
  // =========================
  console.log("Total clientes:", clientes.length)
  console.log("Do período:", doPeriodo.length)
  console.log("Atrasados:", atrasados.length)
  console.log("Não assinados:", naoAssinados.length)
  console.log("Implantados:", implantados.length)
  console.log("Dentro prazo:", dentroPrazo.length)
  console.log("Fora prazo:", foraPrazo.length)

  // =========================
  // 📦 RETORNO FINAL
  // =========================
  return {
    clientes,
    kpis: {
      vendidos: doPeriodo.length,

      nao_assinado: naoAssinadosDoPeriodo.length,

      em_implantacao: emImplantacao.length,

      implantados: implantados.length,

      dentro_prazo: dentroPrazo.length,

      fora_prazo: foraPrazo.length,

      suporte_definitivo: suporteDefinitivo.length,

      sem_kickoff: semKickoff.length,

      atrasados_anteriores: atrasados.length,

      cancelados: cancelados.length
    }
  }
}




