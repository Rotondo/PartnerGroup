import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getEstatisticasOportunidadesPorEmpresa, getEstatisticasParceirosExternos } from '@/services/oportunidades.service';
import { EstatisticaOportunidadePorEmpresa, EstatisticaParceiroExterno } from '@/integrations/supabase/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [estatisticasEmpresas, setEstatisticasEmpresas] = useState<EstatisticaOportunidadePorEmpresa[]>([]);
  const [estatisticasParceiros, setEstatisticasParceiros] = useState<EstatisticaParceiroExterno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empresasData, parceirosData] = await Promise.all([
          getEstatisticasOportunidadesPorEmpresa(),
          getEstatisticasParceirosExternos()
        ]);
        
        setEstatisticasEmpresas(empresasData);
        setEstatisticasParceiros(parceirosData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dados para o gráfico de pizza de oportunidades por empresa
  const pieDataEmpresas = estatisticasEmpresas.map((item, index) => ({
    name: item.empresa,
    value: item.enviadas + item.recebidas,
    color: COLORS[index % COLORS.length]
  }));

  // Dados para o gráfico de barras de saldo por empresa
  const barDataEmpresas = estatisticasEmpresas.map((item) => ({
    name: item.empresa,
    enviadas: item.enviadas,
    recebidas: item.recebidas,
    saldo: item.saldo
  }));

  // Dados para o gráfico de barras de parceiros externos
  const barDataParceiros = estatisticasParceiros.map((item) => ({
    name: item.parceiro,
    enviadas: item.enviadas,
    recebidas: item.recebidas,
    saldo: item.saldo
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <Tabs defaultValue="intragrupo" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="intragrupo">Oportunidades Intragrupo</TabsTrigger>
          <TabsTrigger value="parceiros">Parceiros Externos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="intragrupo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Oportunidades</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataEmpresas}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieDataEmpresas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Saldo de Oportunidades por Empresa</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barDataEmpresas}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="enviadas" fill="#8884d8" name="Enviadas" />
                      <Bar dataKey="recebidas" fill="#82ca9d" name="Recebidas" />
                      <Bar dataKey="saldo" fill="#ffc658" name="Saldo" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-center p-2">Enviadas</th>
                      <th className="text-center p-2">Recebidas</th>
                      <th className="text-center p-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="text-center p-4">Carregando dados...</td>
                      </tr>
                    ) : (
                      estatisticasEmpresas.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.empresa}</td>
                          <td className="text-center p-2">{item.enviadas}</td>
                          <td className="text-center p-2">{item.recebidas}</td>
                          <td className={`text-center p-2 ${item.saldo > 0 ? 'text-green-600' : item.saldo < 0 ? 'text-red-600' : ''}`}>
                            {item.saldo}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parceiros">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Balança Comercial - Parceiros Externos</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Carregando dados...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barDataParceiros}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enviadas" fill="#8884d8" name="Enviadas" />
                    <Bar dataKey="recebidas" fill="#82ca9d" name="Recebidas" />
                    <Bar dataKey="saldo" fill="#ffc658" name="Saldo" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Parceiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Parceiro</th>
                      <th className="text-center p-2">Enviadas</th>
                      <th className="text-center p-2">Recebidas</th>
                      <th className="text-center p-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="text-center p-4">Carregando dados...</td>
                      </tr>
                    ) : (
                      estatisticasParceiros.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.parceiro}</td>
                          <td className="text-center p-2">{item.enviadas}</td>
                          <td className="text-center p-2">{item.recebidas}</td>
                          <td className={`text-center p-2 ${item.saldo > 0 ? 'text-green-600' : item.saldo < 0 ? 'text-red-600' : ''}`}>
                            {item.saldo}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
