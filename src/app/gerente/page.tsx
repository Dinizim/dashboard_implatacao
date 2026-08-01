"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ETAPA_SLA_LABEL } from "@/lib/domain/labels"
import { ETAPAS_SLA_ORDEM, type EtapaSla, type SlaConfig } from "@/lib/domain/sla"
import {
  Lock, User, LogOut, Loader2, ShieldCheck, Rocket, Wrench,
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
  const [autenticado, setAutenticado] = useState<boolean | null>(null)

  const verificarSessao = useCallback(() => {
    fetch("/api/gerente/session")
      .then(res => res.json())
      .then(data => setAutenticado(!!data.autenticado))
      .catch(() => setAutenticado(false))
  }, [])

  useEffect(() => { verificarSessao() }, [verificarSessao])

  return (
    <main className="sm:pl-14 min-h-screen w-full flex items-start justify-center p-4 pt-10 sm:pt-14 bg-gradient-to-b from-muted/50 to-background">
      {autenticado === null ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando...
        </div>
      ) : autenticado ? (
        <PainelSla onLogout={() => setAutenticado(false)} />
      ) : (
        <LoginGerente onLogin={() => setAutenticado(true)} />
      )}
    </main>
  )
}

// ============================================================
// Login
// ============================================================
function LoginGerente({ onLogin }: { onLogin: () => void }) {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      const res = await fetch("/api/gerente/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErro(data.error ?? "Usuário ou senha inválidos")
        return
      }
      onLogin()
    } catch {
      setErro("Não foi possível conectar. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-xl border-border/60 py-0 overflow-hidden">
      <div className="bg-gradient-to-br from-primary to-primary/70 px-6 pt-8 pb-10 flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 text-primary-foreground backdrop-blur-sm mb-3 ring-1 ring-white/25">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <CardTitle className="text-primary-foreground text-lg">Área do Gerente</CardTitle>
        <CardDescription className="text-primary-foreground/80 mt-1">
          Acesso restrito para gestão dos SLAs de implantação
        </CardDescription>
      </div>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3 -mt-5 bg-card rounded-t-2xl pt-6">
          <div className="relative">
            <User className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Usuário"
              className="pl-8"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              autoFocus
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha"
              className="pl-8"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>
          {erro && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" /> {erro}
            </p>
          )}
        </CardContent>
        <CardFooter className="pb-6">
          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

// ============================================================
// Painel de SLA
// ============================================================
function PainelSla({ onLogout }: { onLogout: () => void }) {
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
    await fetch("/api/gerente/logout", { method: "POST" }).catch(() => {})
    onLogout()
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
