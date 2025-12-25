import { useState } from 'react';
import { Cobranca } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Copy, Check, Clock, AlertCircle, CheckCircle, Search, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface CobrancasListProps {
  cobrancas: Cobranca[];
  onUpdateStatus: (id: string, status: Cobranca['status']) => void;
}

export function CobrancasList({ cobrancas, onUpdateStatus }: CobrancasListProps) {
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pago' | 'pendente' | 'atrasado'>('all');

  const handleCopyPix = (pixKey: string) => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: Cobranca['status']) => {
    const variants = {
      pago: { variant: 'default' as const, className: 'bg-[#00E676] text-[#004D40] border-0', icon: CheckCircle },
      pendente: { variant: 'secondary' as const, className: 'bg-amber-100 text-amber-700 border-0', icon: Clock },
      atrasado: { variant: 'destructive' as const, className: 'bg-[#FF6F00] text-white border-0', icon: AlertCircle },
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDaysUntilDue = (dataVencimento: string) => {
    const today = new Date();
    const dueDate = new Date(dataVencimento);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredCobrancas = cobrancas
    .filter((c) => {
      const matchesSearch =
        c.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Cobranças</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === 'pendente' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pendente')}
                size="sm"
              >
                Pendentes
              </Button>
              <Button
                variant={filterStatus === 'atrasado' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('atrasado')}
                size="sm"
              >
                Atrasadas
              </Button>
              <Button
                variant={filterStatus === 'pago' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pago')}
                size="sm"
              >
                Pagas
              </Button>
            </div>
          </div>

          {/* Lista de Cobranças */}
          <div className="space-y-3">
            {filteredCobrancas.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma cobrança encontrada.</p>
            ) : (
              filteredCobrancas.map((cobranca) => {
                const daysUntilDue = getDaysUntilDue(cobranca.dataVencimento);
                return (
                  <div
                    key={cobranca.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3>{cobranca.clienteNome}</h3>
                          {getStatusBadge(cobranca.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{cobranca.descricao}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                          <span>Valor: R$ {cobranca.valor.toFixed(2)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            Vencimento:{' '}
                            {new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}
                          </span>
                          {cobranca.status === 'pendente' && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span
                                className={
                                  daysUntilDue < 0
                                    ? 'text-red-600'
                                    : daysUntilDue <= 2
                                    ? 'text-amber-600'
                                    : ''
                                }
                              >
                                {daysUntilDue < 0
                                  ? `Atrasado ${Math.abs(daysUntilDue)} dias`
                                  : daysUntilDue === 0
                                  ? 'Vence hoje'
                                  : `Vence em ${daysUntilDue} dias`}
                              </span>
                            </>
                          )}
                          {cobranca.status === 'pago' && cobranca.dataPagamento && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-emerald-600">
                                Pago em{' '}
                                {new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCobranca(cobranca)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Ver PIX
                        </Button>
                        {cobranca.status !== 'pago' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              onUpdateStatus(cobranca.id, 'pago');
                              toast.success('Cobrança marcada como paga!');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para mostrar PIX */}
      <Dialog open={!!selectedCobranca} onOpenChange={() => setSelectedCobranca(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cobrança PIX</DialogTitle>
          </DialogHeader>
          {selectedCobranca && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p>{selectedCobranca.clienteNome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                <p>{selectedCobranca.descricao}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor</p>
                <p className="text-emerald-600">
                  R$ {selectedCobranca.valor.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Chave PIX Copia e Cola</p>
                <div className="flex gap-2">
                  <Input
                    value={selectedCobranca.pixKey}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyPix(selectedCobranca.pixKey)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">
                  QR Code seria gerado aqui com a chave PIX
                </p>
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                💡 <span>Dica:</span> Envie esta cobrança por WhatsApp com um clique. O sistema
                enviará automaticamente lembretes 2 dias antes, no dia do vencimento e após
                atraso.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}