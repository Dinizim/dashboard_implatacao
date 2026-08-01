# Briefing do Projeto — Dashboard de Implantações SJC

Este arquivo é um guia para o Claude Code entender o contexto, as decisões já tomadas
e o que precisa ser feito a seguir. Leia antes de fazer qualquer alteração.

---

## O que é o projeto

Dashboard comercial/operacional em **Next.js 15** com **PostgreSQL** para acompanhar
clientes desde a entrada na implantação até o suporte definitivo, com foco na operação de SJC.

**Fluxo de implantação:**
```
Venda/Cadastro → Kick-off → Instalação/Config → Trein. Cadastro → Trein. Vendas → Suporte Definitivo
```

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts
- **Banco:** PostgreSQL (hospedado no Neon) via driver `pg`
- **Ícones:** Lucide React

---

## Estrutura de pastas relevante

```
lib/
├── db.ts                      ← conexão com o banco (usa process.env.DATABASE_URL)
├── domain/
│   ├── revendas.ts            ← lista de revendas autorizadas + placeholdersRevendas()
│   ├── cliente.ts             ← REGRAS DE NEGÓCIO: etapa, prazo, status, endereço
│   ├── labels.ts              ← textos de exibição (ETAPA_LABEL, STATUS_LABEL, PRAZO_LABEL)
│   └── historico.ts           ← parser do texto de acompanhamento semanal
└── queries/
    ├── clientes.ts            ← SELECTs de clientes (dados brutos, sem regra)
    └── ocorrencias.ts         ← SELECTs de ocorrência e histórico

app/
├── types/
│   ├── dashboard.ts           ← tipo FiltroAtivo
│   └── cliente.ts             ← tipo Cliente
├── api/
│   ├── kpis/route.ts          ← KPIs mensais (?inicio=&fim=)
│   ├── etapas/route.ts        ← gráfico de pizza (?inicio=&fim=)
│   ├── clientes-viewer/route.ts  ← drill-down (?filtro=&inicio=&fim=)
│   ├── clientes-pagina/route.ts  ← listagem completa (sem params)
│   ├── cliente-historico/route.ts ← histórico semanal (?idcliente=)
│   ├── relatorio-anual/route.ts  ← tabela anual (?ano=)
│   └── kpis-anuais/route.ts      ← KPIs anuais (?ano=)
├── page.tsx                   ← dashboard principal
└── clientes/page.tsx          ← listagem de clientes

components/
├── chart/index.tsx            ← gráfico de pizza das etapas (Recharts)
├── Viewer.tsx                 ← painel de drill-down lateral
├── ClienteViewer.tsx          ← modal de detalhes do cliente
└── RelatorioAnualTable.tsx    ← tabela anual estilo planilha
```

---

## Regras de negócio importantes (NÃO altere sem entender)

### Filtro de revendas
A aplicação SÓ mostra clientes das revendas listadas em `lib/domain/revendas.ts`.
O banco tem uma VIEW chamada `implantacao_ativa` que já aplica esse filtro.
Todas as queries usam essa view em vez da tabela `cliente` diretamente.

### Etapa atual
Definida em `lib/domain/cliente.ts → calcularEtapaAtual()`.
É a etapa mais avançada já concluída pelo cliente (flags booleanas no banco).
```
SEM_KICKOFF → KICKOFF → INSTALACAO → CADASTRO → VENDAS → DEFINITIVO
```

### Prazo
- Até 39 dias → OK (azul)
- 40 a 59 dias → PRIORIDADE (amarelo)
- 60+ dias → FORA_DO_PRAZO (vermelho)
Definido em `lib/domain/cliente.ts → PRAZO_PRIORIDADE_DIAS` e `PRAZO_MAXIMO_DIAS`.

### Grupos de clientes no dashboard
- **PERIODO** → cadastrados no intervalo de datas selecionado
- **ATRASADO** → cadastrados antes do período, ainda sem suporte definitivo
- **NAO_ASSINADO** → cadastrados sem `dataassinaturacontrato`

