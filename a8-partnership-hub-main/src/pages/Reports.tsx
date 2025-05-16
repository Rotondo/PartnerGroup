
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";
import {
  BarChart,
  PieChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download, Calendar as CalendarIcon, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";
import { mockOpportunities, getMonthlyDataForChart, getQuarterlyData, getOpportunityDistributionByCompany } from "@/data/mockData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Cores para escala de valores (da mais clara para a mais escura)
const VALUE_COLORS = [
  "#EDE9FE", // Valor mais baixo
  "#DDD6FE",
  "#C4B5FD", 
  "#A78BFA",
  "#8B5CF6"  // Valor mais alto (roxo vívido)
];

// Cores para destacar valores maiores com verde (melhor) até vermelho (pior)
const PERFORMANCE_COLORS = [
  "#d0f2c3", // Verde claro (melhor)
  "#a5e88b",
  "#6ed350",
  "#4db625", 
  "#337f18"  // Verde escuro (melhor)
];

const Reports = () => {
  const [periodType, setPeriodType] = useState("last6months");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  const monthlyData = getMonthlyDataForChart();
  const quarterlyData = getQuarterlyData();
  const opportunityDistribution = getOpportunityDistributionByCompany();

  // Distribuição de status filtrada para gráfico de pizza
  const statusData = Object.entries(
    mockOpportunities.reduce(
      (acc, opp) => {
        acc[opp.status] = (acc[opp.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([name, value]) => ({ name, value }));

  // Gerar dados do funil de conversão
  const generateFunnelData = () => {
    const totalOpps = mockOpportunities.length;
    const inProgressOpps = mockOpportunities.filter(
      (opp) => opp.status === "In Progress"
    ).length;
    const wonOpps = mockOpportunities.filter(
      (opp) => opp.status === "Won"
    ).length;

    return [
      { name: "Todas Oportunidades", value: totalOpps },
      { name: "Em Andamento", value: inProgressOpps },
      { name: "Ganhas", value: wonOpps },
    ];
  };

  const funnelData = generateFunnelData();

  const handleExport = () => {
    console.log("Exportando dados do relatório...");
    // Em uma aplicação real, isso geraria e baixaria um relatório
  };

  // Função para escolher a cor baseada no valor (maior valor = cor mais escura de verde)
  const getColorByValue = (value: number, maxValue: number) => {
    if (maxValue === 0) return PERFORMANCE_COLORS[0]; // Evitar divisão por zero
    const normalizedValue = value / maxValue; // Valor entre 0 e 1
    const colorIndex = Math.min(
      Math.floor(normalizedValue * PERFORMANCE_COLORS.length),
      PERFORMANCE_COLORS.length - 1
    );
    return PERFORMANCE_COLORS[colorIndex];
  };

  // Encontrar o valor máximo para usar na escala de cores
  const maxDistributionValue = Math.max(...opportunityDistribution.map(item => item.value));

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <Pie
                data={opportunityDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {opportunityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColorByValue(entry.value, maxDistributionValue)}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => [`${value} Oportunidades`, "Quantidade"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Cryah"
                stroke="#1e88e5"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="Lomadee" stroke="#26a69a" />
              <Line type="monotone" dataKey="Monitfy" stroke="#ab47bc" />
              <Line type="monotone" dataKey="B8one" stroke="#ff7043" />
              <Line type="monotone" dataKey="SAIO" stroke="#66bb6a" />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={opportunityDistribution}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value: number) => [`${value} Oportunidades`, "Quantidade"]}
              />
              <Legend />
              <Bar dataKey="value" name="Oportunidades">
                {opportunityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColorByValue(entry.value, maxDistributionValue)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-aeight-dark">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Analise dados de parcerias com relatórios personalizáveis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Configurações do Relatório">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Selecionar Período
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={periodType}
                          onValueChange={(value) => setPeriodType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Data Personalizada</SelectItem>
                            <SelectItem value="thisMonth">Este Mês</SelectItem>
                            <SelectItem value="last3months">Últimos 3 Meses</SelectItem>
                            <SelectItem value="last6months">Últimos 6 Meses</SelectItem>
                            <SelectItem value="thisYear">Este Ano</SelectItem>
                            <SelectItem value="lastYear">Ano Passado</SelectItem>
                          </SelectContent>
                        </Select>

                        {periodType === "custom" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={ptBR}
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Tipo de Gráfico
                      </label>
                      <div className="flex space-x-2">
                        <Button
                          variant={chartType === "bar" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setChartType("bar")}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" /> Barras
                        </Button>
                        <Button
                          variant={chartType === "line" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setChartType("line")}
                        >
                          <LineChartIcon className="h-4 w-4 mr-2" /> Linhas
                        </Button>
                        <Button
                          variant={chartType === "pie" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setChartType("pie")}
                        >
                          <PieChartIcon className="h-4 w-4 mr-2" /> Pizza
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-3">Resumo do Relatório</h3>
                      <div className="bg-muted/40 p-4 rounded-lg space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Total de Oportunidades:</span>{" "}
                          {mockOpportunities.length}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Taxa de Conversão:</span>{" "}
                          {(
                            (mockOpportunities.filter((o) => o.status === "Won").length /
                              mockOpportunities.length) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Empresa Líder:</span>{" "}
                          {opportunityDistribution.sort((a, b) => b.value - a.value)[0]
                            ?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configure o relatório selecionando o período de tempo e o tipo de visualização de dados.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Funil de Conversão">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={funnelData}
                        margin={{ top: 20, right: 30, left: 70, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <RechartsTooltip />
                        <Bar
                          dataKey="value"
                          name="Oportunidades"
                          fill="#1e88e5"
                          label={{ position: "right", formatter: (value) => value }}
                        >
                          {funnelData.map((entry, index) => {
                            const opacity = 1 - index * 0.2;
                            return <Cell key={`cell-${index}`} fill={`rgba(30, 136, 229, ${opacity})`} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visualize o funil de conversão das oportunidades, desde o registro inicial até oportunidades ganhas.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="col-span-2">
                <DashboardCard title="Total de Oportunidades">
                  {renderChart()}
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Distribuição total de oportunidades por empresa. As cores mais escuras indicam valores mais altos (melhores resultados).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DashboardCard title="Distribuição por Status">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === "Won"
                                  ? "#66bb6a"
                                  : entry.name === "Lost"
                                  ? "#ef5350"
                                  : entry.name === "In Progress"
                                  ? "#ffca28"
                                  : entry.name === "New"
                                  ? "#42a5f5"
                                  : "#bdbdbd"
                              }
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) => [`${value} Oportunidades`, "Quantidade"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visualize a distribuição de oportunidades por status (Novas, Em Andamento, Ganhas, Perdidas).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DashboardCard title="Matriz de Intercâmbio Intragrupo" className="mb-8">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quarterlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number) => [`${value} Oportunidades`, "Quantidade"]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Oportunidades">
                        {quarterlyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getColorByValue(entry.value, Math.max(...quarterlyData.map(d => d.value)))}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Esta matriz apresenta a troca de oportunidades entre empresas do grupo A&eight. Quanto mais escura a cor verde, maior o número de oportunidades (melhor desempenho).</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DashboardLayout>
  );
};

export default Reports;
