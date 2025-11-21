import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Clock, 
  User, 
  FileText, 
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import PetitionAnalyzer from '@/components/AI/PetitionAnalyzer';

interface PetitionForReview {
  id: string;
  title: string;
  type: string;
  writer: string;
  client: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  content: string;
  wordCount: number;
}

export default function PetitionReview() {
  const [petitions, setPetitions] = useState<PetitionForReview[]>([]);
  const [selectedPetition, setSelectedPetition] = useState<PetitionForReview | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadPetitionsForReview();
  }, []);

  const loadPetitionsForReview = () => {
    // Mock data - In production, this would come from API
    const mockPetitions: PetitionForReview[] = [
      {
        id: '1',
        title: 'Petição Inicial - Ação de Cobrança',
        type: 'inicial',
        writer: 'Dr. João Silva',
        client: 'Maria Santos',
        submittedAt: '2024-07-17T10:30:00Z',
        priority: 'high',
        status: 'pending',
        content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA CÍVEL DA COMARCA DE SÃO PAULO

MARIA SANTOS, brasileira, casada, empresária, portadora do RG nº 12.345.678-9 SSP/SP e CPF nº 123.456.789-00, residente e domiciliada na Rua das Flores, nº 123, Bairro Centro, CEP 01234-567, São Paulo/SP, por intermédio de seu advogado que esta subscreve (OAB/SP nº 123.456), vem respeitosamente à presença de Vossa Excelência propor a presente

AÇÃO DE COBRANÇA

em face de JOÃO PEDRO OLIVEIRA, brasileiro, solteiro, empresário, portador do RG nº 98.765.432-1 SSP/SP e CPF nº 987.654.321-00, residente e domiciliado na Avenida Paulista, nº 456, Bairro Bela Vista, CEP 98765-432, São Paulo/SP, pelos fatos e fundamentos jurídicos a seguir expostos:

DOS FATOS

A requerente celebrou com o requerido em 15/03/2024 um contrato de prestação de serviços de consultoria empresarial, conforme documento anexo, pelo valor total de R$ 50.000,00 (cinquenta mil reais).

O pagamento deveria ser efetuado em 5 (cinco) parcelas mensais de R$ 10.000,00 (dez mil reais) cada, com vencimento todo dia 15 de cada mês, iniciando-se em 15/04/2024.

A requerente cumpriu integralmente sua parte no contrato, prestando todos os serviços contratados dentro do prazo e qualidade acordados.

Contudo, o requerido deixou de pagar as três últimas parcelas, vencidas em 15/06/2024, 15/07/2024 e 15/08/2024, perfazendo o débito total de R$ 30.000,00 (trinta mil reais).

DO DIREITO

O presente caso encontra amparo legal no artigo 389 do Código Civil, que estabelece que "não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária segundo índices oficiais regularmente estabelecidos, e honorários de advogado".

Ademais, conforme dispõe o artigo 319 do Código de Processo Civil, a petição inicial deve indicar o valor da causa, o qual corresponde ao montante devido pelo requerido.

DA TUTELA ANTECIPADA

Requer-se a concessão de tutela antecipada para determinar o bloqueio de ativos financeiros do requerido até o limite do débito, nos termos do artigo 300 do CPC, uma vez que estão presentes os requisitos da probabilidade do direito e do perigo de dano.

DOS PEDIDOS

Diante do exposto, requer-se:

a) A citação do requerido para responder à presente ação, sob pena de revelia;

b) A condenação do requerido ao pagamento da quantia de R$ 30.000,00 (trinta mil reais), corrigida monetariamente e acrescida de juros legais desde o vencimento;

c) A condenação do requerido ao pagamento de honorários advocatícios;

d) A condenação do requerido ao pagamento das custas processuais.

Protesta-se por todos os meios de prova em direito admitidos.

Dá-se à causa o valor de R$ 30.000,00 (trinta mil reais).

Termos em que,
Pede deferimento.

São Paulo, 17 de julho de 2024.

