import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import QRCode from 'react-qr-code';
import { Zap, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface QuickPixButtonProps {
  onPixGenerated?: (valor: number, pixKey: string) => void;
}

export function QuickPixButton({ onPixGenerated }: QuickPixButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [valor, setValor] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGeneratePix = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valor || parseFloat(valor) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    // Gerar chave PIX simulada (em produção, integrar com API do banco)
    const amount = parseFloat(valor);
    const generatedKey = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(7)}-quick5204000053039865802BR5913CobraPro Sys6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    setPixKey(generatedKey);
    
    if (onPixGenerated) {
      onPixGenerated(amount, generatedKey);
    }

    toast.success(`QR Code PIX de R$ ${amount.toFixed(2)} gerado!`);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success('Chave PIX copiada!');
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setValor('');
    setPixKey('');
    setCopied(false);
  };

  return (
    <>
      {/* Botão Flutuante de Pânico */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-[#004D40] to-[#00E676] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 z-50 group"
        aria-label="Gerar PIX Rápido"
      >
        <Zap className="h-8 w-8 animate-pulse" />
        <span className="absolute right-full mr-3 bg-[#004D40] text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          PIX Rápido ⚡
        </span>
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#004D40] flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00E676]" />
              PIX Rápido - Botão de Pânico
            </DialogTitle>
          </DialogHeader>

          {!pixKey ? (
            <form onSubmit={handleGeneratePix} className="space-y-4">
              <div>
                <Label htmlFor="valor-rapido">Valor a Receber</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    id="valor-rapido"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="150,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00E676] hover:bg-[#00C853] text-[#004D40] shadow-lg"
              >
                <Zap className="mr-2 h-4 w-4" />
                Gerar QR Code Agora
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-[#00E676]">
                <QRCode
                  value={pixKey}
                  size={200}
                  level="M"
                  fgColor="#004D40"
                />
              </div>

              {/* Valor */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-3xl text-[#004D40]">
                  R$ {parseFloat(valor).toFixed(2)}
                </p>
              </div>

              {/* Copiar Chave */}
              <Button
                onClick={handleCopyPix}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Chave PIX
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Envie o QR Code ou a chave PIX para seu cliente
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
