"use client"
import { useState, useEffect, useCallback } from "react"
import { ChartOverview } from "@/components/chart"
import { Viewer } from "@/components/Viewer"
import { RelatorioAnualTable } from "@/components/RelatorioAnualTable/RelatorioAnualTable"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { type FiltroAtivo } from "@/app/types/dashboard"
import {
  Ban, ClipboardPenIcon, Clock, HeadsetIcon, Pen, TimerOff, Users,
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart2, CalendarDays, Loader2
} from "lucide-react"

// ============================================================
// Tipos
// ============================================================
type KpisType = {
  vendidos: number
  implantados: number
  sem_kickoff: number
  suporte_definitivo: number
  fora_prazo: number
  dentro_prazo: number
  cancelados: number
  nao_assinado: number
}

type KpisAnuaisType = {
  vendidos: number
  implantados: number
  pctImplantados: number
  defasagem: number
}

// ============================================================
// Constantes / Helpers
// ============================================================
const kpisZero: KpisType = {
  vendidos: 0, implantados: 0, sem_kickoff: 0, suporte_definitivo: 0,
  fora_prazo: 0, dentro_prazo: 0, cancelados: 0, nao_assinado: 0,
}

const kpisAnuaisZero: KpisAnuaisType = {
  vendidos: 0, implantados: 0, pctImplantados: 0, defasagem: 0,
}

const ANOS_DISPONIVEIS = [2025, 2026]

function hojeISO() {
  return new Date().toISOString().split("T")[0]
}

function primeiroDiaMesISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

const KPIS_MENSAIS_CONFIG = [
  { label: "Clientes Implantados",       chave: "implantados",        icon: Users,            desc: "Total de clientes em implatação no período" },
  { label: "Clientes Vendidos",           chave: "vendidos",           icon: Users,            desc: "Clientes vendidos no período" },
  { label: "Sem Kick Off",                chave: "sem_kickoff",        icon: HeadsetIcon,      desc: "Clientes que ainda não realizaram o kick off" },
  { label: "Cancelamentos",               chave: "cancelados",         icon: Ban,              desc: "Cancelamentos no período" },
  { label: "Em Suportes Definitivos",     chave: "suporte_definitivo", icon: ClipboardPenIcon, desc: "Clientes que assinaram o Suporte Definitivo" },
  { label: "Implantações Fora do Prazo",  chave: "fora_prazo",         icon: TimerOff,         desc: "Clientes fora do prazo" },
  { label: "Implantações Dentro Prazo",   chave: "dentro_prazo",       icon: Clock,            desc: "Clientes dentro do prazo" },
  { label: "Não Assinados",               chave: "nao_assinado",       icon: Pen,              desc: "Clientes que ainda não assinaram" },
]

const ATALHOS_PERIODO = [
  { label: "Este mês", fn: () => ({ inicio: primeiroDiaMesISO(), fim: hojeISO() }) },
  {
    label: "Mês passado",
    fn: () => {
      const d = new Date()
      const ano = d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear()
      const mes = d.getMonth() === 0 ? 12 : d.getMonth()
      const ultimo = new Date(ano, mes, 0).getDate()
      return {
        inicio: `${ano}-${String(mes).padStart(2, "0")}-01`,
        fim: `${ano}-${String(mes).padStart(2, "0")}-${ultimo}`,
      }
    },
  },
  {
    label: "Últimos 70 dias",
    fn: () => {
      const d = new Date()
      d.setDate(d.getDate() - 70)
      return { inicio: d.toISOString().split("T")[0], fim: hojeISO() }
    },
  },
  {
    label: "Este ano",
    fn: () => ({ inicio: `${new Date().getFullYear()}-01-01`, fim: hojeISO() }),
  },
]

