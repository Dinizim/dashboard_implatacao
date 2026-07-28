/**
 * GET /api/clientes-pagina
 *
 * Retorna todos os clientes em processo de implantação para a
 * página de listagem completa. Sem parâmetros de período —
 * traz sempre o panorama atual:
 *   - clientes cadastrados no ano corrente
 *   - clientes de anos anteriores que ainda não finalizaram (sem suporte definitivo)
 */

import { buscarClientesPorAno } from "@/lib/queries/clientes"
import {
  calcularEtapaAtual,
  calcularDiasImplantacao,
  calcularStatusCliente,
  montarEndereco,
  montarTelefone,
} from "@/lib/domain/cliente"
import { ETAPA_LABEL, STATUS_LABEL } from "@/lib/domain/labels"

export async function GET() {
  try {
    const brutos = await buscarClientesPorAno()

    const clientes = brutos.map(c => {
      const dias   = calcularDiasImplantacao(c)
      const etapa  = calcularEtapaAtual(c)
      const status = calcularStatusCliente(c, dias)

      return {
        codigo:             String(c.idcliente),
        nome:               c.nomecliente,
        cnpj:               c.cnpj ?? "",
        endereco:           montarEndereco(c),
        telefone:           montarTelefone(c),
        dataCad:            c.datacadastro,
        dataApro:           "",
        dataAss:            c.dataassinaturacontrato,
        data1Mensalidade:   "",
        kickoff:            c.dataetapakickoff,
        dataInst:           c.dataetapainstalacao,
        treinamentoCadastro: c.dataetapacadastro,
        treinamentoVendas:  c.dataetapavendas,
        supDef:             c.datasuportedefinitivo,
        etapaAtual:         ETAPA_LABEL[etapa],
        status:             STATUS_LABEL[status],
        diasImplantacao:    dias,
        dentroDoProazo:     dias >= 40 ? "FORA" : "DENTRO",
      }
    })

    return Response.json({ clientes })
  } catch (error) {
    console.error("[/api/clientes-pagina]", error)
    return Response.json({ error: "Erro interno ao buscar clientes" }, { status: 500 })
  }
}
