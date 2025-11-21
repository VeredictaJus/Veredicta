import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LaborCalculatorData, CalculationResult } from '@/types/calculator';
import { LaborCalculator } from '@/lib/calculator/laborCalculations';
import CalculatorSteps from '@/components/Calculator/CalculatorSteps';
import ResultsDisplay from '@/components/Calculator/ResultsDisplay';
import { Calculator, FileText, AlertTriangle, Clock, Edit, Trash2 } from 'lucide-react';
import { CalculatorExportService } from '@/services/calculatorExportService';
import { useNavigate, useLocation } from 'react-router-dom';
import { LaborCalculationService, SavedCalculation } from '@/services/laborCalculationService';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';

export default function LaborCalculatorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useNewAuth();
  const currentYear = new Date().getFullYear();
  const [currentView, setCurrentView] = useState<'form' | 'results'>('form');
  const [savedCalculationId, setSavedCalculationId] = useState<string | null>(null);
  const [calculatorData, setCalculatorData] = useState<Partial<LaborCalculatorData>>({
    additionals: {},
    workingHours: {
      dailyHours: 8,
      weeklyHours: 44,
      intervalTime: 60
    },
    intervals: {
      lunchBreakViolations: 0,
      betweenShiftsViolations: 0
    },
    severance: {
      noticePeriod: 30,
      vacationDays: 12,
      thirteenthSalaryMonths: 12,
      fgtsBalance: 0,
      lastSalaryDays: 0
    },
    functionDeviation: {
      hasDeviation: false,
      originalPosition: '',
      deviatedPosition: '',
      differenceAmount: 0,
      deviationPeriodMonths: 0
    }
  });
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [recentCalculations, setRecentCalculations] = useState<SavedCalculation[]>([]);

  // Carregar cálculo salvo ao montar o componente
  useEffect(() => {
    const state = location.state as any;
    if (state?.loadData) {
      setCalculatorData(state.loadData);
      setSavedCalculationId(state.savedCalculation?.id || null);
      toast.success('Cálculo carregado com sucesso!');
    } else if (state?.petitionId) {
      // Veio de uma petição - pré-preencher dados se tiver
      if (state.clientName) {
        setCalculatorData(prev => ({
          ...prev,
          employeeName: state.clientName
        }));
      }
      toast.info(`Calculando para petição: ${state.petitionTitle || 'Petição'}`);
    }
  }, [location]);

  // Carregar cálculos recentes
  useEffect(() => {
    loadRecentCalculations();
  }, [user]);

  const loadRecentCalculations = async () => {
    if (!user?.uid) return;

    try {
      const result = await LaborCalculationService.listCalculations(user.uid, {
        limit: 5, // Mostrar apenas os 5 mais recentes
      });
      setRecentCalculations(result.calculations);
    } catch (error) {
      console.error('Erro ao carregar cálculos recentes:', error);
    }
  };

  const handleLoadSavedCalculation = (calc: SavedCalculation) => {
    setCalculatorData(calc.calculation_data);
    setSavedCalculationId(calc.id);
    toast.success('Cálculo carregado!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCalculation = async (id: string) => {
    try {
      await LaborCalculationService.deleteCalculation(id);
      toast.success('Cálculo excluído!');
      loadRecentCalculations();
    } catch (error) {
      toast.error('Erro ao excluir cálculo');
    }
  };

  const handleDataChange = (data: Partial<LaborCalculatorData>) => {
    setCalculatorData(data);
  };

  const handleCalculate = async () => {
    if (!validateData()) {
      return;
    }

    setIsCalculating(true);
    
    try {
      const calculator = new LaborCalculator(calculatorData as LaborCalculatorData);
      const result = calculator.calculate();
      
      // Adicionar avisos de prescrição
      const prescriptionWarnings = calculator.validatePrescription();
      result.prescriptionWarnings = prescriptionWarnings;
      
      setCalculationResult(result);
      setCurrentView('results');
    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro ao realizar o cálculo. Verifique os dados informados.');
    } finally {
      setIsCalculating(false);
    }
  };

  const validateData = (): boolean => {
    const data = calculatorData;
    
    if (!data.employeeName || !data.cpf || !data.admissionDate) {
      alert('Preencha os dados pessoais obrigatórios.');
      return false;
    }
    
    if (!data.baseSalary || data.baseSalary <= 0) {
      alert('Informe um salário base válido.');
      return false;
    }
    
    if (!data.workingHours?.dailyHours || !data.workingHours?.weeklyHours) {
      alert('Informe a jornada de trabalho.');
      return false;
    }
    
    return true;
  };

  const handleExportPDF = () => {
    if (!calculationResult) return;
    CalculatorExportService.exportPDF(calculationResult, {
      // usa o mesmo logo do header embutido; cores já laranja por padrão
    });
  };

  const handleCreatePetition = () => {
    if (!calculationResult) return;
    
    // Navegar para criação de petição com cálculo
    navigate('/client/new-petition', {
      state: {
        petitionType: 'LABOR_WITH_CALCULATION',
        calculationData: calculationResult,
        price: 90.00
      }
    });
  };

  const handleNewCalculation = () => {
    setCalculatorData({
      additionals: {},
      workingHours: {
        dailyHours: 8,
        weeklyHours: 44,
        intervalTime: 60
      },
      intervals: {
        lunchBreakViolations: 0,
        betweenShiftsViolations: 0
      },
      severance: {
        noticePeriod: 30,
        vacationDays: 12,
        thirteenthSalaryMonths: 12,
        fgtsBalance: 0,
        lastSalaryDays: 0
      },
      functionDeviation: {
        hasDeviation: false,
        originalPosition: '',
        deviatedPosition: '',
        differenceAmount: 0,
        deviationPeriodMonths: 0
      }
    });
    setCalculationResult(null);
    setCurrentView('form');
    setSavedCalculationId(null);
  };

  const handleSaveCalculation = async (title: string, description?: string) => {
    console.log('💾 handleSaveCalculation chamado');
    console.log('   user?.uid:', user?.uid);
    console.log('   calculationResult:', !!calculationResult);
    
    if (!user?.uid) {
      console.error('❌ Usuário não logado!');
      toast.error('Erro: Usuário não está logado');
      return;
    }

    if (!calculationResult) {
      console.error('❌ Sem resultado de cálculo!');
      toast.error('Erro: Nenhum cálculo para salvar');
      return;
    }

    try {
      if (savedCalculationId) {
        console.log('📝 Atualizando cálculo existente:', savedCalculationId);
        // Atualizar cálculo existente
        await LaborCalculationService.updateCalculation(savedCalculationId, {
          title,
          description,
          calculation_data: calculatorData as LaborCalculatorData,
          calculation_result: calculationResult,
        });
        toast.success('Cálculo atualizado com sucesso!');
      } else {
        console.log('💾 Salvando novo cálculo...');
        
        // Verificar se está vinculado a uma petição
        const state = location.state as any;
        const petitionId = state?.petitionId;
        
        // Salvar novo cálculo
        const saved = await LaborCalculationService.saveCalculation(
          user.uid,
          calculatorData as LaborCalculatorData,
          calculationResult,
          { 
            title, 
            description,
            petitionId: petitionId  // Vincular à petição se existir
          }
        );
        setSavedCalculationId(saved.id);
        
        // Se veio de uma petição, atualizar a petição com o calculation_id
        if (petitionId) {
          try {
            const { error } = await supabase
              .from('petitions')
              .update({ calculation_id: saved.id })
              .eq('id', petitionId);
            
            if (error) {
              console.error('Erro ao vincular cálculo à petição:', error);
            } else {
              toast.success('Cálculo salvo e vinculado à petição!');
            }
          } catch (err) {
            console.error('Erro ao atualizar petição:', err);
            toast.success('Cálculo salvo com sucesso!');
          }
        } else {
          toast.success('Cálculo salvo com sucesso!');
        }
      }
      // Recarregar lista de cálculos recentes
      loadRecentCalculations();
    } catch (error: any) {
      console.error('❌ Erro ao salvar cálculo:', error);
      console.error('   Mensagem:', error?.message);
      console.error('   Stack:', error?.stack);
      
      const errorMessage = error?.message || 'Erro ao salvar cálculo. Tente novamente.';
      toast.error(errorMessage);
    }
  };

  if (currentView === 'results' && calculationResult) {
    return (
      <div className="min-h-screen bg-background py-8">
        <ResultsDisplay
          result={calculationResult}
          onExportPDF={handleExportPDF}
          onCreatePetition={handleCreatePetition}
          onNewCalculation={handleNewCalculation}
          onSaveCalculation={handleSaveCalculation}
          savedCalculationId={savedCalculationId}
        />
      </div>
    );
  }

  const state = location.state as any;
  const linkedToPetition = state?.petitionId;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Badge de Petição Vinculada */}
        {linkedToPetition && (
          <Alert className="mb-4 border-orange-500 bg-orange-500/10">
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-400">
                <strong>🔗 Vinculado à Petição:</strong> {state.petitionTitle || 'Petição'}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <Calculator className="h-8 w-8 text-blue-600" />
              <span>Calculadora Trabalhista Automatizada</span>
            </CardTitle>
            <CardDescription className="text-lg max-w-4xl mx-auto whitespace-normal break-words">
              Calcule verbas rescisórias, horas extras, adicionais e todas as verbas trabalhistas de forma automatizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Esta calculadora utiliza os valores e legislação vigente em {currentYear}.
                </AlertDescription>
              </div>
            </Alert>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold">Verbas Rescisórias</h3>
              <p className="text-sm text-muted-foreground">Aviso prévio, férias, 13º salário, FGTS</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold">Horas Extras</h3>
              <p className="text-sm text-muted-foreground">50% úteis, 100% fins de semana</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold">Adicionais</h3>
              <p className="text-sm text-muted-foreground">Insalubridade, periculosidade, noturno</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold">Desvio de Função</h3>
              <p className="text-sm text-muted-foreground">Diferenças salariais e reflexos</p>
            </CardContent>
          </Card>
        </div>

        {/* Calculator Form */}
        <CalculatorSteps
          data={calculatorData}
          onDataChange={handleDataChange}
          onCalculate={handleCalculate}
        />

        {/* Cálculos Salvos Recentemente */}
        {recentCalculations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Cálculos Recentes</span>
                  </CardTitle>
                  <CardDescription>
                    Seus últimos cálculos salvos
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/writer/calculator/saved')}
                >
                  Ver Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{calc.title}</h4>
                        {calc.id === savedCalculationId && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-700 dark:text-green-400 rounded-full">
                            Carregado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>👤 {calc.calculation_data.employeeName}</span>
                        {calc.calculation_result && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            💰 {formatCurrency(calc.calculation_result.grandTotal)}
                          </span>
                        )}
                        <span className="text-xs">
                          {new Date(calc.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadSavedCalculation(calc)}
                        title="Carregar este cálculo"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCalculation(calc.id)}
                        title="Excluir este cálculo"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isCalculating && (
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <div className="animate-pulse">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <p className="text-lg font-medium">Realizando cálculos...</p>
                <p className="text-sm text-muted-foreground">Processando verbas trabalhistas</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}