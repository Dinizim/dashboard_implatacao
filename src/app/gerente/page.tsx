"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ETAPA_SLA_LABEL } from "@/lib/domain/labels"
import { ETAPAS_SLA_ORDEM, type EtapaSla, type SlaConfig } from "@/lib/domain/sla"
import {
  LogOut, Loader2, ShieldCheck, Rocket, Wrench,
  ClipboardList, TrendingUp, CheckCircle2, Save, AlertCircle, Timer, Settings2,
} from "lucide-react"

const ICONE_ETAPA: Record<EtapaSla, React.ElementType> = {
  KICKOFF: Rocket,
  INSTALACAO: Wrench,
  CADASTRO: ClipboardList,
  VENDAS: TrendingUp,
  DEFINITIVO: CheckCircle2,
}

const COR_ETAPA: Record<EtapaSla, string> = {
  KICKOFF: "bg-purple-50 text-purple-600",
  INSTALACAO: "bg-blue-50 text-blue-600",
  CADASTRO: "bg-amber-50 text-amber-600",
  VENDAS: "bg-emerald-50 text-emerald-600",
  DEFINITIVO: "bg-teal-50 text-teal-600",
}

export default function GerentePage() {
  return (
    <main className="sm:pl-14 min-h-screen w-full flex items-start justify-center p-4 pt-10 sm:pt-14 bg-gradient-to-b from-muted/50 to-background">
      <PainelSla />
    </main>
  )
}

// ============================================================
// Painel de SLA
// ============================================================
function PainelSla() {
  const router = useRouter()
  const [config, setConfig] = useState<SlaConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null)

  useEffect(() => {
    fetch("/api/sla-config")
      .then(res => res.json())
      .then(data => setConfig(data.config))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    router.push("/login")
    router.refresh()
  }

  async function handleSalvar() {
    if (!config) return
    setSalvando(true)
    setMensagem(null)
    try {
      const res = await fetch("/api/sla-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMensagem({ tipo: "erro", texto: data.error ?? "Erro ao salvar" })
        return
      }
      setMensagem({ tipo: "ok", texto: "Configuração de SLA salva com sucesso." })
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível conectar. Tente novamente." })
    } finally {
      setSalvando(false)
    }
  }

  function atualizarHoras(etapa: EtapaSla, valor: string) {
    if (!config) return
    const horas = valor === "" ? 0 : Number(valor)
    setConfig({ ...config, [etapa]: horas })
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-border bg-card shadow-xl p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-primary text-primary-foreground shrink-0">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Gestão de SLA</h1>
            <p className="text-sm text-muted-foreground">
              Prazo máximo, em horas, para cada etapa da implantação.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      {loading || !config ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-3">
            {ETAPAS_SLA_ORDEM.map(etapa => {
              const Icone = ICONE_ETAPA[etapa]
              const horas = config[etapa]
              const dias = Math.round((horas / 24) * 10) / 10
              return (
                <div key={etapa} className="w-full sm:w-[calc(50%-0.375rem)]">
                  <Card className="border border-border/70 hover:border-primary/40 hover:shadow-md transition-all h-full py-3">
                    <CardHeader className="pb-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-xl shrink-0 ${COR_ETAPA[etapa]}`}>
                          <Icone className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm leading-snug">{ETAPA_SLA_LABEL[etapa]}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min={1}
                          className="pl-9 pr-16 h-9 text-base font-semibold"
                          value={horas}
                          onChange={e => atualizarHoras(etapa, e.target.value)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">horas</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-0.5">
                        ≈ {dias} {dias === 1 ? "dia" : "dias"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-border">
            <div className="min-h-5">
              {mensagem && (
                <p className={`text-sm flex items-center gap-1.5 ${mensagem.tipo === "ok" ? "text-green-600" : "text-destructive"}`}>
                  {mensagem.tipo === "ok" ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {mensagem.texto}
                </p>
              )}
            </div>
            <Button className="gap-1.5 shrink-0" onClick={handleSalvar} disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar configuração
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