[Nome do Advogado]
OAB/SP nº 123.456`,
        wordCount: 485
      },
      {
        id: '2',
        title: 'Recurso de Apelação - Ação Trabalhista',
        type: 'apelacao',
        writer: 'Dra. Ana Costa',
        client: 'Empresa XYZ Ltda',
        submittedAt: '2024-07-17T09:15:00Z',
        priority: 'medium',
        status: 'pending',
        content: 'Conteúdo da petição de apelação...',
        wordCount: 320
      },
      {
        id: '3',
        title: 'Contestação - Ação de Despejo',
        type: 'contestacao',
        writer: 'Dr. Carlos Mendes',
        client: 'Pedro Almeida',
        submittedAt: '2024-07-17T08:45:00Z',
        priority: 'low',
        status: 'in_review',
        content: 'Conteúdo da contestação...',
        wordCount: 280
      }
    ];

    setPetitions(mockPetitions);
  };

  const filteredPetitions = petitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.writer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || petition.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || petition.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_review': return 'Em Revisão';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      default: return status;
    }
  };

  const handleApprove = (petitionId: string, comments?: string) => {
    setPetitions(prev => prev.map(p => 
      p.id === petitionId ? { ...p, status: 'approved' as const } : p
    ));
    toast.success('Petição aprovada e enviada ao cliente!');
    setSelectedPetition(null);
  };

  const handleReject = (petitionId: string, comments: string) => {
    if (!comments.trim()) {
      toast.error('É necessário informar o motivo da rejeição');
      return;
    }
    
    setPetitions(prev => prev.map(p => 
      p.id === petitionId ? { ...p, status: 'rejected' as const } : p
    ));
    toast.error('Petição rejeitada. Redator foi notificado.');
    setSelectedPetition(null);
  };

  const handleRequestCorrection = (petitionId: string, comments: string) => {
    if (!comments.trim()) {
      toast.error('É necessário informar as correções solicitadas');
      return;
    }
    
    toast.info('Correções solicitadas. Redator foi notificado.');
    setSelectedPetition(null);
  };

  if (selectedPetition) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revisão com IA</h1>
            <p className="text-gray-600">
              Análise inteligente da petição: {selectedPetition.title}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedPetition(null)}
          >
            Voltar à Lista
          </Button>
        </div>

        <PetitionAnalyzer
          petitionId={selectedPetition.id}
          petitionText={selectedPetition.content}
          petitionType={selectedPetition.type}
          onApprove={(comments) => handleApprove(selectedPetition.id, comments)}
          onReject={(comments) => handleReject(selectedPetition.id, comments)}
          onRequest={(comments) => handleRequestCorrection(selectedPetition.id, comments)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revisão de Petições</h1>
          <p className="text-gray-600">
            Sistema inteligente de revisão e correção com IA
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            IA Ativada
          </Badge>
          <Badge variant="outline">
            {filteredPetitions.length} petições
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Título, redator, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_review">Em Revisão</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {petitions.filter(p => p.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {petitions.filter(p => p.status === 'in_review').length}
                </p>
                <p className="text-xs text-gray-600">Em Revisão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {petitions.filter(p => p.status === 'approved').length}
                </p>
                <p className="text-xs text-gray-600">Aprovadas Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {petitions.filter(p => p.priority === 'high').length}
                </p>
                <p className="text-xs text-gray-600">Alta Prioridade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Petitions List */}
      <Card>
        <CardHeader>
          <CardTitle>Petições para Revisão</CardTitle>
          <CardDescription>
            Clique em uma petição para iniciar a análise com IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPetitions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Nenhuma petição encontrada</h3>
              <p className="text-gray-600">
                Não há petições que correspondam aos filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPetitions.map((petition) => (
                <div
                  key={petition.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPetition(petition)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{petition.title}</h3>
                        <Badge className={getPriorityColor(petition.priority)}>
                          {petition.priority === 'high' ? 'Alta' : 
                           petition.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <Badge className={getStatusColor(petition.status)}>
                          {getStatusLabel(petition.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Redator: {petition.writer}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Cliente: {petition.client}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(petition.submittedAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(petition.submittedAt).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{petition.wordCount} palavras</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPetition(petition);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Analisar com IA
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}