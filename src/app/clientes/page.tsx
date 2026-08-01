"use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ClienteViewer } from "@/components/ClienteViewer";
import { type Cliente } from "@/app/types/cliente";

const POR_PAGINA = 50

const statusConfig: Record<string, { label: string; class: string }> = {
  "Ativo":     { label: "Ativo",     class: "bg-blue-100 text-blue-700 border-blue-200" },
  "Atrasado":  { label: "Atrasado",  class: "bg-red-100 text-red-700 border-red-200" },
  "Concluído": { label: "Concluído", class: "bg-green-100 text-green-700 border-green-200" },
  "Cancelado": { label: "Cancelado", class: "bg-gray-100 text-gray-600 border-gray-200" },
}

const prazoConfig = (dias: number) => {
  if (dias >= 50) return { class: "text-red-600 font-bold", icon: "🔴" };
  if (dias >= 40) return { class: "text-yellow-600 font-bold", icon: "🟡" };
  return { class: "text-blue-600 font-semibold", icon: "🔵" };
};

function formatarData(data: string | null | undefined): string {
  if (!data) return "—"
  try {
    const d = new Date(data)
    if (isNaN(d.getTime())) return data
    return d.toLocaleDateString("pt-BR")
  } catch {
    return data
  }
}

export default function ClientesPage() {
  const [clientes, setClientes]             = useState<Cliente[]>([]);
  const [loading, setLoading]               = useState(true);
  const [busca, setBusca]                   = useState("");
  const [filtroStatus, setFiltroStatus]     = useState("TODOS");
  const [filtroEtapa, setFiltroEtapa]       = useState("TODAS");
  const [filtroPrazo, setFiltroPrazo]       = useState("TODOS");
  const [pagina, setPagina]                 = useState(1);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  // Reseta página ao mudar qualquer filtro
  useEffect(() => {
    fetch("/api/clientes-pagina")
      .then(res => res.json())
      .then(data => setClientes(data.clientes ?? []))
      .catch(() => setClientes([]))
      .finally(() => setLoading(false));
  }, []);

  const clientesFiltrados = clientes.filter(c => {
    const matchBusca =
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigo.includes(busca) ||
      (c.cnpj ?? "").includes(busca);
    const matchStatus = filtroStatus === "TODOS" || c.status === filtroStatus;
    const matchEtapa  = filtroEtapa  === "TODAS" || c.etapaAtual === filtroEtapa;
    const matchPrazo  =
      filtroPrazo === "TODOS" ||
      (filtroPrazo === "0-39"  && c.diasImplantacao <= 39) ||
      (filtroPrazo === "40-49" && c.diasImplantacao >= 40 && c.diasImplantacao <= 49) ||
      (filtroPrazo === "50+"   && c.diasImplantacao >= 50);
    return matchBusca && matchStatus && matchEtapa && matchPrazo;
  });

  // Paginação
  const total        = clientesFiltrados.length
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  const inicio       = (pagina - 1) * POR_PAGINA
  const clientesDaPagina = clientesFiltrados.slice(inicio, inicio + POR_PAGINA)

  const etapas = [...new Set(clientes.map(c => c.etapaAtual))];

  return (
    <main className="sm:ml-14 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>Clientes em Implantação</CardTitle>
              <CardDescription>Todos os clientes do ano + atrasados de anos anteriores</CardDescription>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {total} clientes encontrados
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, código ou CNPJ..."
                className="pl-8"
                value={busca}
                onChange={e => { setBusca(e.target.value); setPagina(1) }}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white text-gray-700 cursor-pointer"
              value={filtroStatus}
              onChange={e => { setFiltroStatus(e.target.value); setPagina(1) }}
            >
              <option value="TODOS">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white text-gray-700 cursor-pointer"
              value={filtroEtapa}
              onChange={e => { setFiltroEtapa(e.target.value); setPagina(1) }}
            >
              <option value="TODAS">Todas as etapas</option>
              {etapas.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white text-gray-700 cursor-pointer"
              value={filtroPrazo}
              onChange={e => { setFiltroPrazo(e.target.value); setPagina(1) }}
            >
              <option value="TODOS">Todos os prazos</option>
              <option value="0-39">🔵 Até 39 dias</option>
              <option value="40-49">🟡 40 a 49 dias</option>
              <option value="50+">🔴 50+ dias</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-3 py-2 font-semibold">Código</th>
                      <th className="px-3 py-2 font-semibold">Nome do cliente</th>
                      <th className="px-3 py-2 font-semibold">Etapa atual</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Dias implantação</th>
                      <th className="px-3 py-2 font-semibold">Assinatura</th>
                      <th className="px-3 py-2 font-semibold">Kick-off</th>
                      <th className="px-3 py-2 font-semibold">Sup. Definitivo</th>
                      <th className="px-3 py-2 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesDaPagina.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-10 text-gray-400">
                          Nenhum cliente encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      clientesDaPagina.map((cliente) => {
                        const prazo  = prazoConfig(cliente.diasImplantacao);
                        const status = statusConfig[cliente.status] ?? { label: cliente.status, class: "bg-gray-100 text-gray-600" }
                        return (
                          <tr
                            key={cliente.codigo}
                            className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => setClienteSelecionado(cliente)}
                          >
                            <td className="px-3 py-2 text-gray-500">{cliente.codigo}</td>
                            <td className="px-3 py-2 font-medium">{cliente.nome}</td>
                            <td className="px-3 py-2 text-gray-600">{cliente.etapaAtual}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.class}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className={`px-3 py-2 ${prazo.class}`}>
                              {prazo.icon} {cliente.diasImplantacao} dias
                            </td>
                            <td className="px-3 py-2 text-gray-600">{formatarData(cliente.dataAss)}</td>
                            <td className="px-3 py-2 text-gray-600">{formatarData(cliente.kickoff)}</td>
                            <td className="px-3 py-2 text-gray-600">{formatarData(cliente.supDef)}</td>
                            <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                              <Button
                                variant="outline" size="sm"
                                className="gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                onClick={() => setClienteSelecionado(cliente)}
                              >
                                <Eye className="h-4 w-4" /> Visualizar
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-400">
                    Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, total)} de {total} clientes
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPagina(p => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-500" />
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
                      .reduce<(number | "...")[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPagina(p as number)}
                            className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                              p === pagina
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100 text-gray-500"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

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

      {clienteSelecionado && (
        <ClienteViewer
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
        />
      )}
    </main>
  );
}
