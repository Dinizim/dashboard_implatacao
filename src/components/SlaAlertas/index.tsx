"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, X, Clock, Loader2 } from "lucide-react"

type Alerta = {
  codigo: string
  nome: string
  etapaLabel: string
  horasDecorridas: number
  slaHoras: number
  status: "RISCO" | "ESTOURADO"
}

const INTERVALO_ATUALIZACAO = 60_000

export function SlaAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aberto, setAberto] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ativo = true

    function buscar() {
      fetch("/api/sla-alertas")
        .then(res => res.json())
        .then(data => { if (ativo) setAlertas(data.alertas ?? []) })
        .catch(() => { if (ativo) setAlertas([]) })
        .finally(() => { if (ativo) setCarregando(false) })
    }

    buscar()
    const intervalo = setInterval(buscar, INTERVALO_ATUALIZACAO)
    return () => { ativo = false; clearInterval(intervalo) }
  }, [])

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener("mousedown", aoClicarFora)
    return () => document.removeEventListener("mousedown", aoClicarFora)
  }, [])

  const estourados = alertas.filter(a => a.status === "ESTOURADO").length
  const total = alertas.length

  const corBotao =
    estourados > 0
      ? "bg-red-500 hover:bg-red-600 text-white"
      : total > 0
      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
      : "bg-card hover:bg-muted text-muted-foreground border border-border"

  return (
    <div ref={wrapperRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {aberto && (
        <div className="mb-3 w-[calc(100vw-3rem)] max-w-sm rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div>
              <p className="text-sm font-semibold">SLA de implantação</p>
              <p className="text-xs text-muted-foreground">
                {total === 0 ? "Tudo em dia" : `${total} cliente${total > 1 ? "s" : ""} precisam de atenção`}
              </p>
            </div>
            <button onClick={() => setAberto(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {carregando ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : alertas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 px-4">
                Nenhum cliente em risco no momento.
              </p>
            ) : (
              alertas.map(a => (
                <div key={a.codigo} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      a.status === "ESTOURADO" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">{a.etapaLabel}</p>
                    <p
                      className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${
                        a.status === "ESTOURADO" ? "text-red-600" : "text-yellow-600"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {a.horasDecorridas}h / {a.slaHoras}h — {a.status === "ESTOURADO" ? "estourado" : "em risco"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setAberto(v => !v)}
        title="SLAs em risco"
        className={`relative flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${corBotao}`}
      >
        <AlertTriangle className="h-5 w-5" />
        <span className="sr-only">Alertas de SLA</span>
        {total > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-red-600 border-2 border-white shadow-sm">
            {total}
          </span>
        )}
      </button>
    </div>
  )
}
