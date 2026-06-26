import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT
        idcliente, nomecliente, cnpj, logradouro, numero, bairro, cidade, uf, ddd, telefone,
        datacadastro, dataassinaturacontrato,
        dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
        etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
        bloqueaprazo,
        CURRENT_DATE - datacadastro AS dias
      FROM cliente
      WHERE
        -- Todos os clientes do ano atual
        EXTRACT(YEAR FROM datacadastro) = EXTRACT(YEAR FROM CURRENT_DATE)
        OR
        -- + clientes de anos anteriores que ainda não assinaram suporte definitivo
        (etapasuportedefinitivo = false AND dataassinaturacontrato IS NOT NULL)
      ORDER BY dias DESC
    `)

    const clientes = result.rows.map(c => {
      const dias = parseInt(c.dias) || 0

      let status: "ATIVO" | "CANCELADO" | "CONCLUIDO" | "ATRASADO" = "ATIVO"
      if (c.bloqueaprazo) status = "CANCELADO"
      else if (c.etapasuportedefinitivo) status = "CONCLUIDO"
      else if (dias >= 40) status = "ATRASADO"

      const etapaAtual =
        c.etapasuportedefinitivo ? "Suporte Definitivo" :
        c.etapavendas            ? "Trein. Vendas" :
        c.etapacadastro          ? "Treinamento Cadastro" :
        c.etapainstalacao        ? "Instalação/Configuração" :
        c.etapakickoff           ? "Kickoff Realizado" :
        "Sem Kickoff"

      const endereco = [c.logradouro, c.numero, c.bairro, c.cidade, c.uf]
        .filter(Boolean).join(", ")

      const telefone = c.ddd && c.telefone ? `(${c.ddd}) ${c.telefone}` : ""

      return {
        codigo: String(c.idcliente),
        nome: c.nomecliente,
        cnpj: c.cnpj || "",
        endereco,
        telefone,
        dataCad: c.datacadastro,
        dataApro: "",
        dataAss: c.dataassinaturacontrato,
        data1Mensalidade: "",
        kickoff: c.dataetapakickoff,
        dataInst: c.dataetapainstalacao,
        treinamentoCadastro: c.dataetapacadastro,
        treinamentoVendas: c.dataetapavendas,
        supDef: c.datasuportedefinitivo,
        etapaAtual,
        status,
        diasImplantacao: dias,
        dentroDoProazo: dias >= 40 ? "FORA" : "DENTRO",
      }
    })

    return Response.json({ clientes })

  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}