// ============================================================
// Componente principal
// ============================================================
export default function Home() {
  // ── Estado: período selecionado ──
  const [dataInicio, setDataInicio] = useState(primeiroDiaMesISO())
  const [dataFim, setDataFim] = useState(hojeISO())

  // ── Estado: KPIs mensais ──
  const [kpis, setKpis] = useState<KpisType>(kpisZero)
  const [loadingKpis, setLoadingKpis] = useState(false)
  const [erroKpis, setErroKpis] = useState("")

  // ── Estado: filtro do Viewer/gráfico de etapas ──
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>({
    tipo: "kpi", label: "Clientes Críticos", chave: "criticos",
  })

  // ── Estado: ano ativo + KPIs anuais ──
  const [anoAtivo, setAnoAtivo] = useState(2026)
  const [kpisAnuais, setKpisAnuais] = useState<KpisAnuaisType>(kpisAnuaisZero)
  const [loadingAnual, setLoadingAnual] = useState(false)

  // ── Busca KPIs mensais ──
  const buscarKpis = useCallback(async () => {
    if (!dataInicio || !dataFim) return
    setLoadingKpis(true)
    setErroKpis("")
    try {
      const res = await fetch(`/api/kpis?inicio=${dataInicio}&fim=${dataFim}`)
      if (!res.ok) throw new Error("Erro na API")
      const data = await res.json()
      setKpis(data.kpis)
    } catch {
      setErroKpis("Não foi possível carregar os dados.")
      setKpis(kpisZero)
    } finally {
      setLoadingKpis(false)
    }
  }, [dataInicio, dataFim])

  useEffect(() => { buscarKpis() }, [buscarKpis])

  // ── Busca KPIs anuais ──
  useEffect(() => {
    setLoadingAnual(true)
    fetch(`/api/kpis-anuais?ano=${anoAtivo}`)
      .then(res => res.json())
      .then(data => setKpisAnuais(data))
      .catch(() => setKpisAnuais(kpisAnuaisZero))
      .finally(() => setLoadingAnual(false))
  }, [anoAtivo])

  const isFiltroAtivo = (chave: string) => filtroAtivo.chave === chave

  const cardsKpisAnuais = [
    { label: "% Implant. / Vendas",   valor: `${kpisAnuais.pctImplantados}%`, desc: "Relação entre implantados e vendidos no ano", icon: TrendingUp,   color: "text-green-600"  },
    { label: "Clientes Vendidos",      valor: kpisAnuais.vendidos,             desc: "Total de clientes vendidos no ano",            icon: Users,        color: "text-blue-600"   },
    { label: "Defasagem das Implant.", valor: `${kpisAnuais.defasagem}%`,      desc: "% de vendas ainda não implantadas",            icon: TrendingDown, color: "text-red-500"    },
    { label: "Implantados no Ano",     valor: kpisAnuais.implantados,          desc: "Total de clientes implantados no ano",         icon: BarChart2,    color: "text-purple-600" },
  ]

  return (
    <main className="sm:ml-14 p-4 space-y-6">

      <SeletorPeriodo
        dataInicio={dataInicio}
        dataFim={dataFim}
        onChangeInicio={setDataInicio}
        onChangeFim={setDataFim}
        onAtalho={(inicio, fim) => { setDataInicio(inicio); setDataFim(fim) }}
        loading={loadingKpis}
        erro={erroKpis}
      />

      <KpisMensais
        kpis={kpis}
        loading={loadingKpis}
        filtroAtivo={filtroAtivo}
        isFiltroAtivo={isFiltroAtivo}
        onSelecionar={(label, chave) => setFiltroAtivo({ tipo: "kpi", label, chave })}
      />

      <section className="flex flex-col md:flex-row gap-4">
        <ChartOverview
          filtroAtivo={filtroAtivo}
          onEtapaClick={(etapa) => setFiltroAtivo({ tipo: "etapa", label: etapa, chave: etapa })}
          dataInicio={dataInicio}
          dataFim={dataFim}
        />
        <Viewer filtro={filtroAtivo} dataInicio={dataInicio} dataFim={dataFim} />
      </section>

      <SecaoAnual
        anoAtivo={anoAtivo}
        anos={ANOS_DISPONIVEIS}
        onChangeAno={setAnoAtivo}
        kpisAnuais={cardsKpisAnuais}
        loading={loadingAnual}
      />

    </main>
  )
}

