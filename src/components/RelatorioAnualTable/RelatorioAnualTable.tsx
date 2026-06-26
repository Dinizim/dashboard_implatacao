// components/RelatorioAnualTable.tsx
"use client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

type LinhaRelatorio = {
  mes: string;
  qtdVendas: number;
  qtdSemEtapa: number;
  qtdCancelados: number;
  kickoff: number;
  instalacao: number;
  tCadastro: number;
  tVendas: number;
  supDefinitivo: number;
  totalImplantacoes: number;
  deficit: number;
}

interface Props {
  ano: number;
}

const LINHAS_CONFIG = [
  { key: "qtdVendas",         label: "Qtd Vendas" },
  { key: "qtdSemEtapa",       label: "Qtd s/ etapa" },
  { key: "qtdCancelados",     label: "Qtd cancelados" },
  { key: "kickoff",           label: "Kick-off" },
  { key: "instalacao",        label: "Instalação" },
  { key: "tCadastro",         label: "T. Cadastro" },
  { key: "tVendas",           label: "T. Vendas" },
  { key: "supDefinitivo",     label: "Sup Definitivo" },
  { key: "totalImplantacoes", label: "Total Implantações", destaque: true },
  { key: "deficit",           label: "Deficit Implantações", destaque: true },
] as const

export function RelatorioAnualTable({ ano }: Props) {
  const [linhas, setLinhas] = useState<LinhaRelatorio[]>([])
  const [totais, setTotais] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/relatorio-anual?ano=${ano}`)
      .then(res => res.json())
      .then(data => {
        setLinhas(data.linhas ?? [])
        setTotais(data.totais ?? null)
      })
      .catch(() => { setLinhas([]); setTotais(null) })
      .finally(() => setLoading(false))
  }, [ano])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="px-3 py-2 text-left font-semibold sticky left-0 bg-gray-900 min-w-[140px]">
              Implantações por mês
            </th>
            {linhas.map(l => (
              <th key={l.mes} className="px-3 py-2 text-center font-semibold min-w-[60px]">
                {l.mes}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-semibold bg-gray-700 min-w-[90px]">
              Totalizadores
            </th>
          </tr>
        </thead>
        <tbody>
          {LINHAS_CONFIG.map((cfg, idx) => (
            <tr
              key={cfg.key}
              className={`
                border-b border-gray-100
                ${cfg.destaque ? "bg-blue-50 font-semibold" : idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              `}
            >
              <td className="px-3 py-2 font-medium text-gray-700 sticky left-0 bg-inherit">
                {cfg.label}
              </td>
              {linhas.map(l => {
                const valor = l[cfg.key as keyof LinhaRelatorio] as number
                const isDeficit = cfg.key === "deficit"
                return (
                  <td
                    key={l.mes}
                    className={`px-3 py-2 text-center ${
                      isDeficit && valor > 0 ? "text-red-600 font-bold" :
                      isDeficit ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {valor}
                  </td>
                )
              })}
              <td className={`px-3 py-2 text-center font-bold bg-gray-100 ${
                cfg.key === "deficit" && (totais?.deficit ?? 0) > 0 ? "text-red-600" : ""
              }`}>
                {totais ? totais[cfg.key] : 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}