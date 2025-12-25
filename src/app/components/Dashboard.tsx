import { Cobranca, FollowUp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  cobrancas: Cobranca[];
  followUps: FollowUp[];
}

export function Dashboard({ cobrancas, followUps }: DashboardProps) {
  // Calcular métricas
  const totalPendente = cobrancas
    .filter((c) => c.status === 'pendente')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalRecebido = cobrancas
    .filter((c) => c.status === 'pago')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalAtrasado = cobrancas
    .filter((c) => c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const taxaInadimplencia = cobrancas.length > 0
    ? ((cobrancas.filter((c) => c.status === 'atrasado').length / cobrancas.length) * 100).toFixed(1)
    : '0.0';

  // Dados para gráfico de barras
  const barChartData = [
    { name: 'Pago', valor: totalRecebido },
    { name: 'Pendente', valor: totalPendente },
    { name: 'Atrasado', valor: totalAtrasado },
  ];

  // Dados para gráfico de pizza
  const pieChartData = [
    { name: 'Pago', value: cobrancas.filter((c) => c.status === 'pago').length },
    { name: 'Pendente', value: cobrancas.filter((c) => c.status === 'pendente').length },
    { name: 'Atrasado', value: cobrancas.filter((c) => c.status === 'atrasado').length },
  ];

  const COLORS = {
    Pago: '#00E676',
    Pendente: '#FFB300',
    Atrasado: '#FF6F00',
  };

  // Follow-ups recentes
  const recentFollowUps = [...followUps]
    .sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-emerald-600">
              R$ {totalRecebido.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {cobrancas.filter((c) => c.status === 'pago').length} cobranças pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">A Receber</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-amber-600">
              R$ {totalPendente.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {cobrancas.filter((c) => c.status === 'pendente').length} cobranças pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Atrasado</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-red-600">
              R$ {totalAtrasado.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {cobrancas.filter((c) => c.status === 'atrasado').length} cobranças atrasadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Taxa de Inadimplência</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{taxaInadimplencia}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Do total de cobranças
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Valores por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Bar dataKey="valor" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Cobranças</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Follow-ups Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFollowUps.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum follow-up registrado ainda.</p>
            ) : (
              recentFollowUps.map((followUp) => {
                const cobranca = cobrancas.find((c) => c.id === followUp.cobrancaId);
                return (
                  <div key={followUp.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          followUp.status === 'enviado' ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      />
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            followUp.tipo === 'lembrete_previo'
                              ? 'bg-blue-100 text-blue-700'
                              : followUp.tipo === 'vencimento'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {followUp.tipo === 'lembrete_previo'
                            ? 'Lembrete Prévio'
                            : followUp.tipo === 'vencimento'
                            ? 'Vencimento'
                            : 'Atraso'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(followUp.dataEnvio).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{followUp.mensagem}</p>
                      {cobranca && (
                        <p className="text-xs text-gray-500 mt-1">
                          Cobrança: {cobranca.descricao} - R$ {cobranca.valor.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}