"use client"
import { PieChart, Pie, Cell, Tooltip, Legend, Sector } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer } from "../ui/chart"
import { type ChartConfig } from "@/components/ui/chart"
import { BarChart2, Loader2 } from "lucide-react"
import { type FiltroAtivo } from "@/app/types/dashboard"
import { useState, useEffect } from "react"

interface Props {
  filtroAtivo: FiltroAtivo;
  onEtapaClick: (etapa: string) => void;
  dataInicio: string;
  dataFim: string;
}

const chartConfig = {
  "Treinamento Cadastro":    { label: "Treinamento Cadastro",    color: "#2563eb" },
  "Instalação/Configuração": { label: "Instalação/Configuração", color: "#16a34a" },
  "Trein. Vendas":           { label: "Trein. Vendas",           color: "#ca8a04" },
  "Implantações Atrasadas":  { label: "Implantações Atrasadas",  color: "#dc2626" },
  "Kickoff Realizados":      { label: "Kickoff Realizados",      color: "#7c3aed" },
} satisfies ChartConfig

const COLORS = ["#7c3aed", "#16a34a", "#2563eb", "#ca8a04", "#dc2626"]

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 18} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
    </g>
  );
};

type EtapaData = { etapa: string; value: number }

export function ChartOverview({ filtroAtivo, onEtapaClick, dataInicio, dataFim }: Props) {
  const [hoverIndex, setHoverIndex]   = useState<number | undefined>(undefined)
  const [clickIndex, setClickIndex]   = useState<number | undefined>(undefined)
  const [chartData, setChartData]     = useState<EtapaData[]>([])
  const [loading, setLoading]         = useState(false)

  const activeIndex = hoverIndex ?? clickIndex

  // Busca os dados da API quando o período muda
  useEffect(() => {
    if (!dataInicio || !dataFim) return
    setLoading(true)
    fetch(`/api/etapas?inicio=${dataInicio}&fim=${dataFim}`)
      .then(res => res.json())
      .then(data => {
        setChartData(data)
        setClickIndex(undefined) // reseta seleção ao mudar período
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false))
  }, [dataInicio, dataFim])

  return (
    <Card className="w-full md:w-1/2 md:max-w-[600px]">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl text-gray-800">
            Etapas de Implantação
          </CardTitle>
          <BarChart2 className="ml-auto h-4 w-4" />
        </div>
        {clickIndex !== undefined ? (
          <p className="text-sm text-blue-600 font-medium mt-1">
            Filtrando: {chartData[clickIndex]?.etapa}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">
            Clique em uma etapa para filtrar
          </p>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="etapa"
                cx="50%"
                cy="50%"
                outerRadius={100}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onClick={(data, index) => {
                  if (data && data.name) {
                    if (clickIndex === index) {
                      setClickIndex(undefined)
                      onEtapaClick("")
                    } else {
                      setClickIndex(index)
                      onEtapaClick(data.name as string)
                    }
                  }
                }}
                onMouseEnter={(_, index) => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(undefined)}
                style={{ cursor: "pointer" }}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.35}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} clientes`, name]} />
              <Legend />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}