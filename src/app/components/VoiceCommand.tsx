import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Cliente, Cobranca } from '../App';

interface VoiceCommandProps {
  clientes: Cliente[];
  onAddCobranca: (cobranca: Omit<Cobranca, 'id' | 'createdAt' | 'pixKey'>) => void;
}

export function VoiceCommand({ clientes, onAddCobranca }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Verificar se o navegador suporta Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'pt-BR';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      processVoiceCommand(transcript);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        toast.error('Nenhum comando detectado');
      } else {
        toast.error('Erro ao processar comando de voz');
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, []);

  const processVoiceCommand = (transcript: string) => {
    // Exemplo: "registrar recebimento de 50 reais do joão"
    // Exemplo: "cobrar 100 reais da maria"
    
    const patterns = [
      /(?:registrar|receber|recebi)\s+(?:recebimento\s+de\s+)?(\d+(?:[,\.]\d+)?)\s+reais?\s+(?:de|do|da)\s+(\w+)/i,
      /cobrar\s+(\d+(?:[,\.]\d+)?)\s+reais?\s+(?:de|do|da)\s+(\w+)/i,
    ];

    let matched = false;

    for (const pattern of patterns) {
      const match = transcript.match(pattern);
      
      if (match) {
        matched = true;
        const valor = parseFloat(match[1].replace(',', '.'));
        const nomeCliente = match[2].toLowerCase();

        // Buscar cliente pelo nome
        const cliente = clientes.find(c => 
          c.nome.toLowerCase().includes(nomeCliente)
        );

        if (!cliente) {
          toast.error(`Cliente "${match[2]}" não encontrado`, {
            description: 'Cadastre o cliente primeiro',
          });
          return;
        }

        // Criar cobrança via voz
        const hoje = new Date();
        const vencimento = new Date(hoje);
        vencimento.setDate(vencimento.getDate() + 7); // Vencimento em 7 dias

        onAddCobranca({
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          valor,
          descricao: `Cobrança criada por comando de voz`,
          dataVencimento: vencimento.toISOString(),
          status: 'pendente',
        });

        toast.success(`Cobrança de R$ ${valor.toFixed(2)} para ${cliente.nome} criada!`, {
          description: 'Vencimento em 7 dias',
        });

        return;
      }
    }

    if (!matched) {
      toast.error('Comando não reconhecido', {
        description: 'Tente: "Cobrar 50 reais do João"',
      });
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      toast.info('Escutando...', {
        description: 'Diga: "Cobrar 50 reais do João"',
      });
    }
  };

  if (!supported) {
    return null; // Não mostrar botão se não houver suporte
  }

  return (
    <Button
      onClick={toggleListening}
      variant={isListening ? 'default' : 'outline'}
      size="sm"
      className={isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4 mr-1" />
          Parar
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-1" />
          Voz
        </>
      )}
    </Button>
  );
}
