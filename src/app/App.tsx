import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { CobrancasList } from './components/CobrancasList';
import { NewCobranca } from './components/NewCobranca';
import { Confetti } from './components/Confetti';
import { Footer } from './components/Footer';
import { GoogleLogin } from './components/GoogleLogin';
import { QuickPixButton } from './components/QuickPixButton';
import { VoiceCommand } from './components/VoiceCommand';
import { ModoMaratona } from './components/ModoMaratona';
import { ThemeToggle } from './components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { DollarSign, Zap } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  createdAt: string;
}

export interface Cobranca {
  id: string;
  clienteId: string;
  clienteNome: string;
  valor: number;
  descricao: string;
  dataVencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  pixKey: string;
  ultimoLembrete?: string;
  dataPagamento?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  cobrancaId: string;
  tipo: 'lembrete_previo' | 'vencimento' | 'atraso';
  mensagem: string;
  dataEnvio: string;
  status: 'enviado' | 'pendente';
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [maratonaOpen, setMaratonaOpen] = useState(false);

  // Usar hook customizado para dados do Firestore
  const {
    clientes,
    cobrancas,
    loading: dataLoading,
    addCliente,
    addCobranca,
    updateCobrancaStatus,
  } = useFirestoreData(user);

  const followUps: FollowUp[] = []; // Será implementado depois

  // Monitorar estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateCobrancaStatus = async (id: string, status: Cobranca['status']) => {
    await updateCobrancaStatus(id, status);
    
    // Mostrar confete quando marcar como pago
    if (status === 'pago') {
      setShowConfetti(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-[#00E676] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando CobraPro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Toaster />
      {user && <QuickPixButton />}
      {user && <ModoMaratona cobrancas={cobrancas} isOpen={maratonaOpen} onClose={() => setMaratonaOpen(false)} />}
      
      <header className="bg-white dark:bg-gray-900 border-b border-border shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#004D40] to-[#00E676] p-2.5 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-primary dark:text-[#00E676]">CobraPro</h1>
                <p className="text-sm text-muted-foreground">Gestão de Cobranças Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user && (
                <>
                  <Button
                    onClick={() => setMaratonaOpen(true)}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-[#00E676] text-[#004D40] dark:text-[#00E676] hover:bg-[#00E676]/10"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Modo Maratona
                  </Button>
                  <VoiceCommand
                    clientes={clientes}
                    onAddCobranca={addCobranca}
                  />
                </>
              )}
              <GoogleLogin user={user} onUserChange={setUser} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-[#004D40] to-[#00E676] p-4 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <DollarSign className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl text-[#004D40] dark:text-[#00E676] mb-4">Bem-vindo ao CobraPro</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Automatize suas cobranças via PIX e WhatsApp. Economize 2 horas semanais e reduza inadimplência em 10%.
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-lg mx-auto shadow-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg text-[#004D40] dark:text-[#00E676] mb-4">Faça login para começar</h3>
              <GoogleLogin user={user} onUserChange={setUser} />
            </div>
          </div>
        ) : dataLoading ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 border-4 border-[#00E676] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando seus dados...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Botão Modo Maratona Mobile */}
            <Button
              onClick={() => setMaratonaOpen(true)}
              className="w-full sm:hidden bg-gradient-to-r from-[#004D40] to-[#00E676] text-white h-12"
            >
              <Zap className="h-5 w-5 mr-2" />
              🚀 Modo Maratona - Enviar em Sequência
            </Button>

            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="cobrancas">Cobranças</TabsTrigger>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
                <TabsTrigger value="nova">Nova Cobrança</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <Dashboard cobrancas={cobrancas} followUps={followUps} />
              </TabsContent>

              <TabsContent value="cobrancas">
                <CobrancasList
                  cobrancas={cobrancas}
                  onUpdateStatus={handleUpdateCobrancaStatus}
                />
              </TabsContent>

              <TabsContent value="clientes">
                <ClientList clientes={clientes} onAddCliente={addCliente} />
              </TabsContent>

              <TabsContent value="nova">
                <NewCobranca clientes={clientes} onAddCobranca={addCobranca} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;