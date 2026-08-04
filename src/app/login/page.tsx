"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Package, User } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Suspense fallback={null}>
        <FormularioLogin />
      </Suspense>
    </main>
  )
}

function FormularioLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"

  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErro(data.error ?? "Usuário ou senha inválidos")
        return
      }
      router.push(next.startsWith("/") ? next : "/")
      router.refresh()
    } catch {
      setErro("Não foi possível conectar. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/20">
        <Package className="h-8 w-8" />
      </div>
      <h1 className="text-gray-900 text-xl font-bold text-center">Dashboard de Implantação</h1>
      <p className="text-gray-500 text-sm text-center mt-1 mb-10">
        Entre com seu usuário e senha para continuar
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
          <input
            placeholder="Usuário"
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            autoFocus
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            className="w-full h-12 pl-11 pr-11 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={senha}
            onChange={e => setSenha(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(v => !v)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {mostrarSenha ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            <span className="sr-only">{mostrarSenha ? "Ocultar senha" : "Mostrar senha"}</span>
          </button>
        </div>

        {erro && (
          <p className="text-sm text-red-600 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full h-12 mt-2 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
        >
          {carregando ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Entrar"}
        </button>
      </form>
    </div>
  )
}
