import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { LaborCalculationService, SavedCalculation } from '@/services/laborCalculationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Calculator, 
  Search, 
  MoreVertical, 
  Star, 
  Trash2, 
  Copy, 
  Edit, 
  Plus,
  TrendingUp,
  Heart
} from 'lucide-react';
import { formatCurrency } from '@/lib/constants';

export default function SavedCalculations() {
  const { user } = useNewAuth();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, favorites: 0, thisMonth: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCalculations();
    loadStats();
  }, [user]);

  const loadCalculations = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const result = await LaborCalculationService.listCalculations(
        user.uid,
        {
          limit: 50,
          searchTerm: searchTerm || undefined,
        }
      );
      setCalculations(result.calculations);
    } catch (error) {
      console.error('❌ Erro ao carregar cálculos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.uid) return;

    try {
      const statistics = await LaborCalculationService.getStatistics(user.uid);
      setStats(statistics);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = () => {
    loadCalculations();
  };

  const handleLoadCalculation = (calc: SavedCalculation) => {
    // Navegar para a calculadora com os dados salvos
    navigate('/writer/calculator', {
      state: {
        savedCalculation: calc,
        loadData: calc.calculation_data,
      },
    });
  };

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    try {
      await LaborCalculationService.toggleFavorite(id, !currentValue);
      loadCalculations();
      loadStats();
    } catch (error) {
      console.error('❌ Erro ao atualizar favorito:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!user?.uid) return;

    try {
      await LaborCalculationService.duplicateCalculation(id, user.uid);
      loadCalculations();
      loadStats();
    } catch (error) {
      console.error('❌ Erro ao duplicar cálculo:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await LaborCalculationService.deleteCalculation(deleteId);
      loadCalculations();
      loadStats();
      setDeleteId(null);
    } catch (error) {
      console.error('❌ Erro ao deletar cálculo:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calculator className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando cálculos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Meus Cálculos Salvos</h1>
        <p className="text-muted-foreground">
          Gerencie e edite seus cálculos trabalhistas salvos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cálculos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos os cálculos salvos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">
              Marcados como favoritos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Cálculos criados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Ações */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-md"
          />
          <Button onClick={handleSearch} variant="secondary">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </div>
        <Button onClick={() => navigate('/writer/calculator')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cálculo
        </Button>
      </div>

      {/* Lista de Cálculos */}
      {calculations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cálculo salvo</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Você ainda não salvou nenhum cálculo. Crie um novo cálculo e salve para acessá-lo depois.
            </p>
            <Button onClick={() => navigate('/writer/calculator')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Cálculo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calculations.map((calc) => (
            <Card key={calc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{calc.title}</CardTitle>
                      {calc.is_favorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {calc.description && (
                      <p className="text-sm text-muted-foreground">{calc.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleLoadCalculation(calc)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleFavorite(calc.id, calc.is_favorite)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {calc.is_favorite ? 'Remover Favorito' : 'Marcar Favorito'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(calc.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(calc.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Informações do Cliente */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <p className="font-medium">{calc.calculation_data.employeeName}</p>
                    </div>
                    {calc.calculation_result && (
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium text-green-600">
                          {formatCurrency(calc.calculation_result.grandTotal)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {calc.tags && calc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {calc.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Datas */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>Atualizado: {formatDate(calc.updated_at)}</p>
                    <p>Criado: {formatDate(calc.created_at)}</p>
                  </div>

                  {/* Botão de Ação */}
                  <Button
                    className="w-full"
                    onClick={() => handleLoadCalculation(calc)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Abrir Cálculo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cálculo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