// ============================================================
// Subcomponente: Seletor de período
// ============================================================
function SeletorPeriodo({
  dataInicio, dataFim, onChangeInicio, onChangeFim, onAtalho, loading, erro,
}: {
  dataInicio: string
  dataFim: string
  onChangeInicio: (v: string) => void
  onChangeFim: (v: string) => void
  onAtalho: (inicio: string, fim: string) => void
  loading: boolean
  erro: string
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-xl p-4">
      <CalendarDays className="h-5 w-5 text-gray-400 mb-1" />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 font-medium">Data início</label>
        <Input type="date" value={dataInicio} onChange={e => onChangeInicio(e.target.value)} className="w-40 text-sm" />
      </div>

      <span className="text-gray-400 mb-1">até</span>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 font-medium">Data fim</label>
        <Input type="date" value={dataFim} onChange={e => onChangeFim(e.target.value)} className="w-40 text-sm" />
      </div>

      <div className="flex gap-2 mb-1 flex-wrap">
        {ATALHOS_PERIODO.map(({ label, fn }) => (
          <button
            key={label}
            onClick={() => { const { inicio, fim } = fn(); onAtalho(inicio, fim) }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-1.5 text-sm text-blue-600 mb-1">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      )}
      {erro && <p className="text-sm text-red-500 mb-1">{erro}</p>}
    </div>
  )
}

// ============================================================
// Subcomponente: Grid de KPIs mensais
// ============================================================
function KpisMensais({
  kpis, loading, isFiltroAtivo, onSelecionar,
}: {
  kpis: KpisType
  loading: boolean
  filtroAtivo: FiltroAtivo
  isFiltroAtivo: (chave: string) => boolean
  onSelecionar: (label: string, chave: string) => void
}) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPIS_MENSAIS_CONFIG.map(({ label, chave, icon: Icon, desc }) => {
        const valor = kpis[chave as keyof KpisType] ?? 0
        const ativo = isFiltroAtivo(chave)
        return (
          <Card
            key={chave}
            onClick={() => onSelecionar(label, chave)}
            className={`
              relative cursor-pointer overflow-hidden transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md
              ${ativo ? "border-2 border-blue-500 bg-blue-50" : "border border-gray-200 hover:border-gray-300"}
            `}
          >
            <CardHeader>
              <div className="flex items-center justify-center">
                <CardTitle className={`text-lg sm:text-xl select-none transition-colors ${ativo ? "text-blue-700" : "text-gray-800"}`}>
                  {label}
                </CardTitle>
                <Icon className={`ml-auto h-4 w-4 transition-colors ${ativo ? "text-blue-500" : "text-gray-400"}`} />
              </div>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold transition-colors ${ativo ? "text-blue-700" : "text-gray-900"}`}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-300" /> : valor}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

// ============================================================
// Subcomponente: Seção anual (navegação + tabela + KPIs)
// ============================================================
function SecaoAnual({
  anoAtivo, anos, onChangeAno, kpisAnuais, loading,
}: {
  anoAtivo: number
  anos: number[]
  onChangeAno: (ano: number) => void
  kpisAnuais: { label: string; valor: string | number; desc: string; icon: any; color: string }[]
  loading: boolean
}) {
  const idx = anos.indexOf(anoAtivo)

  return (
    <section className="mb-4">
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => idx > 0 && onChangeAno(anos[idx - 1])}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
          disabled={idx === 0}
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <span className="text-base font-semibold text-gray-700 min-w-[48px] text-center">{anoAtivo}</span>
        <button
          onClick={() => idx < anos.length - 1 && onChangeAno(anos[idx + 1])}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
          disabled={idx === anos.length - 1}
        >
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
        <span className="text-sm text-gray-400 ml-1">Por Ano</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 lg:max-w-[60%]">
          <RelatorioAnualTable ano={anoAtivo} />
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {kpisAnuais.map(({ label, valor, desc, icon: Icon, color }) => (
            <Card key={label} className="border border-gray-200">
              <CardHeader className="pb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <CardTitle className="text-sm text-gray-900 font-medium">{label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold transition-colors ${color}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-900" /> : valor}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}