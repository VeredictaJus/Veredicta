import { useState, useEffect, useCallback, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { calculateProgress } from '@/utils/progress';
import { WriterProfile } from '@/types';
import { FileText, DollarSign, Clock, Star, CheckCircle, PartyPopper, MessageSquare, Calculator, AlertTriangle, X, Bell } from 'lucide-react';
import { DatabaseService, Petition as RealPetition, Payment, WriterRatingStats } from '@/services/databaseService';
import RatingDisplay from '@/components/ratings/RatingDisplay';
import { supabase } from '@/lib/supabaseClient';
import { useDeadlineAlert } from '@/hooks/useDeadlineAlert';
import SuspensionAlert from '@/components/Writer/SuspensionAlert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NotificationDropdown from '@/components/Notifications/NotificationDropdown';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle';

const petitionTypes = [
  { value: 'TODOS', label: 'Todos os Tipos' },
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'CONTESTACAO', label: 'Contestação' },
  { value: 'RECURSO', label: 'Recurso' },
  { value: 'MANDADO_SEGURANCA', label: 'Mandado de Segurança' },
  { value: 'EMBARGOS_DECLARACAO', label: 'Embargos de Declaração' },
  { value: 'APELACAO', label: 'Apelação' },
  { value: 'AGRAVO', label: 'Agravo' },
  { value: 'HABEAS_CORPUS', label: 'Habeas Corpus' },
  { value: 'MANDADO_INJUNCAO', label: 'Mandado de Injunção' },
  { value: 'ACAO_RESCISORIA', label: 'Ação Rescisória' },
  { value: 'EXECUCAO', label: 'Execução' },
  { value: 'CUMPRIMENTO_SENTENCA', label: 'Cumprimento de Sentença' },
  { value: 'CAUTELAR', label: 'Cautelar' },
  { value: 'TUTELA_ANTECIPADA', label: 'Tutela Antecipada' }
];

// Mock data removed - using real data from Supabase

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-orange-100 text-orange-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Disponível';
    case 'assigned': return 'Atribuída';
    case 'in_progress': return 'Em Andamento';
    case 'completed': return 'Finalizada';
    case 'delivered': return 'Entregue';
    default: return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'text-red-600';
    case 'HIGH': return 'text-orange-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'LOW': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export default function WriterDashboard() {
  const { user } = useNewAuth();
  const { profile: userProfile } = useUser();
  const { unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };
  
  // Real-time data states
const [availablePetitions, setAvailablePetitions] = useState<RealPetition[]>([]);
const [myPetitions, setMyPetitions] = useState<RealPetition[]>([]);
const [payments, setPayments] = useState<Payment[]>([]);
const [writerBalance, setWriterBalance] = useState<{ available_balance: number; total_earned: number; penalties_total: number } | null>(null);
const [ratingStats, setRatingStats] = useState<WriterRatingStats>({
  average_rating: 0,
  total_ratings: 0,
  rating_distribution: {}
});

