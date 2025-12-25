import { Shield, Zap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-[#004D40] to-[#00E676] p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm text-[#004D40] mb-1">Follow-up Automático</h4>
              <p className="text-xs text-muted-foreground">
                O sistema envia lembretes 2 dias antes, no vencimento e após atraso
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-[#004D40] to-[#00E676] p-2 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm text-[#004D40] mb-1">Sem Desgaste Emocional</h4>
              <p className="text-xs text-muted-foreground">
                As cobranças vão do "Sistema CobraPro", não de você
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-[#004D40] to-[#00E676] p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm text-[#004D40] mb-1">Profissional e Simples</h4>
              <p className="text-xs text-muted-foreground">
                Interface intuitiva que qualquer pessoa pode usar
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            CobraPro © 2024 - Gestão de Cobranças para Microempreendedores
          </p>
        </div>
      </div>
    </footer>
  );
}
