import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const filtro     = searchParams.get("filtro")
  const dataInicio = searchParams.get("inicio")
  const dataFim    = searchParams.get("fim")

  if (!filtro || !dataInicio || !dataFim) {
    return Response.json({ error: "Parâmetros obrigatórios" }, { status: 400 })
  }

  try {
    let query = ""

    switch (filtro) {
      case "vendidos":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND dataassinaturacontrato IS NOT NULL
          ORDER BY dias DESC
        `
        break

      case "implantados":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND dataetapainstalacao IS NOT NULL
          ORDER BY dias DESC
        `
        break

      case "sem_kickoff":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND dataassinaturacontrato IS NOT NULL
            AND etapakickoff = false
          ORDER BY dias DESC
        `
        break

      case "cancelados":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND bloqueaprazo = true
          ORDER BY dias DESC
        `
        break

      case "suporte_definitivo":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND etapasuportedefinitivo = true
          ORDER BY dias DESC
        `
        break

      case "fora_prazo":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE dataassinaturacontrato IS NOT NULL
            AND etapasuportedefinitivo = false
            AND (bloqueaprazo = false OR bloqueaprazo IS NULL)
            AND (CURRENT_DATE - datacadastro) >= 40
          ORDER BY dias DESC
        `
        break

      case "dentro_prazo":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND dataassinaturacontrato IS NOT NULL
            AND etapasuportedefinitivo = false
            AND (bloqueaprazo = false OR bloqueaprazo IS NULL)
            AND (CURRENT_DATE - datacadastro) < 40
          ORDER BY dias DESC
        `
        break

      case "nao_assinado":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE datacadastro BETWEEN $1 AND $2
            AND dataassinaturacontrato IS NULL
          ORDER BY dias DESC
        `
        break

      // Etapas do gráfico de pizza
      case "Kickoff Realizados":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE dataassinaturacontrato IS NOT NULL
            AND etapakickoff = true AND etapainstalacao = false
            AND etapasuportedefinitivo = false
          ORDER BY dias DESC
        `
        break

      case "Instalação/Configuração":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE dataassinaturacontrato IS NOT NULL
            AND etapainstalacao = true AND etapacadastro = false
            AND etapasuportedefinitivo = false
          ORDER BY dias DESC
        `
        break

      case "Treinamento Cadastro":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE dataassinaturacontrato IS NOT NULL
            AND etapacadastro = true AND etapavendas = false
            AND etapasuportedefinitivo = false
          ORDER BY dias DESC
        `
        break

      case "Trein. Vendas":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE dataassinaturacontrato IS NOT NULL
            AND etapavendas = true
            AND etapasuportedefinitivo = false
          ORDER BY dias DESC
        `
        break

      case "Implantações Atrasadas":
        query = `
          SELECT idcliente, nomecliente, datacadastro, dataassinaturacontrato,
            etapakickoff, etapainstalacao, etapacadastro, etapavendas, etapasuportedefinitivo,
            dataetapakickoff, dataetapainstalacao, dataetapacadastro, dataetapavendas, datasuportedefinitivo,
            CURRENT_DATE - datacadastro AS dias
          FROM cliente
          WHERE dataassinaturacontrato IS NOT NULL
            AND etapasuportedefinitivo = false
            AND (bloqueaprazo = false OR bloqueaprazo IS NULL)
            AND (CURRENT_DATE - datacadastro) >= 40
          ORDER BY dias DESC
        `
        break

      default:
        return Response.json({ clientes: [] })
    }

    // Etapas que NÃO usam $1 e $2
  const etapasSemParametro = [
  "Kickoff Realizados",
  "Instalação/Configuração", 
  "Treinamento Cadastro",
  "Trein. Vendas",
  "Implantações Atrasadas",
]

const params = etapasSemParametro.includes(filtro) ? [] : [dataInicio, dataFim]

const result = await db.query(query, params)

    const clientes = result.rows.map(c => ({
      codigo:    String(c.idcliente),
      nome:      c.nomecliente,
      dias:      parseInt(c.dias) || 0,
      assinatura: c.dataassinaturacontrato,
      kickoff:   c.dataetapakickoff,
      instalacao: c.dataetapainstalacao,
      cadastro:  c.dataetapacadastro,
      vendas:    c.dataetapavendas,
      supDef:    c.datasuportedefinitivo,
      etapaAtual:
        c.etapasuportedefinitivo ? "Suporte Definitivo" :
        c.etapavendas            ? "Trein. Vendas" :
        c.etapacadastro          ? "Treinamento Cadastro" :
        c.etapainstalacao        ? "Instalação/Configuração" :
        c.etapakickoff           ? "Kickoff Realizado" :
        "Sem Kickoff",
    }))

    return Response.json({ clientes })

  } catch (error) {
    console.error(error)
    return Response.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}