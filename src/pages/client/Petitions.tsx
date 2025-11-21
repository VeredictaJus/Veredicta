import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Petition } from '@/types';
import { Search, FileText, Plus, Eye, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for petitions
const mockPetitions: Petition[] = [
  {
    id: 'VER001',
    client_id: '1',
    writer_id: '2',
    petition_type: 'CONTESTACAO',
    title: 'Contestação - Ação de Cobrança',
    description: 'Contestação para ação de cobrança indevida com fundamentos de prescrição e falta de prova',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    deadline: '2024-07-20T23:59:59Z',
    estimated_hours: 4,
    actual_hours: 3.5,
    value: 60,
    created_at: '2024-07-15T10:00:00Z',
    accepted_at: '2024-07-15T14:30:00Z',
    completed_at: '2024-07-18T16:00:00Z',
  },
  {
    id: 'VER002',
    client_id: '1',
    petition_type: 'RECURSO',
    title: 'Recurso Ordinário - Processo Trabalhista',
    description: 'Recurso contra decisão de primeira instância em processo trabalhista',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    deadline: '2024-07-22T23:59:59Z',
    estimated_hours: 6,
    value: 100,
    created_at: '2024-07-16T09:00:00Z',
    accepted_at: '2024-07-16T15:00:00Z',
  },
  {
    id: 'VER003',
    client_id: '1',
    petition_type: 'INICIAL',
    title: 'Petição Inicial - Reintegração de Posse',
    description: 'Ação de reintegração de posse de imóvel urbano com pedido liminar',
    status: 'PENDING',
    priority: 'URGENT',
    deadline: '2024-07-19T23:59:59Z',
    estimated_hours: 8,
    value: 80,
    created_at: '2024-07-17T08:00:00Z',
  },
  {
    id: 'VER004',
    client_id: '1',
    petition_type: 'AGRAVO',
    title: 'Agravo de Instrumento - Decisão Interlocutória',
    description: 'Agravo contra decisão que deferiu tutela antecipada em favor da parte contrária',
    status: 'ASSIGNED',
    priority: 'HIGH',
    deadline: '2024-07-21T23:59:59Z',
    estimated_hours: 5,
    value: 80,
    created_at: '2024-07-14T11:00:00Z',
    accepted_at: '2024-07-14T16:00:00Z',
  },
  {
    id: 'VER005',
    client_id: '1',
    petition_type: 'APELACAO',
    title: 'Apelação Cível - Ação de Indenização',
    description: 'Apelação contra sentença que julgou improcedente ação de indenização por danos morais',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    deadline: '2024-07-10T23:59:59Z',
    estimated_hours: 7,
    actual_hours: 6,
    value: 90,
    created_at: '2024-07-05T10:00:00Z',
    completed_at: '2024-07-09T18:00:00Z',
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'APPROVED': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Pendente';
    case 'ASSIGNED': return 'Atribuída';
    case 'IN_PROGRESS': return 'Em Produção';
    case 'COMPLETED': return 'Finalizada';
    case 'APPROVED': return 'Aprovada';
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

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'Urgente';
    case 'HIGH': return 'Alta';
    case 'MEDIUM': return 'Média';
    case 'LOW': return 'Baixa';
    default: return priority;
  }
};

const getPetitionTypeLabel = (type: string) => {
  switch (type) {
    case 'INICIAL': return 'Petição Inicial';
    case 'CONTESTACAO': return 'Contestação';
    case 'RECURSO': return 'Recurso';
    case 'AGRAVO': return 'Agravo';
    case 'APELACAO': return 'Apelação';
    case 'EMBARGOS': return 'Embargos';
    default: return type;
  }
};

export default function Petitions() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredPetitions = mockPetitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || petition.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || petition.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || petition.petition_type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const stats = {
    total: mockPetitions.length,
    pending: mockPetitions.filter(p => p.status === 'PENDING').length,
    inProgress: mockPetitions.filter(p => ['ASSIGNED', 'IN_PROGRESS'].includes(p.status)).length,
    completed: mockPetitions.filter(p => p.status === 'COMPLETED').length,
  };

  const handleViewPetition = (petitionId: string) => {
    console.log('Viewing petition:', petitionId);
    // Here would navigate to petition details
    alert(`Visualizando detalhes da petição ${petitionId}`);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Petições</h1>
          <p className="text-gray-600">
            Acompanhe todas as suas petições jurídicas
          </p>
        </div>
        <Link to="/client/petitions/new">
          <Button className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4" />
            <span>Nova Petição</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              petições cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              aguardando atribuição
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              sendo desenvolvidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              prontas para uso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>
            Use os filtros para encontrar petições específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar petições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="ASSIGNED">Atribuída</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Produção</SelectItem>
                <SelectItem value="COMPLETED">Finalizada</SelectItem>
                <SelectItem value="APPROVED">Aprovada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="INICIAL">Inicial</SelectItem>
                <SelectItem value="CONTESTACAO">Contestação</SelectItem>
                <SelectItem value="RECURSO">Recurso</SelectItem>
                <SelectItem value="AGRAVO">Agravo</SelectItem>
                <SelectItem value="APELACAO">Apelação</SelectItem>
                <SelectItem value="EMBARGOS">Embargos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Petitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Petições</CardTitle>
          <CardDescription>
            {filteredPetitions.length} petições encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPetitions.map((petition) => (
                <TableRow key={petition.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {petition.id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{petition.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {petition.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getPetitionTypeLabel(petition.petition_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(petition.status)}>
                      {getStatusLabel(petition.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPriorityColor(petition.priority)}`}>
                      {getPriorityLabel(petition.priority)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(petition.deadline).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPetition(petition.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPetitions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma petição encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Não há petições que correspondam aos filtros selecionados.
              </p>
              <Link to="/client/petitions/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Petição
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}