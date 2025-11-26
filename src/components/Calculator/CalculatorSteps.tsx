import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LaborCalculatorData, CalculatorStep } from '@/types/calculator';
import { ChevronLeft, ChevronRight, User, DollarSign, Clock, Calculator } from 'lucide-react';

interface CalculatorStepsProps {
  data: Partial<LaborCalculatorData>;
  onDataChange: (data: Partial<LaborCalculatorData>) => void;
  onCalculate: () => void;
}

export default function CalculatorSteps({ data, onDataChange, onCalculate }: CalculatorStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: CalculatorStep[] = useMemo(() => [
    {
      id: 'personal',
      title: 'Dados Pessoais',
      description: 'Informações básicas do trabalhador',
      completed: !!(data.employeeName?.trim() && data.cpf?.trim() && data.admissionDate),
    },
    {
      id: 'salary',
      title: 'Dados Salariais',
      description: 'Salário e adicionais',
      completed: !!(data.baseSalary && data.baseSalary > 0),
    },
    {
      id: 'working-hours',
      title: 'Jornada de Trabalho',
      description: 'Horários e intervalos',
      completed: !!(data.workingHours?.dailyHours && data.workingHours?.weeklyHours),
    },
    {
      id: 'calculations',
      title: 'Cálculos',
      description: 'Configurar verbas a calcular',
      completed: true,
    },
  ], [data.employeeName, data.cpf, data.admissionDate, data.baseSalary, data.workingHours]);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateData = (updates: Partial<LaborCalculatorData>) => {
    onDataChange({ ...data, ...updates });
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara: 000.000.000-00
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    updateData({ cpf: formatted });
  };

  /**
   * Calcula dias trabalhados no último mês (para saldo de salário)
   */
  const calculateLastSalaryDays = (): number => {
    if (!data.terminationDate) return 0;
    
    const termination = new Date(data.terminationDate);
    return termination.getDate(); // Dia do mês da demissão
  };

  /**
   * Calcula automaticamente os dias de aviso prévio
   * Lei 12.506/2011: 30 dias base + 3 dias por ano trabalhado (máximo 90 dias total)
   */
  const calculateNoticePeriodDays = (): number => {
    if (!data.admissionDate || !data.terminationDate) return 30;
    
    const admission = new Date(data.admissionDate);
    const termination = new Date(data.terminationDate);
    
    // Calcular anos completos trabalhados
    const diffTime = termination.getTime() - admission.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const yearsWorked = Math.floor(diffDays / 365.25);
    
    // 30 dias base + 3 dias por ano (máximo 60 dias adicionais = 90 total)
    const baseDays = 30;
    const additionalDays = Math.min(yearsWorked * 3, 60);
    const totalDays = baseDays + additionalDays;
    
    return totalDays;
  };

  /**
   * Calcula automaticamente os meses de férias proporcionais
   * Base: 1/12 de férias por mês trabalhado no ano
   */
  const calculateProportionalVacationMonths = (): number => {
    if (!data.admissionDate) return 0;
    
    const admissionDate = new Date(data.admissionDate);
    const terminationDate = data.terminationDate ? new Date(data.terminationDate) : new Date();
    
    // Calcular meses trabalhados no ano da rescisão
    const lastYearStart = new Date(terminationDate.getFullYear(), 0, 1); // 1º de janeiro
    const startDate = admissionDate > lastYearStart ? admissionDate : lastYearStart;
    
    // Verificar se admissão e demissão são no mesmo mês
    const sameMonth = startDate.getFullYear() === terminationDate.getFullYear() && 
                      startDate.getMonth() === terminationDate.getMonth();
    
    if (sameMonth) {
      // Se no mesmo mês, calcular dias trabalhados diretamente
      const daysWorked = terminationDate.getDate() - startDate.getDate() + 1;
      return daysWorked >= 15 ? 1 : 0;
    }
    
    // Calcular diferença em meses
    let monthsDiff = (terminationDate.getFullYear() - startDate.getFullYear()) * 12 
                   + (terminationDate.getMonth() - startDate.getMonth());
    
    // Regra trabalhista: 15 dias ou mais no mês = conta como mês completo
    // Verificar o mês de admissão (se trabalhou menos de 15 dias, não conta)
    const daysWorkedInFirstMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate() - startDate.getDate() + 1;
    if (daysWorkedInFirstMonth < 15) {
      monthsDiff -= 1;
    }
    
    // Verificar o mês de demissão (se trabalhou 15 dias ou mais, conta como mês completo)
    const daysWorkedInLastMonth = terminationDate.getDate();
    if (daysWorkedInLastMonth >= 15) {
      monthsDiff += 1;
    }
    
    const totalMonths = Math.max(0, Math.min(monthsDiff, 12));
    
    return totalMonths;
  };

  /**
   * Calcula automaticamente os meses de 13º salário proporcional
   * Base: 1/12 por mês trabalhado no ano
   */
  const calculateProportional13thMonths = (): number => {
    if (!data.admissionDate) return 0;
    
    const admissionDate = new Date(data.admissionDate);
    const terminationDate = data.terminationDate ? new Date(data.terminationDate) : new Date();
    
    // Calcular meses trabalhados no ano da rescisão
    const yearStart = new Date(terminationDate.getFullYear(), 0, 1);
    const startDate = admissionDate > yearStart ? admissionDate : yearStart;
    
    // Verificar se admissão e demissão são no mesmo mês
    const sameMonth = startDate.getFullYear() === terminationDate.getFullYear() && 
                      startDate.getMonth() === terminationDate.getMonth();
    
    if (sameMonth) {
      // Se no mesmo mês, calcular dias trabalhados diretamente
      const daysWorked = terminationDate.getDate() - startDate.getDate() + 1;
      return daysWorked >= 15 ? 1 : 0;
    }
    
    // Calcular diferença em meses
    let monthsDiff = (terminationDate.getFullYear() - startDate.getFullYear()) * 12 
                   + (terminationDate.getMonth() - startDate.getMonth());
    
    // Regra trabalhista: 15 dias ou mais no mês = conta como mês completo
    // Verificar o mês de admissão (se trabalhou menos de 15 dias, não conta)
    const daysWorkedInFirstMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate() - startDate.getDate() + 1;
    if (daysWorkedInFirstMonth < 15) {
      monthsDiff -= 1;
    }
    
    // Verificar o mês de demissão (se trabalhou 15 dias ou mais, conta como mês completo)
    const daysWorkedInLastMonth = terminationDate.getDate();
    if (daysWorkedInLastMonth >= 15) {
      monthsDiff += 1;
    }
    
    const totalMonths = Math.max(0, Math.min(monthsDiff, 12));
    
    return totalMonths;
  };

  // Atualizar automaticamente férias, 13º, saldo de dias e aviso prévio quando as datas mudarem
  useEffect(() => {
    if (data.admissionDate) {
      const vacationMonths = calculateProportionalVacationMonths();
      const thirteenthMonths = calculateProportional13thMonths();
      const lastSalaryDays = calculateLastSalaryDays();
      const noticePeriodDays = calculateNoticePeriodDays();
      
      // Atualizar apenas se mudou
      if (data.severance?.vacationDays !== vacationMonths || 
          data.severance?.thirteenthSalaryMonths !== thirteenthMonths ||
          data.severance?.lastSalaryDays !== lastSalaryDays ||
          data.severance?.noticePeriod !== noticePeriodDays) {
        updateData({
          severance: {
            ...data.severance,
            vacationDays: vacationMonths,
            thirteenthSalaryMonths: thirteenthMonths,
            lastSalaryDays: lastSalaryDays,
            noticePeriod: noticePeriodDays,
            fgtsBalance: data.severance?.fgtsBalance || 0
          }
        });
      }
    }
  }, [data.admissionDate, data.terminationDate]);

  const canProceed = () => {
    const isCompleted = steps[currentStep].completed;
    return isCompleted;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      onCalculate();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderPersonalDataStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="employeeName">Nome do Trabalhador *</Label>
          <Input
            id="employeeName"
            value={data.employeeName || ''}
            onChange={(e) => updateData({ employeeName: e.target.value })}
            placeholder="Nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            value={data.cpf || ''}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admissionDate">Data de Admissão *</Label>
          <Input
            id="admissionDate"
            type="date"
            value={data.admissionDate || ''}
            onChange={(e) => updateData({ admissionDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="terminationDate">Data de Demissão</Label>
          <Input
            id="terminationDate"
            type="date"
            value={data.terminationDate || ''}
            onChange={(e) => updateData({ terminationDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terminationType">Tipo de Rescisão</Label>
        <Select 
          value={data.terminationType || ''} 
          onValueChange={(value) => updateData({ terminationType: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de rescisão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DISMISSAL_WITHOUT_CAUSE">Demissão sem Justa Causa</SelectItem>
            <SelectItem value="DISMISSAL_WITH_CAUSE">Demissão por Justa Causa</SelectItem>
            <SelectItem value="RESIGNATION">Pedido de Demissão</SelectItem>
            <SelectItem value="MUTUAL_AGREEMENT">Acordo Mútuo</SelectItem>
            <SelectItem value="INDIRECT_TERMINATION">Rescisão Indireta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSalaryDataStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="baseSalary">Salário Base *</Label>
          <Input
            id="baseSalary"
            type="number"
            step="0.01"
            value={data.baseSalary || ''}
            onChange={(e) => updateData({ baseSalary: parseFloat(e.target.value) || 0 })}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalSalary">Salário Adicional</Label>
          <Input
            id="additionalSalary"
            type="number"
            step="0.01"
            value={data.additionalSalary || ''}
            onChange={(e) => updateData({ additionalSalary: parseFloat(e.target.value) || 0 })}
            placeholder="Comissões, gratificações..."
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionais</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Configure os adicionais recebidos pelo trabalhador</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Insalubridade</Label>
              <p className="text-sm text-muted-foreground">Grau de insalubridade</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!data.additionals?.insalubrity}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateData({
                      additionals: {
                        ...data.additionals,
                        insalubrity: { percentage: 20, basis: 'MINIMUM_WAGE' }
                      }
                    });
                  } else {
                    const newAdditionals = { ...data.additionals };
                    delete newAdditionals.insalubrity;
                    updateData({ additionals: newAdditionals });
                  }
                }}
              />
              {data.additionals?.insalubrity && (
                <Select
                  value={data.additionals.insalubrity.percentage.toString()}
                  onValueChange={(value) => updateData({
                    additionals: {
                      ...data.additionals,
                      insalubrity: {
                        ...data.additionals?.insalubrity!,
                        percentage: parseInt(value) as 10 | 20 | 40
                      }
                    }
                  })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Periculosidade</Label>
              <p className="text-sm text-muted-foreground">30% sobre o salário base</p>
            </div>
            <Switch
              checked={!!data.additionals?.dangerousness}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateData({
                    additionals: {
                      ...data.additionals,
                      dangerousness: { percentage: 30, basis: 'BASE_SALARY' }
                    }
                  });
                } else {
                  const newAdditionals = { ...data.additionals };
                  delete newAdditionals.dangerousness;
                  updateData({ additionals: newAdditionals });
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Adicional Noturno</Label>
              <p className="text-sm text-muted-foreground">20% sobre horas entre 22h e 5h (Art. 73 CLT)</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!data.additionals?.nightShift}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateData({
                      additionals: {
                        ...data.additionals,
                        nightShift: { percentage: 20, hours: 0 }
                      }
                    });
                  } else {
                    const newAdditionals = { ...data.additionals };
                    delete newAdditionals.nightShift;
                    updateData({ additionals: newAdditionals });
                  }
                }}
              />
              {data.additionals?.nightShift && (
                <Input
                  type="number"
                  min="0"
                  className="w-32"
                  value={data.additionals.nightShift.hours || ''}
                  onChange={(e) => updateData({
                    additionals: {
                      ...data.additionals,
                      nightShift: {
                        ...data.additionals?.nightShift!,
                        hours: parseInt(e.target.value) || 0
                      }
                    }
                  })}
                  placeholder="Horas no período"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Adicional de Transferência</Label>
              <p className="text-sm text-muted-foreground">25% enquanto durar a transferência</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!!data.additionals?.transferBonus}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateData({
                      additionals: {
                        ...data.additionals,
                        transferBonus: { percentage: 25, months: 1 }
                      }
                    });
                  } else {
                    const newAdditionals = { ...data.additionals } as any;
                    delete newAdditionals.transferBonus;
                    updateData({ additionals: newAdditionals });
                  }
                }}
              />
              {data.additionals?.transferBonus && (
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Meses</Label>
                  <Input
                    type="number"
                    min="1"
                    className="w-24"
                    value={data.additionals.transferBonus.months || ''}
                    onChange={(e) => updateData({
                      additionals: {
                        ...data.additionals,
                        transferBonus: {
                          ...data.additionals?.transferBonus!,
                          months: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Quebra de Caixa</Label>
              <p className="text-sm text-muted-foreground">Adicional específico para caixas</p>
            </div>
            <Switch
              checked={!!data.additionals?.breakageFee}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateData({
                    additionals: {
                      ...data.additionals,
                      breakageFee: { percentage: 10 }
                    }
                  });
                } else {
                  const newAdditionals = { ...data.additionals } as any;
                  delete newAdditionals.breakageFee;
                  updateData({ additionals: newAdditionals });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outros Direitos Variáveis</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Prêmios, comissões e gorjetas</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="habitualPrize">Prêmio Habitual (R$/mês)</Label>
              <Input
                id="habitualPrize"
                type="number"
                step="0.01"
                value={data.otherRights?.habitualPrize?.monthlyAmount || ''}
                onChange={(e) => updateData({
                  otherRights: {
                    ...data.otherRights,
                    habitualPrize: {
                      monthlyAmount: parseFloat(e.target.value) || 0,
                      months: data.otherRights?.habitualPrize?.months || 0
                    }
                  }
                })}
                placeholder="0,00"
              />
              <Input
                type="number"
                min="0"
                value={data.otherRights?.habitualPrize?.months || ''}
                onChange={(e) => updateData({
                  otherRights: {
                    ...data.otherRights,
                    habitualPrize: {
                      monthlyAmount: data.otherRights?.habitualPrize?.monthlyAmount || 0,
                      months: parseInt(e.target.value) || 0
                    }
                  }
                })}
                placeholder="Meses"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unpaidCommissions">Comissões não pagas (R$)</Label>
              <Input
                id="unpaidCommissions"
                type="number"
                step="0.01"
                value={data.otherRights?.unpaidCommissions?.totalAmount || ''}
                onChange={(e) => updateData({
                  otherRights: {
                    ...data.otherRights,
                    unpaidCommissions: { totalAmount: parseFloat(e.target.value) || 0 }
                  }
                })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipsAvg">Gorjetas (média R$/mês)</Label>
              <Input
                id="tipsAvg"
                type="number"
                step="0.01"
                value={data.otherRights?.tips?.monthlyAverage || ''}
                onChange={(e) => updateData({
                  otherRights: {
                    ...data.otherRights,
                    tips: {
                      monthlyAverage: parseFloat(e.target.value) || 0,
                      months: data.otherRights?.tips?.months || 0
                    }
                  }
                })}
                placeholder="0,00"
              />
              <Input
                type="number"
                min="0"
                value={data.otherRights?.tips?.months || ''}
                onChange={(e) => updateData({
                  otherRights: {
                    ...data.otherRights,
                    tips: {
                      monthlyAverage: data.otherRights?.tips?.monthlyAverage || 0,
                      months: parseInt(e.target.value) || 0
                    }
                  }
                })}
                placeholder="Meses"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Acúmulo de Função</Label>
                <p className="text-sm text-muted-foreground">Adicional mensal por acúmulo de tarefas</p>
              </div>
              <Switch
                checked={!!data.otherRights?.accumulationOfFunctions}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    const newOther = { ...data.otherRights } as any;
                    delete newOther.accumulationOfFunctions;
                    updateData({ otherRights: newOther });
                  } else {
                    updateData({
                      otherRights: {
                        ...data.otherRights,
                        accumulationOfFunctions: { additionalSalary: 0, months: 0 }
                      }
                    });
                  }
                }}
              />
            </div>
            {data.otherRights?.accumulationOfFunctions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <Label>Adicional (R$/mês)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.otherRights.accumulationOfFunctions.additionalSalary || ''}
                    onChange={(e) => updateData({
                      otherRights: {
                        ...data.otherRights!,
                        accumulationOfFunctions: {
                          ...data.otherRights!.accumulationOfFunctions!,
                          additionalSalary: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meses</Label>
                  <Input
                    type="number"
                    min="0"
                    value={data.otherRights.accumulationOfFunctions.months || ''}
                    onChange={(e) => updateData({
                      otherRights: {
                        ...data.otherRights!,
                        accumulationOfFunctions: {
                          ...data.otherRights!.accumulationOfFunctions!,
                          months: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outras Horas</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Informe horas médias mensais</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="onCallHours">Sobreaviso (horas/mês)</Label>
              <Input
                id="onCallHours"
                type="number"
                min="0"
                value={data.workingHours?.onCallHours || ''}
                onChange={(e) => updateData({
                  workingHours: {
                    ...data.workingHours!,
                    onCallHours: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standbyHours">Prontidão (horas/mês)</Label>
              <Input
                id="standbyHours"
                type="number"
                min="0"
                value={data.workingHours?.standbyHours || ''}
                onChange={(e) => updateData({
                  workingHours: {
                    ...data.workingHours!,
                    standbyHours: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inItinereHours">Horas In Itinere (horas/mês)</Label>
              <Input
                id="inItinereHours"
                type="number"
                min="0"
                value={data.workingHours?.inItinereHours || ''}
                onChange={(e) => updateData({
                  workingHours: {
                    ...data.workingHours!,
                    inItinereHours: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="art384Days">Art. 384 (mulher) - Dias com HE/mês</Label>
              <Input
                id="art384Days"
                type="number"
                min="0"
                value={data.workingHours?.art384DaysPerMonth || ''}
                onChange={(e) => updateData({
                  workingHours: {
                    ...data.workingHours!,
                    art384DaysPerMonth: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkingHoursStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dailyHours">Horas Diárias *</Label>
          <Input
            id="dailyHours"
            type="number"
            value={data.workingHours?.dailyHours || ''}
            onChange={(e) => updateData({
              workingHours: {
                ...data.workingHours!,
                dailyHours: parseInt(e.target.value) || 0,
                weeklyHours: data.workingHours?.weeklyHours || 0,
                intervalTime: data.workingHours?.intervalTime || 0
              }
            })}
            placeholder="8"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weeklyHours">Horas Semanais *</Label>
          <Input
            id="weeklyHours"
            type="number"
            value={data.workingHours?.weeklyHours || ''}
            onChange={(e) => updateData({
              workingHours: {
                dailyHours: data.workingHours?.dailyHours || 0,
                weeklyHours: parseInt(e.target.value) || 0,
                intervalTime: data.workingHours?.intervalTime || 0
              }
            })}
            placeholder="44"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horas Extras</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Informe as horas extras trabalhadas (médias mensais)</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weekdayHours">Horas Extras Dias Úteis</Label>
              <Input
                id="weekdayHours"
                type="number"
                value={data.additionals?.overtime?.weekdayHours || ''}
                onChange={(e) => updateData({
                  additionals: {
                    ...data.additionals,
                    overtime: {
                      ...data.additionals?.overtime,
                      weekdayHours: parseInt(e.target.value) || 0,
                      weekendHours: data.additionals?.overtime?.weekendHours || 0
                    }
                  }
                })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekendHours">Horas Extras Finais de Semana</Label>
              <Input
                id="weekendHours"
                type="number"
                value={data.additionals?.overtime?.weekendHours || ''}
                onChange={(e) => updateData({
                  additionals: {
                    ...data.additionals,
                    overtime: {
                      weekdayHours: data.additionals?.overtime?.weekdayHours || 0,
                      weekendHours: parseInt(e.target.value) || 0
                    }
                  }
                })}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supressão de Intervalos</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Informe os minutos suprimidos e a frequência</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lunchBreakViolations">
                Intervalo Intrajornada
                <span className="text-xs text-muted-foreground ml-2">(Art. 71 CLT - Almoço)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="lunchBreakViolations"
                  type="number"
                  min="0"
                  className="flex-1"
                  value={data.intervals?.lunchBreakViolations || ''}
                  onChange={(e) => updateData({
                    intervals: {
                      ...data.intervals,
                      lunchBreakViolations: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="Ex: 30"
                />
                <Select
                  value={data.intervals?.lunchBreakPeriod || 'week'}
                  onValueChange={(value) => updateData({
                    intervals: {
                      ...data.intervals,
                      lunchBreakPeriod: value as 'day' | 'week' | 'month'
                    }
                  })}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">por dia</SelectItem>
                    <SelectItem value="week">por semana</SelectItem>
                    <SelectItem value="month">por mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Minutos não concedidos do intervalo de almoço</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="betweenShiftsViolations">
                Intervalo Interjornada
                <span className="text-xs text-muted-foreground ml-2">(Art. 66 CLT - 11h entre jornadas)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="betweenShiftsViolations"
                  type="number"
                  min="0"
                  className="flex-1"
                  value={data.intervals?.betweenShiftsViolations || ''}
                  onChange={(e) => updateData({
                    intervals: {
                      ...data.intervals,
                      betweenShiftsViolations: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="Ex: 60"
                />
                <Select
                  value={data.intervals?.betweenShiftsPeriod || 'week'}
                  onValueChange={(value) => updateData({
                    intervals: {
                      ...data.intervals,
                      betweenShiftsPeriod: value as 'day' | 'week' | 'month'
                    }
                  })}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">por dia</SelectItem>
                    <SelectItem value="week">por semana</SelectItem>
                    <SelectItem value="month">por mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">Minutos trabalhados sem respeitar o descanso de 11h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCalculationsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verbas Rescisórias</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Configure os dados para cálculo das verbas rescisórias</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Campos calculados automaticamente */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 font-semibold">
                ⚡ Campos calculados automaticamente com base nas datas:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastSalaryDays">Saldo de Salário</Label>
                  <Input
                    id="lastSalaryDays"
                    type="text"
                    value={`${calculateLastSalaryDays()} dias`}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dia da demissão: {calculateLastSalaryDays()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vacationDays">Férias Proporcionais</Label>
                  <Input
                    id="vacationDays"
                    type="text"
                    value={`${calculateProportionalVacationMonths()}/12 avos`}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meses trabalhados no ano
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thirteenthSalary">13º Salário Proporcional</Label>
                  <Input
                    id="thirteenthSalary"
                    type="text"
                    value={`${calculateProportional13thMonths()}/12 avos`}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meses trabalhados no ano
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Aviso Prévio (dias)</Label>
                  <Input
                    id="noticePeriod"
                    type="text"
                    value={`${calculateNoticePeriodDays()} dias`}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const days = calculateNoticePeriodDays();
                      const additional = days - 30;
                      return additional > 0 
                        ? `30 dias + ${additional} dias adicionais (Lei 12.506/2011)`
                        : '30 dias (Lei 12.506/2011)';
                    })()}
                  </p>
                </div>

              <div className="space-y-2">
                <Label>Verbas Incontroversas Não Pagas na 1ª audiência (Art. 467 CLT)</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aplicar multa de 50%</span>
                  <Switch
                    checked={data.severance?.hasOwnProperty('undisputedAmountUnpaid')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateData({
                          severance: {
                            ...data.severance,
                            undisputedAmountUnpaid: 0 // 0 = cálculo automático
                          }
                        });
                      } else {
                        const newSeverance = { ...data.severance };
                        delete newSeverance.undisputedAmountUnpaid;
                        updateData({ severance: newSeverance });
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 A base é calculada automaticamente (saldo salário, aviso, férias, 13º e multa FGTS 40%)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Pagamento das Verbas Rescisórias (Art. 477 CLT)</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Houve atraso no pagamento?</span>
                  <Switch
                    checked={data.severance?.delayedPayment || false}
                    onCheckedChange={(checked) => updateData({
                      severance: {
                        ...data.severance,
                        delayedPayment: checked,
                        delayDays: checked ? (data.severance?.delayDays || 0) : 0
                      }
                    })}
                  />
                </div>
                {data.severance?.delayedPayment && (
                  <div className="mt-2">
                    <Label className="text-sm" htmlFor="delayDays">Dias de atraso</Label>
                    <Input
                      id="delayDays"
                      type="number"
                      min="0"
                      value={data.severance?.delayDays || ''}
                      onChange={(e) => updateData({
                        severance: {
                          ...data.severance,
                          delayDays: parseInt(e.target.value) || 0
                        }
                      })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Se ultrapassar 10 dias, aplica multa de 1 salário.</p>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Campos manuais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fgtsBalance">Saldo FGTS Informado (R$)</Label>
                <Input
                  id="fgtsBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.severance?.fgtsBalance || ''}
                  onChange={(e) => updateData({
                    severance: {
                      ...data.severance,
                      fgtsBalance: parseFloat(e.target.value) || 0
                    }
                  })}
                  placeholder="0,00"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Deixe em <strong>0,00</strong> para calcular o saldo devido, ou informe o valor para calcular a diferença
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacationDaysAccrued">Férias Vencidas (períodos completos)</Label>
                <Input
                  id="vacationDaysAccrued"
                  type="number"
                  min="0"
                  max="2"
                  value={data.severance?.vacationDaysDouble || ''}
                  onChange={(e) => updateData({
                    severance: {
                      ...data.severance,
                      vacationDaysDouble: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Períodos aquisitivos completos não gozados (máx: 2)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Demissão até 30 dias antes da data-base (Lei 7.238/84)</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Habilitar indenização adicional</span>
                  <Switch
                    checked={data.severance?.dismissalNearCategoryBaseDate || false}
                    onCheckedChange={(checked) => updateData({
                      severance: {
                        ...data.severance,
                        dismissalNearCategoryBaseDate: checked
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Banco de Horas</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Horas devidas e já pagas</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Possui Banco de Horas?</Label>
              <p className="text-sm text-muted-foreground">Informar para compensações</p>
            </div>
            <Switch
              checked={data.timeBank?.hasTimeBank || false}
              onCheckedChange={(checked) => updateData({
                timeBank: {
                  hasTimeBank: checked,
                  owedHours: checked ? (data.timeBank?.owedHours || 0) : 0,
                  paidHours: checked ? (data.timeBank?.paidHours || 0) : 0
                }
              })}
            />
          </div>

          {data.timeBank?.hasTimeBank && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label>Horas Devidas</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.timeBank.owedHours || ''}
                  onChange={(e) => updateData({
                    timeBank: {
                      ...data.timeBank!,
                      owedHours: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Horas Já Pagas</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.timeBank.paidHours || ''}
                  onChange={(e) => updateData({
                    timeBank: {
                      ...data.timeBank!,
                      paidHours: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Descontos</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">INSS, IRRF e benefícios</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-2 block">Médias de Variáveis</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">Período</Label>
                <Select
                  value={(data.averages?.period?.toString() as string) || '12'}
                  onValueChange={(value) => updateData({
                    averages: {
                      period: parseInt(value) as 3 | 6 | 12,
                      includeOvertime: data.averages?.includeOvertime ?? true,
                      includeAdditionals: data.averages?.includeAdditionals ?? true,
                      includeCommissions: data.averages?.includeCommissions ?? true,
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Incluir Horas Extras</span>
                <Switch
                  checked={data.averages?.includeOvertime ?? true}
                  onCheckedChange={(checked) => updateData({
                    averages: {
                      period: data.averages?.period || 12,
                      includeOvertime: checked,
                      includeAdditionals: data.averages?.includeAdditionals ?? true,
                      includeCommissions: data.averages?.includeCommissions ?? true,
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Incluir Adicionais</span>
                <Switch
                  checked={data.averages?.includeAdditionals ?? true}
                  onCheckedChange={(checked) => updateData({
                    averages: {
                      period: data.averages?.period || 12,
                      includeOvertime: data.averages?.includeOvertime ?? true,
                      includeAdditionals: checked,
                      includeCommissions: data.averages?.includeCommissions ?? true,
                    }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Incluir Comissões</span>
                <Switch
                  checked={data.averages?.includeCommissions ?? true}
                  onCheckedChange={(checked) => updateData({
                    averages: {
                      period: data.averages?.period || 12,
                      includeOvertime: data.averages?.includeOvertime ?? true,
                      includeAdditionals: data.averages?.includeAdditionals ?? true,
                      includeCommissions: checked,
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Calcular INSS</Label>
                <Switch
                  checked={data.discounts?.inss?.calculate || false}
                  onCheckedChange={(checked) => updateData({
                    discounts: {
                      ...data.discounts,
                      inss: { calculate: checked, dependents: data.discounts?.inss?.dependents || 0 }
                    }
                  })}
                />
              </div>
              {data.discounts?.inss?.calculate && (
                <Input
                  type="number"
                  min="0"
                  placeholder="Dependentes"
                  value={data.discounts?.inss?.dependents || ''}
                  onChange={(e) => updateData({
                    discounts: {
                      ...data.discounts!,
                      inss: { ...data.discounts!.inss!, dependents: parseInt(e.target.value) || 0 }
                    }
                  })}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Calcular IRRF</Label>
                <Switch
                  checked={data.discounts?.irrf?.calculate || false}
                  onCheckedChange={(checked) => updateData({
                    discounts: {
                      ...data.discounts,
                      irrf: { calculate: checked, dependents: data.discounts?.irrf?.dependents || 0 }
                    }
                  })}
                />
              </div>
              {data.discounts?.irrf?.calculate && (
                <Input
                  type="number"
                  min="0"
                  placeholder="Dependentes"
                  value={data.discounts?.irrf?.dependents || ''}
                  onChange={(e) => updateData({
                    discounts: {
                      ...data.discounts!,
                      irrf: { ...data.discounts!.irrf!, dependents: parseInt(e.target.value) || 0 }
                    }
                  })}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Vale-Transporte (R$/mês)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.discounts?.transportVoucher?.monthlyValue || ''}
                onChange={(e) => updateData({
                  discounts: {
                    ...data.discounts,
                    transportVoucher: {
                      monthlyValue: parseFloat(e.target.value) || 0,
                      hasDiscount: data.discounts?.transportVoucher?.hasDiscount ?? true
                    }
                  }
                })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Vale-Refeição (R$/mês)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.discounts?.mealVoucher?.monthlyValue || ''}
                onChange={(e) => updateData({
                  discounts: {
                    ...data.discounts,
                    mealVoucher: {
                      monthlyValue: parseFloat(e.target.value) || 0,
                      coparticipationRate: data.discounts?.mealVoucher?.coparticipationRate || 0
                    }
                  }
                })}
                placeholder="0,00"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={data.discounts?.mealVoucher?.coparticipationRate || ''}
                onChange={(e) => updateData({
                  discounts: {
                    ...data.discounts!,
                    mealVoucher: {
                      monthlyValue: data.discounts!.mealVoucher?.monthlyValue || 0,
                      coparticipationRate: parseFloat(e.target.value) || 0
                    }
                  }
                })}
                placeholder="% Coparticipação"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contribuição Sindical</Label>
                <Switch
                  checked={data.discounts?.sindicalContribution?.isOptional || false}
                  onCheckedChange={(checked) => updateData({
                    discounts: {
                      ...data.discounts,
                      sindicalContribution: { isOptional: checked }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Faltas (dias)</Label>
              <Input
                type="number"
                min="0"
                value={data.discounts?.absences?.days || ''}
                onChange={(e) => updateData({
                  discounts: {
                    ...data.discounts,
                    absences: {
                      days: parseInt(e.target.value) || 0,
                      justified: data.discounts?.absences?.justified || false
                    }
                  }
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Faltas justificadas?</Label>
                <Switch
                  checked={data.discounts?.absences?.justified || false}
                  onCheckedChange={(checked) => updateData({
                    discounts: {
                      ...data.discounts!,
                      absences: {
                        days: data.discounts!.absences?.days || 0,
                        justified: checked
                      }
                    }
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Atrasos (horas)</Label>
              <Input
                type="number"
                min="0"
                value={data.discounts?.delays?.hours || ''}
                onChange={(e) => updateData({
                  discounts: {
                    ...data.discounts,
                    delays: { hours: parseInt(e.target.value) || 0 }
                  }
                })}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Desvio de Função</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Configure se houve desvio de função</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Houve Desvio de Função?</Label>
              <p className="text-sm text-muted-foreground">Exerceu função diferente da contratada</p>
            </div>
            <Switch
              checked={data.functionDeviation?.hasDeviation || false}
              onCheckedChange={(checked) => {
                updateData({
                  functionDeviation: {
                    hasDeviation: checked,
                    originalPosition: checked ? '' : data.functionDeviation?.originalPosition || '',
                    deviatedPosition: checked ? '' : data.functionDeviation?.deviatedPosition || '',
                    differenceAmount: checked ? 0 : data.functionDeviation?.differenceAmount || 0,
                    deviationPeriodMonths: checked ? 0 : data.functionDeviation?.deviationPeriodMonths || 0
                  }
                });
              }}
            />
          </div>

          {data.functionDeviation?.hasDeviation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="differenceAmount">Diferença Salarial (R$/mês)</Label>
                <Input
                  id="differenceAmount"
                  type="number"
                  step="0.01"
                  value={data.functionDeviation.differenceAmount}
                  onChange={(e) => updateData({
                    functionDeviation: {
                      ...data.functionDeviation!,
                      differenceAmount: parseFloat(e.target.value) || 0
                    }
                  })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviationPeriodMonths">Período (meses)</Label>
                <Input
                  id="deviationPeriodMonths"
                  type="number"
                  value={data.functionDeviation.deviationPeriodMonths}
                  onChange={(e) => updateData({
                    functionDeviation: {
                      ...data.functionDeviation!,
                      deviationPeriodMonths: parseInt(e.target.value) || 0
                    }
                  })}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalDataStep();
      case 1:
        return renderSalaryDataStep();
      case 2:
        return renderWorkingHoursStep();
      case 3:
        return renderCalculationsStep();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Calculadora Trabalhista</h2>
          <Badge variant="outline">
            Etapa {currentStep + 1} de {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStep
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index === 0 && <User className="h-5 w-5" />}
              {index === 1 && <DollarSign className="h-5 w-5" />}
              {index === 2 && <Clock className="h-5 w-5" />}
              {index === 3 && <Calculator className="h-5 w-5" />}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-600 dark:bg-blue-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="overflow-visible">
          <CardTitle className="flex items-center space-x-2">
            {currentStep === 0 && <User className="h-5 w-5" />}
            {currentStep === 1 && <DollarSign className="h-5 w-5" />}
            {currentStep === 2 && <Clock className="h-5 w-5" />}
            {currentStep === 3 && <Calculator className="h-5 w-5" />}
            <span>{currentStepData.title}</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">{currentStepData.description}</div>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {!canProceed() && currentStep === 0 && (
          <div className="text-sm text-amber-500 dark:text-amber-400 text-center">
            ⚠️ Preencha todos os campos obrigatórios (*) para continuar
          </div>
        )}
        {!canProceed() && currentStep === 1 && (
          <div className="text-sm text-amber-500 dark:text-amber-400 text-center">
            ⚠️ Informe o salário base para continuar
          </div>
        )}
        {!canProceed() && currentStep === 2 && (
          <div className="text-sm text-amber-500 dark:text-amber-400 text-center">
            ⚠️ Preencha os dados da jornada de trabalho para continuar
          </div>
        )}
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className={!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}