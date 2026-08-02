"use client"
import { useState, useEffect } from "react"
import { X, Building2, Phone, KeyRound, Store, Calendar, Loader2, User, Rocket, FileText, CheckCircle2, Clock } from "lucide-react"
import { type Cliente } from "@/app/types/cliente"
import { PRAZO_PRIORIDADE_DIAS, PRAZO_ALERTA_DIAS } from "@/lib/domain/cliente"
import type { EtapaSla, StatusSla } from "@/lib/domain/sla"

function formatarData(data: string | null | undefined): string {
  if (!data) return "—"
  try {
    const d = new Date(data)
    if (isNaN(d.getTime())) return data
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return data
  }
}

const prazoColor = (dias: number) => {
  if (dias >= PRAZO_ALERTA_DIAS) return "text-red-600 bg-red-50 border-red-200"
  if (dias >= PRAZO_PRIORIDADE_DIAS) return "text-yellow-600 bg-yellow-50 border-yellow-200"
  return "text-blue-600 bg-blue-50 border-blue-200"
}

type HistoricoSemana = { data: string; observacao: string }

type SlaEtapa = {
  etapa: EtapaSla
  label: string
  horasDecorridas: number
  slaHoras: number
  status: StatusSla
  concluido: boolean
}

type HistoricoResponse = {
  kickoff: HistoricoSemana | null
  semanas: Record<string, HistoricoSemana>
  observacoesGerais: HistoricoSemana | null
  implantacaoFinalizada: boolean
  sla: SlaEtapa[]
}

// Mapeia o label da linha do tempo para a etapa de SLA correspondente
const ETAPA_SLA_POR_LABEL: Record<string, EtapaSla> = {
  "Kick-off":        "KICKOFF",
  "Instalação":      "INSTALACAO",
  "Trein. Cadastro": "CADASTRO",
  "Trein. Vendas":   "VENDAS",
  "Sup. Definitivo": "DEFINITIVO",
}

function corBadgeSla(status: StatusSla): string {
  if (status === "ESTOURADO") return "bg-red-100 text-red-700"
  if (status === "RISCO")     return "bg-yellow-100 text-yellow-700"
  if (status === "OK")        return "bg-green-100 text-green-700"
  return "bg-gray-100 text-gray-400"
}

function SlaBadge({ sla }: { sla?: SlaEtapa }) {
  if (!sla || sla.status === "NAO_INICIADO") return null
  return (
    <span className={`mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${corBadgeSla(sla.status)}`}>
      <Clock className="h-2.5 w-2.5" />
      {sla.horasDecorridas}h/{sla.slaHoras}h
    </span>
  )
}

interface Props {
  cliente: Cliente
  onClose: () => void
}

const DADOS_PRINCIPAIS = (cliente: Cliente) => [
  { label: "Nome",     valor: cliente.nome || "—", icon: User,      cor: "bg-blue-50 text-blue-600" },
  { label: "CNPJ",     valor: cliente.cnpj || "—", icon: Building2, cor: "bg-purple-50 text-purple-600" },
  { label: "Licenças", valor: cliente.quantidadeLicenca != null ? String(cliente.quantidadeLicenca) : "—", icon: KeyRound, cor: "bg-amber-50 text-amber-600" },
  { label: "Telefone", valor: cliente.telefone || "—", icon: Phone, cor: "bg-emerald-50 text-emerald-600" },
  { label: "Revenda",  valor: cliente.revenda || "—", icon: Store,  cor: "bg-rose-50 text-rose-600" },
]

