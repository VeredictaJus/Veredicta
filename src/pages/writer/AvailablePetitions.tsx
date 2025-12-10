import { useState, useEffect, startTransition } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Clock, DollarSign, FileText, MapPin, AlertCircle, CheckCircle2, Calculator, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { WriterProfile } from '@/types';
import { getCurrentYear, getFormattedDate } from '@/utils/dateUtils';
import { DatabaseService, Petition } from '@/services/databaseService';
import { supabase } from '@/lib/supabaseClient';

// Remove mock data - using real data from database

const priorityConfig = {
  normal: { label: 'Normal', color: 'bg-gray-100 text-gray-800', multiplier: 1 },
  urgent: { label: 'Urgente', color: 'bg-orange-100 text-orange-800', multiplier: 1.5 },
  express: { label: 'Express', color: 'bg-red-100 text-red-800', multiplier: 2 }
};

export default function AvailablePetitions() {
  const { user } = useNewAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ✅ Função auxiliar para truncar nomes muito longos (> 50 caracteres)
  const truncateLongName = (name: string | undefined | null): string => {
    if (!name) return '';
    if (name.length > 50) {
      return name.substring(0, 47) + '...';
    }
    return name;
  };

  // ✅ Função para abrir arquivo da petição (bucket agora é público)
  const handleOpenPetitionFile = (fileUrl: string | undefined | null) => {
    if (!fileUrl) {
      toast.error('URL do arquivo não encontrada.');
      return;
    }
    
    // Se é uma URL completa, usar diretamente
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Se é apenas um caminho, gerar URL pública
    const { data } = supabase.storage
      .from('petition_files')
      .getPublicUrl(fileUrl);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Erro ao abrir arquivo. Tente novamente.');
    }
  };
  
  // Declare state variables
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [selectedPetitionFiles, setSelectedPetitionFiles] = useState<any[]>([]);
  useEffect(() => {
    async function loadSelectedPetitionFiles() {
      if (!selectedPetition?.id) {
        setSelectedPetitionFiles([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('petition_files')
          .select('*')
          .eq('petition_id', selectedPetition.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar arquivos da petição disponível:', error);
          setSelectedPetitionFiles([]);
        } else {
          setSelectedPetitionFiles(data || []);
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar arquivos da petição disponível:', err);
        setSelectedPetitionFiles([]);
      }
    }

    loadSelectedPetitionFiles();
  }, [selectedPetition?.id]);
  const [useSpecialtyFilter, setUseSpecialtyFilter] = useState(() => {
    const saved = localStorage.getItem('useSpecialtyFilter');
    return saved === 'true';
  });
  const [writerSpecialties, setWriterSpecialties] = useState<string[]>([]);
  const [allPetitions, setAllPetitions] = useState<Petition[]>([]); // ✅ NOVO: Armazenar todas as petições sem filtro

  // Load writer specialties
  useEffect(() => {
    const loadWriterSpecialties = async () => {
      if (user?.uid) {
        const { data: writerProfile } = await supabase
          .from('profiles_v2')
          .select('specialties')
          .eq('firebase_uid', user.uid)
          .single();
        
        if (writerProfile?.specialties && Array.isArray(writerProfile.specialties)) {
          setWriterSpecialties(writerProfile.specialties);
        }
      }
    };

    loadWriterSpecialties();
  }, [user?.uid]);

  // ✅ CORREÇÃO: Carregar TODAS as petições uma vez (sem filtro de especialidade)
  // Isso permite filtragem instantânea no cliente
  useEffect(() => {
    const loadPetitions = async () => {
      setLoading(true);
      // Sempre carregar TODAS as petições (sem filtro de especialidade)
      const realPetitions = await DatabaseService.getAvailablePetitions(
        user?.uid,
        false // ✅ SEMPRE false - carregamos tudo e filtramos no cliente
      );
      setAllPetitions(realPetitions);
      setLoading(false);
    };

    loadPetitions();

    // Setup real-time subscription (também sem filtro de especialidade)
    const subscription = DatabaseService.subscribeToAvailablePetitions(
      (newPetitions) => {
        startTransition(() => {
          setAllPetitions(newPetitions);
        });
      },
      user?.uid,
      false // ✅ SEMPRE false - subscriptions recebem tudo
    );

    return () => {
      // ✅ CORREÇÃO: Verificar se subscription existe e tem método unsubscribe antes de chamar
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [user?.uid]); // ✅ Removido useSpecialtyFilter das dependências

  // ✅ NOVO: Aplicar filtro de especialidades no cliente (instantâneo)
  useEffect(() => {
    if (!useSpecialtyFilter || writerSpecialties.length === 0) {
      // Se o filtro está desativado ou não tem especialidades, mostrar todas
      setPetitions(allPetitions);
      return;
    }

    // Filtrar petições que têm pelo menos uma especialidade em comum
    // O servidor filtra pela coluna 'area' da tabela petitions usando query.in('area', writerProfile.specialties)
    const filtered = allPetitions.filter(petition => {
      // Verificar a coluna 'area' da petição (campo do banco de dados)
      const petitionArea = (petition as any).area;
      
      // Se a petição tem uma área definida, verificar se está nas especialidades do redator
      if (petitionArea && writerSpecialties.includes(petitionArea)) {
        return true;
      }

      // Fallback: verificar se há especialidades na lista de specialties da petição
      if (Array.isArray(petition.specialties) && petition.specialties.length > 0) {
        return petition.specialties.some(spec => writerSpecialties.includes(spec));
      }

      // Se não tem área nem especialidades definidas, não mostrar quando o filtro está ativo
      return false;
    });

    setPetitions(filtered);
  }, [allPetitions, useSpecialtyFilter, writerSpecialties]);

  // ✅ NOVO: Salvar preferência do filtro quando mudar
  useEffect(() => {
    localStorage.setItem('useSpecialtyFilter', String(useSpecialtyFilter));
  }, [useSpecialtyFilter]);

  // ========= Processar query params da URL (notificações) =========
  useEffect(() => {
    if (loading || petitions.length === 0) return;

    const petitionId = searchParams.get('petition');

    // Se há um petitionId na URL, abrir o modal da petição
    if (petitionId) {
      const petition = petitions.find(p => p.id === petitionId);
      if (petition) {
        setSelectedPetition(petition);
        
        // Limpar query params após processar
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('petition');
        navigate(`/writer/available${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`, { replace: true });
      }
    }
  }, [loading, petitions, searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const filteredPetitions = petitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || petition.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || petition.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  const handleAcceptPetition = async (petitionId: string) => {
    if (!user?.uid) {
      toast.error('Erro de autenticação. Faça login novamente.');
      return;
    }

    const success = await DatabaseService.acceptPetition(petitionId, user.uid);
    
    if (success) {
      toast.success('Petição aceita! Redirecionando para os detalhes...');
      
      // Create notification for the client
      const petition = petitions.find(p => p.id === petitionId);
      if (petition) {
        await DatabaseService.createNotification({
          user_id: petition.client_id,
          title: 'Petição Aceita',
          message: `Sua petição "${petition.title}" foi aceita por um redator.`,
          type: 'petition_accepted',
          priority: 'normal',
          is_read: false,
          related_entity_type: 'petition',
          related_entity_id: petitionId
        });
      }
      
      // Redirecionar para "Minhas Petições" após 1 segundo
      setTimeout(() => {
        navigate('/writer/my-petitions');
      }, 1000);
    } else {
      toast.error('Erro ao aceitar petição. Tente novamente.');
    }
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Petições Disponíveis</h1>
        <p className="text-muted-foreground">Escolha trabalhos que se adequem ao seu perfil</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-container-primary border-border">
          <CardContent className="bg-container-inner rounded-lg pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">{petitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold">
                  {petitions.filter(p => p.priority === 'urgent' || p.priority === 'express').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                <p className="text-2xl font-bold">
                  R$ {petitions.length > 0 
                    ? Math.round(petitions.reduce((sum, p) => sum + p.price, 0) / petitions.length).toLocaleString()
                    : '0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Prazo Médio</p>
                <p className="text-2xl font-bold">
                  {petitions.length > 0
                    ? Math.round(petitions.reduce((sum, p) => sum + calculateDaysLeft(p.deadline), 0) / petitions.length)
                    : 0
                  } dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialty Filter Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium mb-1">Filtrar por Minhas Especialidades</p>
              <p className="text-sm text-muted-foreground">
                Mostrar apenas petições da minha área de atuação
              </p>
            </div>
            <Switch 
              checked={useSpecialtyFilter}
              onCheckedChange={setUseSpecialtyFilter}
            />
          </div>
          
          {useSpecialtyFilter && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-semibold">✅ Filtrando por:</span>
                {writerSpecialties.length > 0 ? (
                  <span>{writerSpecialties.join(', ')}</span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">
                    Todas as áreas (nenhuma especialidade marcada)
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar petições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="INICIAL">Inicial</SelectItem>
                <SelectItem value="CONTESTACAO">Contestação</SelectItem>
                <SelectItem value="RECURSO">Recurso</SelectItem>
                <SelectItem value="MANDADO_SEGURANCA">Mandado de Segurança</SelectItem>
                <SelectItem value="EMBARGOS_DECLARACAO">Embargos de Declaração</SelectItem>
                <SelectItem value="APELACAO">Apelação</SelectItem>
                <SelectItem value="AGRAVO">Agravo</SelectItem>
                <SelectItem value="HABEAS_CORPUS">Habeas Corpus</SelectItem>
                <SelectItem value="MANDADO_INJUNCAO">Mandado de Injunção</SelectItem>
                <SelectItem value="ACAO_RESCISORIA">Ação Rescisória</SelectItem>
                <SelectItem value="EXECUCAO">Execução</SelectItem>
                <SelectItem value="CUMPRIMENTO_SENTENCA">Cumprimento de Sentença</SelectItem>
                <SelectItem value="CAUTELAR">Cautelar</SelectItem>
                <SelectItem value="TUTELA_ANTECIPADA">Tutela Antecipada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="express">Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Petitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPetitions.map((petition) => (
          <Card key={petition.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{petition.title}</CardTitle>
                  <CardDescription className="mt-1 whitespace-normal break-words truncate" title={`${petition.client_name} • ${petition.client_location}`}>
                    {truncateLongName(petition.client_name)} • {petition.client_location}
                  </CardDescription>
                </div>
                <Badge className={priorityConfig[petition.priority].color}>
                  {priorityConfig[petition.priority].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {petition.description}
              </p>
              
              {petition.specialties && petition.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {petition.specialties.slice(0, 2).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {petition.specialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{petition.specialties.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Badge de Cálculo Trabalhista */}
              {petition.requires_labor_calculation && (
                <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500 rounded-md">
                  <Calculator className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-400">
                    Requer Cálculo Trabalhista
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-orange-600">
                    R$ {petition.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Prazo:</span>
                  <span className={calculateDaysLeft(petition.deadline) <= 3 ? 'text-red-600 font-medium' : ''}>
                    {new Date(petition.deadline).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Est. horas:</span>
                  <span>{petition.estimated_hours}h</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Arquivos:</span>
                  <span>{petition.files_count}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedPetition(petition)}
                    >
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{selectedPetition?.title}</DialogTitle>
                      <DialogDescription>
                        Detalhes completos da petição
                      </DialogDescription>
                    </DialogHeader>
                    {selectedPetition && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Cliente</label>
                            <p className="text-sm text-muted-foreground">{selectedPetition.client_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Localização</label>
                            <p className="text-sm text-muted-foreground">{selectedPetition.client_location}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Valor</label>
                            <p className="text-sm text-muted-foreground">R$ {selectedPetition.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Prazo</label>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedPetition.deadline).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descrição Completa</label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedPetition.description}</p>
                        </div>
                        
                        {/* Aviso de Cálculo Trabalhista */}
                        {selectedPetition.requires_labor_calculation && (
                          <div className="p-4 bg-orange-500/10 border border-orange-500 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Calculator className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-orange-800 dark:text-orange-400 mb-1">
                                  📊 Requer Cálculo Trabalhista
                                </h4>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                  Esta petição necessita de cálculo trabalhista (verbas rescisórias, horas extras, etc.). 
                                  Após aceitar, você deverá fazer o cálculo usando a Calculadora antes de entregar a petição.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedPetition.specialties && selectedPetition.specialties.length > 0 && (
                          <div>
                            <label className="text-sm font-medium">Especialidades Necessárias</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedPetition.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary">{specialty}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Arquivos Anexados</label>
                          <div className="mt-2 space-y-2">
                            {selectedPetitionFiles.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
                            ) : (
                              selectedPetitionFiles.map(file => (
                                <div key={file.id} className="flex items-center justify-between border rounded p-2">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{file.file_name}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenPetitionFile(file.file_url)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Abrir
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleAcceptPetition(petition.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aceitar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}