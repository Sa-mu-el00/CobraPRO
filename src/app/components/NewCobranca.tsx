import { useState } from 'react';
import { Cliente, Cobranca } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, DollarSign, FileText, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface NewCobrancaProps {
  clientes: Cliente[];
  onAddCobranca: (cobranca: Omit<Cobranca, 'id' | 'createdAt' | 'pixKey'>) => void;
}

export function NewCobranca({ clientes, onAddCobranca }: NewCobrancaProps) {
  const [clienteId, setClienteId] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId || !valor || !descricao || !dataVencimento) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      toast.error('Cliente não encontrado!');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error('Valor inválido!');
      return;
    }

    // Determinar status baseado na data de vencimento
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);

    let status: Cobranca['status'] = 'pendente';
    if (vencimento < hoje) {
      status = 'atrasado';
    }

    onAddCobranca({
      clienteId,
      clienteNome: cliente.nome,
      valor: valorNumerico,
      descricao,
      dataVencimento: new Date(dataVencimento).toISOString(),
      status,
    });

    toast.success('Cobrança criada com sucesso!');

    // Limpar formulário
    setClienteId('');
    setValor('');
    setDescricao('');
    setDataVencimento('');
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return isNaN(amount) ? '' : amount.toFixed(2);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Nova Cobrança</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={clienteId} onValueChange={setClienteId} required>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        Nenhum cliente cadastrado
                      </div>
                    ) : (
                      clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome} - {cliente.telefone}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="valor"
                  type="text"
                  value={valor}
                  onChange={(e) => setValor(formatCurrency(e.target.value))}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do Serviço *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Serviço de pintura - sala e cozinha"
                className="pl-10 min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                min={getMinDate()}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Informações sobre Follow-up Automático */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm text-blue-900">
                  Follow-up Automático Ativado
                </h4>
                <p className="text-sm text-blue-700">
                  Esta cobrança terá lembretes automáticos enviados:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• <span>2 dias antes do vencimento</span> - Lembrete preventivo</li>
                  <li>• <span>No dia do vencimento</span> - Link de pagamento</li>
                  <li>• <span>1 dia após vencimento</span> - Notificação de atraso</li>
                </ul>
                <p className="text-xs text-blue-600 italic mt-2">
                  💡 O sistema remove o desgaste emocional da cobrança. As mensagens vão do
                  "Sistema CobraPro", não de você!
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setClienteId('');
                setValor('');
                setDescricao('');
                setDataVencimento('');
              }}
            >
              Limpar
            </Button>
            <Button type="submit" className="bg-[#00E676] hover:bg-[#00C853] text-[#004D40] shadow-lg hover:shadow-xl transition-all">
              Criar Cobrança
            </Button>
          </div>
        </form>

        {/* Preview da Chave PIX */}
        {clienteId && valor && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm mb-2">Preview da Mensagem de Cobrança:</h4>
            <div className="bg-white p-3 rounded border text-sm">
              <p>
                Olá {clientes.find((c) => c.id === clienteId)?.nome}! 👋
              </p>
              <p className="mt-2">
                Você tem uma nova cobrança no valor de <span>R$ {valor}</span>
              </p>
              <p className="mt-1">{descricao}</p>
              <p className="mt-2">
                Vencimento:{' '}
                {dataVencimento
                  ? new Date(dataVencimento).toLocaleDateString('pt-BR')
                  : '__/__/____'}
              </p>
              <p className="mt-3 text-emerald-600">
                💳 Pague via PIX usando o QR Code ou chave copia e cola
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}