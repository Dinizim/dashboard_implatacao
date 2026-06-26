"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { type FiltroAtivo } from "@/app/types/dashboard";
import { type Cliente } from "@/app/types/cliente";
import { ClienteViewer } from "../ClienteViewer";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface ClienteResumo {
  codigo: string;
  nome: string;
  dias: number;
  etapaAtual: string;
  assinatura: string;
  kickoff: string;
  instalacao: string;
  cadastro: string;
  vendas: string;
  supDef: string;
}

interface Props {
  filtro: FiltroAtivo;
  dataInicio: string;
  dataFim: string;
}

const prazoClass = (dias: number) => {
  if (dias >= 50) return "bg-red-50 text-red-600"
  if (dias >= 40) return "bg-yellow-50 text-yellow-600"
  return "bg-blue-50 text-blue-600"
}

const POR_PAGINA = 5

export function Viewer({ filtro, dataInicio, dataFim }: Props) {
  const [clientes, setClientes]         = useState<ClienteResumo[]>([])
  const [loading, setLoading]           = useState(false)
  const [pagina, setPagina]             = useState(1)
  const [clienteAberto, setClienteAberto] = useState<Cliente | null>(null)

  // Reseta a página quando muda o filtro ou período
  useEffect(() => { setPagina(1) }, [filtro, dataInicio, dataFim])

  useEffect(() => {
    if (!filtro.chave || !dataInicio || !dataFim) return

    const chaveApi = filtro.chave

    setLoading(true)
    fetch(`/api/clientes-viewer?filtro=${encodeURIComponent(chaveApi)}&inicio=${dataInicio}&fim=${dataFim}`)
      .then(res => res.json())
      .then(data => setClientes(data.clientes ?? []))
      .catch(() => setClientes([]))
      .finally(() => setLoading(false))
  }, [filtro, dataInicio, dataFim])

  // Paginação
  const total          = clientes.length
  const totalPaginas    = Math.ceil(total / POR_PAGINA)
  const inicio          = (pagina - 1) * POR_PAGINA
  const clientesPagina  = clientes.slice(inicio, inicio + POR_PAGINA)

  function abrirCliente(c: ClienteResumo) {
    setClienteAberto({
      codigo: c.codigo,
      nome: c.nome,
      cnpj: "",
      endereco: "",
      telefone: "",
      dataCad: "",
      dataApro: "",
      dataAss: c.assinatura,
      data1Mensalidade: "",
      kickoff: c.kickoff,
      dataInst: c.instalacao,
      treinamentoCadastro: c.cadastro,
      treinamentoVendas: c.vendas,
      supDef: c.supDef,
      diasImplantacao: c.dias,
      dentroDoProazo: c.dias >= 40 ? "FORA" : "DENTRO",
      etapaAtual: c.etapaAtual,
      semanas: [], // o ClienteViewer busca o histórico real direto da API
    })
  }

  return (
    <>
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl text-gray-800">
              {filtro.label}
            </CardTitle>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {total} clientes
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : clientes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhum cliente nessa categoria.
            </p>
          ) : (
            <>
              {clientesPagina.map(c => (
                <article
                  key={c.codigo}
                  onClick={() => abrirCliente(c)}
                  className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-all group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-semibold">
                      {c.nome.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">{c.nome}</p>
                      <span className="text-[11px] text-gray-400">cód. {c.codigo}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${prazoClass(c.dias)}`}>
                        {c.dias} dias
                      </span>
                      <span className="text-[11px] text-gray-400">{c.etapaAtual}</span>
                    </div>
                  </div>

                  <span className="text-xs text-gray-300 group-hover:text-gray-500 transition">
                    ver →
                  </span>
                </article>
              ))}

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between pt-3 border-t mt-2">
                  <span className="text-xs text-gray-400">
                    {inicio + 1}–{Math.min(inicio + POR_PAGINA, total)} de {total}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPagina(p => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPagina(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                          p === pagina
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                      disabled={pagina === totalPaginas}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal do cliente — busca o histórico real ao abrir */}
      {clienteAberto && (
        <ClienteViewer
          cliente={clienteAberto}
          onClose={() => setClienteAberto(null)}
        />
      )}
    </>
  )
}