export function ClienteViewer({ cliente, onClose }: Props) {
  const [historico, setHistorico] = useState<HistoricoResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cliente-historico?idcliente=${cliente.codigo}`)
      .then(res => res.json())
      .then(data => setHistorico(data))
      .catch(() => setHistorico(null))
      .finally(() => setLoading(false))
  }, [cliente.codigo])

  const timeline = [
    { label: "Cadastro",         data: cliente.dataCad },
    { label: "Aprovação",        data: cliente.dataApro },
    { label: "Assinatura",       data: cliente.dataAss },
    { label: "Kick-off",         data: cliente.kickoff },
    { label: "Instalação",       data: cliente.dataInst },
    { label: "Trein. Cadastro",  data: cliente.treinamentoCadastro },
    { label: "Trein. Vendas",    data: cliente.treinamentoVendas },
    { label: "Sup. Definitivo",  data: cliente.supDef },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cliente.nome}</h2>
            <p className="text-sm text-gray-400 mt-0.5">Cód. {cliente.codigo}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full font-medium">
              {cliente.etapaAtual}
            </span>
            <span className={`text-xs border px-3 py-1.5 rounded-full font-medium ${prazoColor(cliente.diasImplantacao)}`}>
              {cliente.diasImplantacao} dias
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-1">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Dados principais */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Dados do cliente
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {DADOS_PRINCIPAIS(cliente).map(item => (
                <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                  <span className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${item.cor}`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{item.valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline de datas */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Linha do tempo
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {timeline.map((item, i) => {
                const etapaSla = ETAPA_SLA_POR_LABEL[item.label]
                const sla = etapaSla ? historico?.sla.find(s => s.etapa === etapaSla) : undefined
                return (
                  <div
                    key={i}
                    className={`flex-1 basis-28 max-w-40 rounded-xl p-3.5 text-center flex flex-col items-center ${item.data ? "bg-blue-50" : "bg-gray-50"}`}
                  >
                    <p className={`text-[11px] font-medium leading-tight mb-1.5 ${item.data ? "text-blue-500" : "text-gray-400"}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs font-bold leading-tight ${item.data ? "text-blue-700" : "text-gray-300"}`}>
                      {formatarData(item.data)}
                    </p>
                    <SlaBadge sla={sla} />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Dentro/Fora do prazo */}
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
            cliente.dentroDoProazo === "DENTRO" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <span className={`text-sm font-medium flex items-center gap-2 ${
              cliente.dentroDoProazo === "DENTRO" ? "text-green-700" : "text-red-700"
            }`}>
              <CheckCircle2 className="h-4 w-4" />
              {cliente.dentroDoProazo === "DENTRO" ? "Implantação dentro do prazo" : "Implantação fora do prazo"}
            </span>
            <span className={`text-xs font-bold ${cliente.dentroDoProazo === "DENTRO" ? "text-green-600" : "text-red-600"}`}>
              {cliente.diasImplantacao} dias de implantação
            </span>
          </div>

          {/* Acompanhamento semanal */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Acompanhamento semanal
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : !historico ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhum histórico de implantação encontrado.
              </p>
            ) : (
              <div className="space-y-2">
                {/* Kick-off */}
                {historico.kickoff && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                        <Rocket className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-gray-700">Kick-off / Primeiro contato</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        {formatarData(historico.kickoff.data)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 pl-9.5">{historico.kickoff.observacao}</p>
                  </div>
                )}

                {/* Semanas 1 a 8 */}
                {Array.from({ length: 8 }, (_, i) => i + 1).map(num => {
                  const semana = historico.semanas[num]
                  return (
                    <div
                      key={num}
                      className={`rounded-xl border p-3.5 ${semana ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          semana ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-400"
                        }`}>
                          {num}
                        </span>
                        <span className="text-sm font-medium text-gray-700">Semana {num}</span>
                        {semana ? (
                          <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                            <Calendar className="h-3 w-3" />
                            {formatarData(semana.data)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 ml-auto">Sem registro</span>
                        )}
                      </div>
                      {semana && (
                        <p className="text-sm text-gray-600 mt-2 pl-9.5">{semana.observacao}</p>
                      )}
                    </div>
                  )
                })}

                {/* Observações gerais */}
                {historico.observacoesGerais && (
                  <div className="rounded-xl border border-gray-300 bg-gray-50 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-gray-700">Observações gerais</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        {formatarData(historico.observacoesGerais.data)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 pl-9.5">{historico.observacoesGerais.observacao}</p>
                  </div>
                )}

                {/* Implantação finalizada */}
                {historico.implantacaoFinalizada && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-3.5 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-green-200 text-green-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium text-green-700">Implantação finalizada</span>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
