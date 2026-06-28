# Dashboard de Implantações — Athos

Dashboard para acompanhar clientes em processo de implantação, do cadastro até o suporte definitivo.

---

## O que é

O dashboard mostra:

- KPIs do mês (vendidos, implantados, cancelados, fora do prazo, etc.)
- Gráfico de etapas (pizza) dos clientes em implantação
- Relatório anual mês a mês
- Lista de clientes com filtros e detalhes de cada um (histórico semanal de acompanhamento)

---

## Como instalar em outro computador

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [PostgreSQL](https://www.postgresql.org/) instalado, com o banco e as tabelas já criadas

### Passo a passo

```bash
# 1. Clonar o projeto
git clone https://github.com/Dinizim/dashboard_implatacao.git
cd seu-repositorio

# 2. Instalar as dependências
npm install

# 3. Rodar o projeto
npm run dev
```

Depois acesse: http://localhost:3000

---

## Onde fica a configuração do banco de dados

Arquivo: **`lib/db.ts`**

```ts
import { Pool } from "pg"

export const db = new Pool({
  host: "localhost",
  database: "nome_do_banco",
  user: "postgres",
  password: "sua_senha",
  port: 5432, // confira a porta do seu Postgres
})
```

Antes de rodar em um novo computador, é só trocar `database`, `user`, `password` e `port` pelos dados do Postgres dessa máquina.

---

## Onde ficam as queries (consultas ao banco)

Todas as queries SQL estão dentro da pasta **`app/api/`**, uma subpasta por consulta:

| Pasta | O que faz |
|---|---|
| `app/api/kpis/route.ts` | Calcula os 8 KPIs do mês (vendidos, implantados, cancelados, etc.) |
| `app/api/etapas/route.ts` | Conta os clientes por etapa, para o gráfico de pizza |
| `app/api/clientes-viewer/route.ts` | Busca a lista de clientes de um KPI ou etapa específica |
| `app/api/cliente-historico/route.ts` | Busca o histórico semanal de um cliente (kick-off, semana 1 a 8, etc.) |
| `app/api/relatorio-anual/route.ts` | Monta a tabela do relatório anual mês a mês |
| `app/api/kpis-anuais/route.ts` | Calcula os 4 KPIs do card anual |

Para mudar qualquer regra de negócio (ex: o que conta como "fora do prazo"), é nesses arquivos que se edita a query SQL.
