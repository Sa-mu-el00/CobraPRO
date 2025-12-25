import { useState, useEffect } from 'react';
import { Cobranca } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Zap, CheckCircle2, Send, Pause, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ModoMaratonaProps {
  cobrancas: Cobranca[];
  isOpen: boolean;
  onClose: () => void;
}

export function ModoMaratona({ cobrancas, isOpen, onClose }: ModoMaratonaProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [processando, setProcessando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [concluidos, setConcluidos] = useState<string[]>([]);

  // Filtrar apenas cobranças pendentes e atrasadas
  const cobrancasPendentes = cobrancas.filter(
    (c) => c.status === 'pendente' || c.status === 'atrasado'
  );

  const cobrancaAtual = cobrancasPendentes[indiceAtual];
  const progresso = (concluidos.length / cobrancasPendentes.length) * 100;

  // Detecta quando o usuário volta para o App (saiu do WhatsApp)
  useEffect(() => {
    if (!processando || pausado) return;

    const aoVoltarParaApp = () => {
      if (indiceAtual < cobrancasPendentes.length && cobrancaAtual) {
        // Marca como concluído
        if (!concluidos.includes(cobrancaAtual.id)) {
          setConcluidos((prev) => [...prev, cobrancaAtual.id]);
          
          toast.success(`✅ Enviado para ${cobrancaAtual.clienteNome}`, {
            duration: 2000,
          });
        }

        // Avança para o próximo
        setTimeout(() => {
          if (indiceAtual + 1 < cobrancasPendentes.length) {
            setIndiceAtual((prev) => prev + 1);
          } else {
            finalizarMaratona();
          }
        }, 500);
      }
    };

    window.addEventListener('focus', aoVoltarParaApp);
    return () => window.removeEventListener('focus', aoVoltarParaApp);
  }, [processando, pausado, indiceAtual, cobrancaAtual]);

  const gerarMensagemPersonalizada = (cobranca: Cobranca): string => {
    const valor = cobranca.valor.toFixed(2).replace('.', ',');
    const vencimento = new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR');
    const status = cobranca.status === 'atrasado' ? 'ATRASADA' : 'pendente';
    
    let mensagem = `Olá *${cobranca.clienteNome}*! 👋\n\n`;
    
    if (cobranca.status === 'atrasado') {
      mensagem += `⚠️ Sua cobrança de *R$ ${valor}* está *ATRASADA*.\n`;
      mensagem += `Vencimento: ${vencimento}\n\n`;
      mensagem += `Para evitar juros, realize o pagamento o quanto antes.\n\n`;
    } else {
      mensagem += `📋 Você tem uma cobrança pendente de *R$ ${valor}*\n`;
      mensagem += `Vencimento: ${vencimento}\n\n`;
      mensagem += `${cobranca.descricao}\n\n`;
    }
    
    mensagem += `💳 *PIX Copia e Cola:*\n${cobranca.pixKey}\n\n`;
    mensagem += `Após o pagamento, me avise para confirmar! ✅`;
    
    return mensagem;
  };

  const dispararWhatsApp = () => {
    if (!cobrancaAtual) return;

    const telefone = cobrancaAtual.clienteNome; // NOTA: Você precisa adicionar telefone ao modelo Cobranca
    const mensagem = gerarMensagemPersonalizada(cobrancaAtual);
    const mensagemEncoded = encodeURIComponent(mensagem);
    
    // Abrir WhatsApp em nova aba
    const link = `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${mensagemEncoded}`;
    window.open(link, '_blank');
  };

  const iniciarMaratona = () => {
    if (cobrancasPendentes.length === 0) {
      toast.error('Não há cobranças pendentes para enviar');
      return;
    }

    setProcessando(true);
    setPausado(false);
    toast.success('🚀 Maratona iniciada!', {
      description: 'Envie as mensagens e volte para o app',
    });
    
    // Disparar primeiro WhatsApp
    setTimeout(() => dispararWhatsApp(), 300);
  };

  const pausarMaratona = () => {
    setPausado(!pausado);
    toast.info(pausado ? 'Maratona retomada' : 'Maratona pausada');
  };

  const reiniciarMaratona = () => {
    setIndiceAtual(0);
    setConcluidos([]);
    setProcessando(false);
    setPausado(false);
  };

  const finalizarMaratona = () => {
    setProcessando(false);
    setPausado(false);
    
    toast.success('🎉 Maratona concluída!', {
      description: `${concluidos.length} cobranças enviadas com sucesso`,
      duration: 5000,
    });
  };

  const enviarProximo = () => {
    dispararWhatsApp();
  };

  if (cobrancasPendentes.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Tudo em dia!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Não há cobranças pendentes para enviar no momento.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#00E676]" />
            🚀 Modo Maratona
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contador e Progresso */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {concluidos.length} / {cobrancasPendentes.length}
              </span>
            </div>
            <Progress value={progresso} className="h-3" />
          </div>

          {/* Cliente Atual */}
          {cobrancaAtual && (
            <div className="bg-gradient-to-br from-[#004D40]/10 to-[#00E676]/10 dark:from-[#004D40]/20 dark:to-[#00E676]/20 p-6 rounded-xl border-2 border-[#00E676]/30">
              <p className="text-sm text-muted-foreground mb-1">
                {processando ? 'Próximo envio para:' : 'Começar por:'}
              </p>
              <p className="text-2xl text-[#004D40] dark:text-[#00E676] mb-3">
                {cobrancaAtual.clienteNome}
              </p>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-mono text-[#004D40] dark:text-white">
                    R$ {cobrancaAtual.valor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span className={cobrancaAtual.status === 'atrasado' ? 'text-[#FF6F00]' : ''}>
                    {new Date(cobrancaAtual.dataVencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {cobrancaAtual.status === 'atrasado' && (
                  <div className="mt-2 bg-[#FF6F00]/10 text-[#FF6F00] px-3 py-1 rounded-lg text-center text-xs">
                    ⚠️ ATRASADA
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="space-y-2">
            {!processando ? (
              <Button
                onClick={iniciarMaratona}
                className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#004D40] h-14 text-lg shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                INICIAR SEQUÊNCIA
              </Button>
            ) : (
              <>
                <Button
                  onClick={enviarProximo}
                  className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#004D40] h-14 text-lg shadow-lg"
                  disabled={pausado}
                >
                  <Send className="mr-2 h-5 w-5" />
                  {pausado ? 'PAUSADO' : 'ENVIAR E IR PARA O PRÓXIMO'}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={pausarMaratona}
                    variant="outline"
                    className="h-12"
                  >
                    {pausado ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={reiniciarMaratona}
                    variant="outline"
                    className="h-12"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Dica de Uso */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-900 dark:text-blue-300">
            💡 <strong>Como funciona:</strong> Clique em "Enviar", mande a mensagem no WhatsApp e volte para o app. 
            O próximo cliente será carregado automaticamente!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
