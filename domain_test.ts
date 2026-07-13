/**
 * Testes das funções de domínio
 *
 * Execute com: npx ts-node tests/domain.test.ts
 * (não precisa de banco — as funções são puras)
 */

import {
  calcularEtapaAtual,
  calcularDiasImplantacao,
  calcularStatusPrazo,
  calcularStatusCliente,
  type ClienteBruto,
} from "@/lib/domain/cliente"

import { parsearHistorico } from "@/lib/domain/historico"
import { placeholdersRevendas, REVENDAS_PERMITIDAS } from "@/lib/domain/revendas"

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

let passou = 0
let falhou = 0

function assert(descricao: string, condicao: boolean) {
  if (condicao) {
    console.log(`  ✅ ${descricao}`)
    passou++
  } else {
    console.error(`  ❌ ${descricao}`)
    falhou++
  }
}

function clienteBase(overrides: Partial<ClienteBruto> = {}): ClienteBruto {
  return {
    idcliente: 1,
    nomecliente: "Teste LTDA",
    revendanome: "SISTEMA ATHOS SJC",
    datacadastro: new Date().toISOString().split("T")[0],
    dataassinaturacontrato: null,
    etapakickoff: false,
    etapainstalacao: false,
    etapacadastro: false,
    etapavendas: false,
    etapasuportedefinitivo: false,
    dataetapakickoff: null,
    dataetapainstalacao: null,
    dataetapacadastro: null,
    dataetapavendas: null,
    datasuportedefinitivo: null,
    bloqueaprazo: null,
    cnpj: null,
    logradouro: null,
    numero: null,
    bairro: null,
    cidade: null,
    uf: null,
    ddd: null,
    telefone: null,
    ...overrides,
  }
}

// ─────────────────────────────────────────────
// calcularEtapaAtual
// ─────────────────────────────────────────────

console.log("\n▶ calcularEtapaAtual")

assert(
  "sem nenhuma etapa → SEM_KICKOFF",
  calcularEtapaAtual(clienteBase()) === "SEM_KICKOFF"
)

assert(
  "só kickoff → KICKOFF",
  calcularEtapaAtual(clienteBase({ etapakickoff: true })) === "KICKOFF"
)

assert(
  "kickoff + instalacao → INSTALACAO",
  calcularEtapaAtual(clienteBase({ etapakickoff: true, etapainstalacao: true })) === "INSTALACAO"
)

assert(
  "kickoff + instalacao + cadastro → CADASTRO",
  calcularEtapaAtual(clienteBase({ etapakickoff: true, etapainstalacao: true, etapacadastro: true })) === "CADASTRO"
)

assert(
  "todas as etapas → DEFINITIVO",
  calcularEtapaAtual(clienteBase({
    etapakickoff: true, etapainstalacao: true,
    etapacadastro: true, etapavendas: true, etapasuportedefinitivo: true,
  })) === "DEFINITIVO"
)

// ─────────────────────────────────────────────
// calcularStatusPrazo
// ─────────────────────────────────────────────

console.log("\n▶ calcularStatusPrazo")

assert("0 dias → OK",           calcularStatusPrazo(0)  === "OK")
assert("39 dias → OK",          calcularStatusPrazo(39) === "OK")
assert("40 dias → PRIORIDADE",  calcularStatusPrazo(40) === "PRIORIDADE")
assert("59 dias → PRIORIDADE",  calcularStatusPrazo(59) === "PRIORIDADE")
assert("60 dias → FORA_DO_PRAZO", calcularStatusPrazo(60) === "FORA_DO_PRAZO")
assert("100 dias → FORA_DO_PRAZO", calcularStatusPrazo(100) === "FORA_DO_PRAZO")

// ─────────────────────────────────────────────
// calcularStatusCliente
// ─────────────────────────────────────────────

console.log("\n▶ calcularStatusCliente")

assert(
  "bloqueaprazo → CANCELADO independente dos dias",
  calcularStatusCliente(clienteBase({ bloqueaprazo: true }), 5) === "CANCELADO"
)

assert(
  "suporte definitivo → CONCLUIDO",
  calcularStatusCliente(clienteBase({ etapasuportedefinitivo: true }), 10) === "CONCLUIDO"
)

assert(
  "40+ dias sem definitivo → ATRASADO",
  calcularStatusCliente(clienteBase(), 40) === "ATRASADO"
)

assert(
  "menos de 40 dias sem definitivo → ATIVO",
  calcularStatusCliente(clienteBase(), 10) === "ATIVO"
)

// ─────────────────────────────────────────────
// parsearHistorico
// ─────────────────────────────────────────────

console.log("\n▶ parsearHistorico")

const registrosFake = [
  { descricao: "Observações kick-off/Primeiro contato: Kick-off realizado com sucesso", datahistorico: "2026-05-01", solucao: false },
  { descricao: "Semana 1: Instalação concluída", datahistorico: "2026-05-08", solucao: false },
  { descricao: "Semana 2: Treinamento de cadastro", datahistorico: "2026-05-15", solucao: false },
  { descricao: "Observações Gerais: Tudo ok, cliente engajado", datahistorico: "2026-05-20", solucao: false },
  { descricao: "Implantação Finalizada: Suporte definitivo assinado", datahistorico: "2026-05-22", solucao: true },
]

const historico = parsearHistorico(registrosFake)

assert("kickoff foi parseado",                  historico.kickoff !== null)
assert("kickoff contém a observação correta",   historico.kickoff?.observacao === "Kick-off realizado com sucesso")
assert("semana 1 foi parseada",                 historico.semanas[1] !== undefined)
assert("semana 2 foi parseada",                 historico.semanas[2] !== undefined)
assert("semana 3 não existe (sem registro)",    historico.semanas[3] === undefined)
assert("observações gerais foram parseadas",    historico.observacoesGerais !== null)
assert("implantação marcada como finalizada",   historico.implantacaoFinalizada === true)

// ─────────────────────────────────────────────
// placeholdersRevendas
// ─────────────────────────────────────────────

console.log("\n▶ placeholdersRevendas")

const ph0 = placeholdersRevendas(0)
const ph2 = placeholdersRevendas(2)

assert(
  "offset 0 → começa em $1",
  ph0.startsWith("$1,")
)

assert(
  "offset 2 → começa em $3",
  ph2.startsWith("$3,")
)

assert(
  "gera o número correto de placeholders",
  ph0.split(",").length === REVENDAS_PERMITIDAS.length
)

// ─────────────────────────────────────────────
// Resultado final
// ─────────────────────────────────────────────

console.log(`\n${"─".repeat(40)}`)
console.log(`Resultado: ${passou} passaram, ${falhou} falharam`)
if (falhou === 0) {
  console.log("✅ Todos os testes passaram!\n")
} else {
  console.log("❌ Alguns testes falharam. Verifique acima.\n")
  process.exit(1)
}