### Histórico semanal
Os registros em `descricao_historico` seguem um padrão textual:
```
"Observações kick-off/Primeiro contato: ..."
"Semana 1: ..."
"Semana 2: ..."
"Observações Gerais: ..."
"Implantação Finalizada: ..."
```
O parser está em `lib/domain/historico.ts → parsearHistorico()`.

---

## Variáveis de ambiente necessárias

```
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
```

---

## O que precisa ser feito agora — PRÓXIMA FEATURE: SLA por etapa

### Contexto
O gestor quer saber se cada etapa está dentro do prazo definido.
Cada transição entre etapas tem um SLA (tempo máximo em horas).

### Fluxo com SLA
```
Assinatura →[SLA]→ Kick-off →[SLA]→ Instalação →[SLA]→ Trein.Cadastro →[SLA]→ Trein.Vendas →[SLA]→ Sup.Definitivo
```

### O que já existe no banco para calcular
Todos os campos de data já existem na tabela `cliente`:
- `dataassinaturacontrato` → início do fluxo
- `dataetapakickoff`       → quando o kick-off foi realizado
- `dataetapainstalacao`    → quando a instalação foi realizada
- `dataetapacadastro`      → quando o trein. cadastro foi realizado
- `dataetapavendas`        → quando o trein. vendas foi realizado
- `datasuportedefinitivo`  → quando o suporte definitivo foi assinado

### O que precisa ser criado

**1. `lib/domain/sla.ts`** — arquivo novo com as regras de SLA:
```ts
// SLA em HORAS para cada etapa
export const SLA_HORAS = {
  KICKOFF:    48,   // da assinatura ao kick-off
  INSTALACAO: 72,   // do kick-off à instalação
  CADASTRO:   96,   // da instalação ao trein. cadastro
  VENDAS:     96,   // do cadastro ao trein. vendas
  DEFINITIVO: 48,   // das vendas ao suporte definitivo
}

// Calcula o status do SLA de uma etapa específica
// Retorna: { horasDecorridas, slaHoras, status: "OK" | "RISCO" | "ESTOURADO", concluido }
export function calcularSlaEtapa(dataInicio, dataFim | null) { ... }

// Calcula o SLA de todas as etapas de um cliente
export function calcularSlaPorCliente(clienteBruto) { ... }
```

**2. Atualizar `app/api/cliente-historico/route.ts`**
Incluir o SLA calculado na resposta, para o modal do cliente exibir.

**3. Atualizar `components/ClienteViewer.tsx`**
Na linha do tempo, ao lado de cada etapa, mostrar um badge:
- 🟢 "32h / 48h" — dentro do SLA
- 🟡 "40h / 48h" — em risco (>80% do tempo consumido)
- 🔴 "61h / 48h" — SLA estourado

**4. Novo KPI no dashboard (opcional)**
Card "SLAs em risco" mostrando quantos clientes têm pelo menos uma etapa em risco ou estourada.

### Regra de "em risco"
Considera em risco quando já consumiu mais de 80% do SLA da etapa atual e ainda não concluiu.
```ts
const emRisco = horasDecorridas >= slaHoras * 0.8 && !concluido
const estourado = horasDecorridas >= slaHoras && !concluido
```

---

## Revisões pendentes além do SLA

1. **Erros de build TypeScript** — resolver qualquer erro restante do `npm run build`
2. **`activeIndex` no Recharts** — se der erro de tipo, usar `activeIndex={activeIndex as any}`
3. **Tipo `Cliente`** — garantir que `status: string` está no tipo em `app/types/cliente.ts`

---

## O que NÃO mexer

- `components/` — o frontend está funcionando, não altere a aparência
- `app/page.tsx` e `app/clientes/page.tsx` — páginas funcionando
- Queries SQL existentes — só adicione, não remova
- A VIEW `implantacao_ativa` no banco — não altere sem avisar