const [loading, setLoading] = useState(true);
const [showAllPetitions, setShowAllPetitions] = useState(false);
const [selectedPetitionType, setSelectedPetitionType] = useState('TODOS');
const [showUploadModal, setShowUploadModal] = useState(false);
const [selectedPetitionForUpload, setSelectedPetitionForUpload] = useState<string | null>(null);
const [uploadFile, setUploadFile] = useState<File | null>(null);
const [uploadProgress, setUploadProgress] = useState(0);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [selectedPetition, setSelectedPetition] = useState<RealPetition | null>(null);
const [showMyPetitionDetailsModal, setShowMyPetitionDetailsModal] = useState(false);
const [selectedMyPetition, setSelectedMyPetition] = useState<RealPetition | null>(null);
const [showWelcomeModal, setShowWelcomeModal] = useState(false);
const [hasPendingCorrection, setHasPendingCorrection] = useState(false);

  // ========= Hook de Alerta de Deadline (1h antes) =========
  const { alerts: deadlineAlerts, dismissAll: dismissDeadlineAlerts } = useDeadlineAlert();
  

  // ========= Função para verificar se há correção pendente =========
  const checkPendingCorrection = async (petitionId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('corrections')
        .select('id, status')
        .eq('petition_id', petitionId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar correção pendente:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar correção:', error);
      return false;
    }
  };

  // ========= Verificar correção pendente quando petição é selecionada =========
  useEffect(() => {
    async function loadCorrectionStatus() {
      if (!selectedMyPetition?.id) {
        setHasPendingCorrection(false);
        return;
      }

      const hasPending = await checkPendingCorrection(selectedMyPetition.id);
      setHasPendingCorrection(hasPending);
    }

    loadCorrectionStatus();
  }, [selectedMyPetition?.id]);

  // Verificar se é o primeiro acesso após aprovação
  useEffect(() => {
    const checkFirstAccess = async () => {
      if (!user?.uid) return;

      // Primeiro, verificar localStorage (mais rápido e confiável)
      const hasSeenInLocalStorage = localStorage.getItem(`writer_welcome_${user.uid}`);
      if (hasSeenInLocalStorage === 'true') {
        return; // Já viu, não mostrar
      }

      // Se não viu no localStorage, verificar no banco de dados
      try {
        const { data: profile, error } = await supabase
          .from('profiles_v2')
          .select('has_seen_welcome_modal, metadata')
          .eq('firebase_uid', user.uid)
          .maybeSingle();

        // Se encontrou no banco e já viu, não mostrar e atualizar localStorage
        if (profile && (profile.has_seen_welcome_modal || (profile.metadata as any)?.has_seen_welcome_modal)) {
          localStorage.setItem(`writer_welcome_${user.uid}`, 'true');
          return;
        }

        // Se chegou aqui, é a primeira vez - mostrar modal
        setShowWelcomeModal(true);
        
        // Marcar como visto no localStorage imediatamente (antes mesmo de fechar)
        localStorage.setItem(`writer_welcome_${user.uid}`, 'true');
        
        // Tentar marcar no banco de dados (não crítico se falhar)
        try {
          // Tentar atualizar a coluna has_seen_welcome_modal se existir
          await supabase
            .from('profiles_v2')
            .update({ has_seen_welcome_modal: true })
            .eq('firebase_uid', user.uid);
        } catch (dbError) {
          // Se a coluna não existir, tentar salvar no metadata
          try {
            const currentMetadata = (profile?.metadata as any) || {};
            await supabase
              .from('profiles_v2')
              .update({ 
                metadata: { ...currentMetadata, has_seen_welcome_modal: true }
              })
              .eq('firebase_uid', user.uid);
          } catch (metadataError) {
            // Se falhar, não é crítico - localStorage já está marcado
            console.warn('Não foi possível salvar no banco, mas localStorage está marcado');
          }
        }
      } catch (error) {
        // Em caso de erro, usar apenas localStorage
        console.error('Erro ao verificar modal de boas-vindas:', error);
        if (!hasSeenInLocalStorage) {
          setShowWelcomeModal(true);
          localStorage.setItem(`writer_welcome_${user.uid}`, 'true');
        }
      }
    };

    if (user?.uid) {
      checkFirstAccess();
    }
  }, [user?.uid]);

  // Load real dashboard data and setup real-time subscriptions
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      
      try {
        const [available, mine, paymentData, ratings, balanceData] = await Promise.all([
          DatabaseService.getAvailablePetitions(user.uid, false),
          DatabaseService.getWriterPetitions(user.uid),
          DatabaseService.getWriterPayments(user.uid),
          DatabaseService.getWriterRatingStats(user.uid),
          // Buscar saldo do redator (available_balance = pagamento pendente)
          supabase
            .from('writer_balance')
            .select('available_balance, total_earned, penalties_total')
            .eq('writer_id', user.uid)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error && error.code !== 'PGRST116') {
                console.warn('⚠️ Erro ao buscar writer_balance:', error);
              }
              return data;
            })
        ]);
        
        startTransition(() => {
          setAvailablePetitions(available);
          setMyPetitions(mine);
          setPayments(paymentData);
          setRatingStats(ratings);
          setWriterBalance(balanceData || null);
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Setup real-time subscriptions
    if (!user?.uid) return;
    
    const availableSubscription = DatabaseService.subscribeToAvailablePetitions(
      (petitions) => {
        startTransition(() => {
          setAvailablePetitions(petitions);
        });
      },
      user.uid,
      false
    );
    
    // ✅ CORREÇÃO: Subscription será validada dentro do método
    const myPetitionsSubscription = DatabaseService.subscribeToWriterPetitions(
      user.uid, 
      (petitions) => {
        startTransition(() => {
          setMyPetitions(petitions);
        });
      }
    );
    
    const ratingsSubscription = DatabaseService.subscribeToWriterRatings(
      user.uid, 
      (stats) => {
        startTransition(() => {
          setRatingStats(stats);
        });
      }
    );
    
    return () => {
      // ✅ CORREÇÃO: Verificar se subscriptions existem e têm método unsubscribe antes de chamar
      if (availableSubscription && typeof availableSubscription.unsubscribe === 'function') {
        availableSubscription.unsubscribe();
      }
      if (myPetitionsSubscription && typeof myPetitionsSubscription.unsubscribe === 'function') {
        myPetitionsSubscription.unsubscribe();
      }
      if (ratingsSubscription && typeof ratingsSubscription.unsubscribe === 'function') {
        ratingsSubscription.unsubscribe();
      }
    };
  }, [user?.uid]);

  // Calculate real statistics from database data
  const availableCount = availablePetitions.length;
  
  // Em Andamento: incluir in_progress, assigned, revision, pending_review
  const activeCount = myPetitions.filter(p => {
    const status = p.status as string;
    return status === 'in_progress' || 
           status === 'assigned' || 
           status === 'revision' || 
           status === 'pending_review';
  }).length;
  
  // Concluídas: incluir completed, approved, delivered
  const completedCount = myPetitions.filter(p => 
    p.status === 'completed' || 
    p.status === 'approved' || 
    p.status === 'delivered'
  ).length;
  
  const totalEarnings = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  
  // "A Receber" deve usar available_balance (saldo disponível pendente) se disponível,
  // caso contrário, usar pagamentos pendentes da tabela de pagamentos
  const pendingEarnings = writerBalance?.available_balance ?? 
    payments.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.amount, 0);

  const dashboardStats = {
    availablePetitions: availableCount,
    myActivePetitions: activeCount,
    completedThisMonth: completedCount,
    pendingPayment: pendingEarnings,
    rating: ratingStats.average_rating,
    totalRatings: ratingStats.total_ratings
  };

  const filteredAvailablePetitions = availablePetitions.filter(petition => {
    if (selectedPetitionType === 'TODOS') return true;
    return petition.type === selectedPetitionType;
  });
  
  const petitionsToShow = showAllPetitions ? filteredAvailablePetitions : filteredAvailablePetitions.slice(0, 2);

  const handleAcceptPetition = (petitionId: string) => {
    alert(`Petição ${petitionId} aceita com sucesso!`);
    window.location.reload();
  };

  const handleUploadPetition = (petitionId: string) => {
    setSelectedPetitionForUpload(petitionId);
    setShowUploadModal(true);
  };

  const handleViewDetails = (petition: RealPetition) => {
    setSelectedPetition(petition);
    setShowDetailsModal(true);
  };

  const handleViewMyPetitionDetails = (petition: RealPetition) => {
    setSelectedMyPetition(petition);
    setShowMyPetitionDetailsModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        if (file.size <= 10 * 1024 * 1024) {
          setUploadFile(file);
        } else {
          alert('Arquivo muito grande. Máximo 10MB');
        }
      } else {
        alert('Tipo de arquivo não permitido. Apenas PDF, DOC e DOCX.');
      }
    }
  };

  const submitUpload = () => {
    if (!uploadFile) return;
    
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            alert(`Petição enviada com sucesso!`);
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadProgress(0);
            setSelectedPetitionForUpload(null);
          }, 500);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Suspensão */}
      <SuspensionAlert />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard do Redator</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {userProfile?.name || user?.email || 'Redator'}. Acompanhe suas petições, ganhos e avaliações em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SimpleThemeToggle className="rounded-md p-2 hover:bg-muted transition border border-border/60 bg-card/60" />
          <Popover
            open={notifOpen}
            onOpenChange={(open) => {
              setNotifOpen(open);
              if (open) markAllAsRead();
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="relative rounded-md p-2 hover:bg-muted transition border border-border/60 bg-card/60"
                aria-label="Abrir notificações"
              >
                <Bell size={18} className="text-orange-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[360px] p-0">
              <NotificationDropdown onSeeAll={() => setNotifOpen(false)} />
            </PopoverContent>
          </Popover>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-muted-foreground animate-pulse" />
              <span className="text-muted-foreground">Carregando...</span>
            </div>
          ) : (
            <RatingDisplay
              averageRating={dashboardStats.rating}
              totalRatings={dashboardStats.totalRatings}
              showCount={true}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card glowDot className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{dashboardStats.availablePetitions}</div>
            <p className="text-xs text-muted-foreground">Petições para aceitar</p>
          </CardContent>
        </Card>

        <Card glowDot className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{dashboardStats.myActivePetitions}</div>
            <p className="text-xs text-muted-foreground">Minhas petições</p>
          </CardContent>
        </Card>

        <Card glowDot className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{loading ? '...' : dashboardStats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Total realizadas</p>
          </CardContent>
        </Card>

        <Card glowDot className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">R$ {loading ? '...' : dashboardStats.pendingPayment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pagamento pendente</p>
          </CardContent>
        </Card>

        <Card glowDot className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">{dashboardStats.rating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.totalRatings} avaliação(ões)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de Avaliações Recebidas */}
      <Card className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Minhas Avaliações
              </CardTitle>
              <CardDescription className="!whitespace-nowrap !max-w-none !overflow-visible">
                Feedback dos clientes sobre seu trabalho
              </CardDescription>
            </div>
            {ratingStats.total_ratings > 0 && (
              <RatingDisplay
                averageRating={ratingStats.average_rating}
                totalRatings={ratingStats.total_ratings}
                size="lg"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <Star className="h-5 w-5 text-muted-foreground animate-pulse" />
                <span className="text-muted-foreground">Carregando avaliações...</span>
              </div>
            </div>
          ) : ratingStats.total_ratings > 0 ? (
            <div className="space-y-4">
              {/* Distribuição de Estrelas */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingStats.rating_distribution[stars] || 0;
                  const percentage = ratingStats.total_ratings > 0 
                    ? (count / ratingStats.total_ratings) * 100 
                    : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-8">{stars}★</span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mensagem de incentivo ou aviso */}
              {ratingStats.average_rating < 3.8 && ratingStats.total_ratings >= 3 ? (
                // ⚠️ AVISO: Avaliação abaixo de 3.8 (com 3+ avaliações)
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2 font-semibold">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    ⚠️ Atenção! Sua média de avaliação está abaixo do mínimo exigido (3.8 estrelas).
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-2 ml-7">
                    Para continuar aceitando petições, você precisa melhorar a qualidade do seu trabalho. Entre em contato com o suporte para orientações.
                  </p>
                </div>
              ) : (
                // ✅ MENSAGEM POSITIVA: Avaliação boa
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Continue o ótimo trabalho! Suas avaliações ajudam a conquistar mais clientes.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">Você ainda não recebeu avaliações.</p>
              <p className="text-sm mt-1">Complete suas primeiras petições para receber feedback dos clientes!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Petições em Desenvolvimento</CardTitle>
              <CardDescription className="!whitespace-nowrap !max-w-none !overflow-visible">
                Acompanhe o progresso dos seus trabalhos ativos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {myPetitions.filter(petition => petition.status !== 'approved' && petition.status !== 'cancelled').map((petition) => (
              <div key={petition.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">
                      {petition.display_id || `#${petition.id.substring(0, 8)}`}
                    </span>
                    {petition.assigned_writer_id && (
                      <Badge className="bg-green-500 text-white shadow-sm">
                        Petição Atribuída
                      </Badge>
                    )}
                    <Badge className="bg-orange-500 text-white shadow-sm">
                      Em Desenvolvimento
                    </Badge>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{petition.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{petition.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-300">
                    <span>Prazo: {new Date(petition.deadline).toLocaleDateString('pt-BR')}</span>
                    <span>Valor: R$ {petition.price}</span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">Progresso</span>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">{calculateProgress(petition.status)}%</span>
                    </div>
                    <div className="w-full bg-orange-100 dark:bg-slate-700 rounded-full h-2.5 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500 shadow-sm" 
                        style={{ width: `${calculateProgress(petition.status)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/writer/chat')}
                    className="bg-green-500/10 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewMyPetitionDetails(petition)}
                    className="bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
            
            {myPetitions.filter(petition => petition.status !== 'approved' && petition.status !== 'cancelled').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhuma petição em desenvolvimento</p>
                <p className="text-sm">Suas petições em andamento aparecerão aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showUploadModal && selectedPetitionForUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Upload da Petição</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadProgress(0);
                  setSelectedPetitionForUpload(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="block font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Petição: #{selectedPetitionForUpload}
                </label>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Faça upload do arquivo da petição finalizada para o cliente
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-3">
                    <div className="text-5xl">📄</div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Clique para selecionar arquivo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ou arraste e solte aqui
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block">
                      PDF, DOC, DOCX (máximo 10MB)
                    </p>
                  </div>
                </label>
              </div>
              
              {uploadFile && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📎</div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{uploadFile.name}</p>
                      <p className="text-sm text-green-700">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadFile(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              )}
              
              {uploadProgress > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-blue-600">Enviando petição...</span>
                    <span className="text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={submitUpload}
                  disabled={!uploadFile || uploadProgress > 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {uploadProgress > 0 ? 'Enviando...' : 'Enviar Petição'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadProgress(0);
                    setSelectedPetitionForUpload(null);
                  }}
                  disabled={uploadProgress > 0}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Petição Disponível - Padronizado */}
      {showDetailsModal && selectedPetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedPetition.title}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie o trabalho e faça uploads</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* ID da Petição */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">ID da Petição</label>
                  <p className="text-foreground font-mono">{selectedPetition.display_id || `#${selectedPetition.id.substring(0, 8)}`}</p>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Descrição</label>
                  <p className="text-foreground">{selectedPetition.description || 'Sem descrição'}</p>
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Cliente</label>
                  <p className="text-foreground truncate" title={selectedPetition.client_name || 'Não informado'}>
                    {truncateLongName(selectedPetition.client_name) || 'Não informado'}
                  </p>
                </div>

                {/* Localização do Cliente */}
                {selectedPetition.client_location && (
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">Localização</label>
                    <p className="text-foreground">{selectedPetition.client_location}</p>
                  </div>
                )}
                
                {/* Prazo */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Prazo</label>
                  <p className="text-foreground">{new Date(selectedPetition.deadline).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Valor</label>
                  <p className="text-foreground">R$ {selectedPetition.price.toFixed(2)}</p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Tipo</label>
                  <p className="text-foreground">{selectedPetition.type}</p>
                </div>

                {/* Necessidade de Cálculo */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Requer Cálculo Trabalhista</label>
                  {selectedPetition.requires_labor_calculation ? (
                    <Badge className="bg-blue-500 text-white">
                      <Calculator className="h-3 w-3 mr-1" />
                      Sim - Cálculo necessário
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500 text-white">
                      Não requer cálculo
                    </Badge>
                  )}
                </div>
                
                {/* Arquivos Recebidos */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2">Arquivos Recebidos</label>
                  {selectedPetition.files_count > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {selectedPetition.files_count} arquivo(s) anexado(s)
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum arquivo anexado</p>
                  )}
                </div>
                
                {/* Observações */}
                <div>
                  <textarea
                    placeholder="Adicione observações sobre o trabalho..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-16 text-sm bg-white dark:bg-gray-700 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Botão de Ação */}
            <div className="px-6 pb-6">
              <Button 
                onClick={() => {
                  setShowDetailsModal(false);
                  handleAcceptPetition(selectedPetition.id);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
              >
                Aceitar Esta Petição
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Minha Petição - Padronizado Exato */}
      {showMyPetitionDetailsModal && selectedMyPetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedMyPetition.title}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie o trabalho e faça uploads</p>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMyPetitionDetailsModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* ID da Petição */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">ID da Petição</label>
                  <p className="text-foreground font-mono">{selectedMyPetition.display_id || `#${selectedMyPetition.id.substring(0, 8)}`}</p>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Descrição</label>
                  <p className="text-foreground">{selectedMyPetition.description || 'Sem descrição'}</p>
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Cliente</label>
                  <p className="text-foreground truncate" title={selectedMyPetition.client_name || 'Não informado'}>
                    {truncateLongName(selectedMyPetition.client_name) || 'Não informado'}
                  </p>
                </div>

                {/* Localização do Cliente */}
                {selectedMyPetition.client_location && (
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">Localização</label>
                    <p className="text-foreground">{selectedMyPetition.client_location}</p>
                  </div>
                )}
                
                {/* Prazo */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Prazo</label>
                  <p className="text-foreground">{new Date(selectedMyPetition.deadline).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Valor</label>
                  <p className="text-foreground">R$ {selectedMyPetition.price.toFixed(2)}</p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Tipo</label>
                  <p className="text-foreground">{selectedMyPetition.type}</p>
                </div>

                {/* Necessidade de Cálculo */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">Requer Cálculo Trabalhista</label>
                  {selectedMyPetition.requires_labor_calculation ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">
                        <Calculator className="h-3 w-3 mr-1" />
                        Sim - Cálculo necessário
                      </Badge>
                      {selectedMyPetition.calculation_id && (
                        <Badge className="bg-green-500 text-white">
                          ✓ Cálculo anexado
                        </Badge>
                      )}
                      {!selectedMyPetition.calculation_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/writer/calculator', { 
                            state: { 
                              petitionId: selectedMyPetition.id,
                              petitionTitle: selectedMyPetition.title,
                              clientName: selectedMyPetition.client_name
                            }
                          })}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          Fazer Cálculo
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Badge className="bg-gray-500 text-white">
                      Não requer cálculo
                    </Badge>
                  )}
                </div>
                
                {/* Arquivos Recebidos */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2">Arquivos Recebidos</label>
                  {selectedMyPetition.files_count > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {selectedMyPetition.files_count} arquivo(s) anexado(s)
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum arquivo anexado</p>
                  )}
                </div>
                
                {/* Mensagem informativa */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Para fazer upload de arquivos e enviar para correção, acesse a aba <strong>Minhas Petições</strong>.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botão de Ação */}
            <div className="px-6 pb-6">
              <Button 
                onClick={() => {
                  setShowMyPetitionDetailsModal(false);
                  navigate('/writer/my-petitions');
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 gap-2"
              >
                <FileText className="h-4 w-4" />
                Ir para Minhas Petições
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Boas-Vindas - Primeiro Acesso Após Aprovação */}
      <Dialog 
        open={showWelcomeModal} 
        onOpenChange={async (open) => {
          if (!open && user?.uid) {
            // Quando fechar o modal, garantir que está marcado
            // (já deve estar marcado no localStorage, mas garantir no banco também)
            try {
              // Tentar atualizar a coluna has_seen_welcome_modal se existir
              await supabase
                .from('profiles_v2')
                .update({ has_seen_welcome_modal: true })
                .eq('firebase_uid', user.uid);
            } catch (dbError) {
              // Se a coluna não existir, tentar salvar no metadata
              try {
                const { data: profile } = await supabase
                  .from('profiles_v2')
                  .select('metadata')
                  .eq('firebase_uid', user.uid)
                  .maybeSingle();
                
                const currentMetadata = (profile?.metadata as any) || {};
                await supabase
                  .from('profiles_v2')
                  .update({ 
                    metadata: { ...currentMetadata, has_seen_welcome_modal: true }
                  })
                  .eq('firebase_uid', user.uid);
              } catch (metadataError) {
                // Não é crítico - localStorage já está marcado
              }
            }
            // Garantir localStorage (já deve estar, mas garantir)
            localStorage.setItem(`writer_welcome_${user.uid}`, 'true');
          }
          setShowWelcomeModal(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <PartyPopper className="h-7 w-7 text-orange-600" />
              Parabéns! Você foi aprovado! 🎉
            </DialogTitle>
            <DialogDescription className="text-base">
              Bem-vindo à plataforma Veredicta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Sua conta foi aprovada!
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    Nossa equipe analisou suas petições autorais e documentos profissionais. 
                    Ficamos impressionados com a qualidade do seu trabalho!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Próximos passos:
              </h4>
              
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <p>Explore as <strong>petições disponíveis</strong> e escolha aquelas que mais se adequam à sua especialização</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <p>Aceite petições e envie seu trabalho com <strong>qualidade e dentro do prazo</strong></p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <p>Acompanhe seus <strong>ganhos e avaliações</strong> para construir uma reputação sólida</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Dica:</strong> Mantenha uma comunicação clara com os clientes e 
                  entregue sempre com qualidade. Isso aumentará suas avaliações e oportunidades!
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button 
                onClick={async () => {
                  setShowWelcomeModal(false);
                  // Garantir que está marcado (já deve estar, mas garantir)
                  if (user?.uid) {
                    try {
                      await supabase
                        .from('profiles_v2')
                        .update({ has_seen_welcome_modal: true })
                        .eq('firebase_uid', user.uid);
                    } catch (dbError) {
                      // Se a coluna não existir, tentar salvar no metadata
                      try {
                        const { data: profile } = await supabase
                          .from('profiles_v2')
                          .select('metadata')
                          .eq('firebase_uid', user.uid)
                          .maybeSingle();
                        
                        const currentMetadata = (profile?.metadata as any) || {};
                        await supabase
                          .from('profiles_v2')
                          .update({ 
                            metadata: { ...currentMetadata, has_seen_welcome_modal: true }
                          })
                          .eq('firebase_uid', user.uid);
                      } catch (metadataError) {
                        // Não é crítico - localStorage já está marcado
                      }
                    }
                    localStorage.setItem(`writer_welcome_${user.uid}`, 'true');
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 px-8"
                size="lg"
              >
                Começar a Trabalhar!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔔 Modal de Alerta de Deadline (1h antes) */}
      {deadlineAlerts.length > 0 && (
        <AlertDialog 
          open={deadlineAlerts.length > 0} 
          onOpenChange={(open) => { 
            // ✅ CORREÇÃO: Verificar se a função existe antes de chamar
            if (!open && dismissDeadlineAlerts && typeof dismissDeadlineAlerts === 'function') {
              dismissDeadlineAlerts(); 
            }
          }}
        >
          <AlertDialogContent className="max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 rounded-full z-10"
              onClick={() => {
                // ✅ CORREÇÃO: Verificar se a função existe antes de chamar
                if (dismissDeadlineAlerts && typeof dismissDeadlineAlerts === 'function') {
                  dismissDeadlineAlerts();
                }
              }}
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl">⏰ Prazo Próximo!</AlertDialogTitle>
                  <p className="text-sm text-muted-foreground">Falta aproximadamente 1 hora para a entrega</p>
                </div>
              </div>
            </AlertDialogHeader>

            <AlertDialogDescription className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2">📋 Petição:</p>
                <p className="text-sm text-foreground font-medium">{deadlineAlerts[0].title}</p>
              </div>

              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">
                  Prazo: {format(new Date(deadlineAlerts[0].deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Faltam aproximadamente <strong className="text-orange-600 dark:text-orange-400">{deadlineAlerts[0].minutesRemaining} minutos</strong> para o prazo final de entrega.
              </p>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Lembre-se:</strong> O prazo oficial é até às <strong>18h</strong>, com tolerância até <strong>19h</strong>.
                </p>
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter>
              <AlertDialogAction 
                onClick={() => {
                  // ✅ CORREÇÃO: Verificar se a função existe antes de chamar
                  if (dismissDeadlineAlerts && typeof dismissDeadlineAlerts === 'function') {
                    dismissDeadlineAlerts();
                  }
                }} 
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
              >
                Entendi, vou finalizar! ✅
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
