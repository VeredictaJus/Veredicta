import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalculationResult } from '@/types/calculator';
import { formatCurrency, formatDate } from '@/lib/calculator/laborCalculations';
import { Download, FileText, AlertTriangle, Scale, DollarSign, Clock, User, Save, Edit } from 'lucide-react';

interface ResultsDisplayProps {
  result: CalculationResult;
  onExportPDF: () => void;
  onCreatePetition: () => void;
  onNewCalculation: () => void;
  onSaveCalculation?: (title: string, description?: string) => Promise<void>;
  savedCalculationId?: string | null;
}

export default function ResultsDisplay({ 
  result, 
  onExportPDF, 
  onCreatePetition, 
  onNewCalculation,
  onSaveCalculation,
  savedCalculationId
}: ResultsDisplayProps) {
  const totalAmount = result.grandTotal;
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState(result.employeeName || 'Cálculo Trabalhista');
  const [saveDescription, setSaveDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSaveCalculation || !saveTitle.trim()) return;

    setIsSaving(true);
    try {
      await onSaveCalculation(saveTitle, saveDescription || undefined);
      setIsSaveDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resultado dos Cálculos</h2>
          <p className="text-muted-foreground">
            Cálculo para {result.employeeName} - {formatDate(result.calculationDate)}
          </p>
        </div>
        <div className="flex space-x-2">
          {onSaveCalculation && (
            <Button 
              variant={savedCalculationId ? "outline" : "default"}
              onClick={() => setIsSaveDialogOpen(true)}
            >
              {savedCalculationId ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Atualizar
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Cálculo
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {result.prescriptionWarnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas de Prescrição</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.prescriptionWarnings.map((warning, index) => (
                <p key={index} className="text-sm text-amber-700">{warning}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            <span>Total Geral</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">
            {formatCurrency(totalAmount)}
          </div>
          <p className="text-sm text-green-600 mt-1">
            Valor total das verbas trabalhistas calculadas
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Verbas Rescisórias</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground whitespace-nowrap">Valores devidos na rescisão</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.severanceResults.noticePay > 0 && (
              <div className="flex justify-between">
                <span>
                  Aviso Prévio ({result.severanceResults.noticeDaysTotal || 30} dias)
                </span>
                <span className="font-medium">{formatCurrency(result.severanceResults.noticePay)}</span>
              </div>
            )}
            {/* Aviso proporcional já está incorporado no total de dias e valor do aviso acima */}
            {result.severanceResults.lastSalary > 0 && (
              <div className="flex justify-between">
                <span>Saldo de Salário</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.lastSalary)}</span>
              </div>
            )}
            {result.severanceResults.vacationPay > 0 && (
              <div className="flex justify-between">
                <span>Férias Proporcionais</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.vacationPay)}</span>
              </div>
            )}
            {result.severanceResults.vacationBonus > 0 && (
              <div className="flex justify-between">
                <span>1/3 Constitucional</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.vacationBonus)}</span>
              </div>
            )}
            {result.severanceResults.vacationPayDouble && result.severanceResults.vacationPayDouble > 0 && (
              <div className="flex justify-between">
                <span>Férias Vencidas em Dobro + 1/3</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.vacationPayDouble)}</span>
              </div>
            )}
            {result.severanceResults.fgtsWithdrawal > 0 && (
              <div className="flex justify-between">
                <span>FGTS 8% (depósitos do contrato)</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.fgtsWithdrawal)}</span>
              </div>
            )}
            {result.severanceResults.fgtsPenalty > 0 && (
              <div className="flex justify-between">
                <span>Multa FGTS 40%</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.fgtsPenalty)}</span>
              </div>
            )}
            {result.severanceResults.additionalCompensation && result.severanceResults.additionalCompensation > 0 && (
              <div className="flex justify-between">
                <span>Indenização Adicional (Lei 7.238/84)</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.additionalCompensation)}</span>
              </div>
            )}
            {result.severanceResults.art477Fine > 0 && (
              <div className="flex justify-between">
                <span>Multa Art. 477 CLT</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.art477Fine)}</span>
              </div>
            )}
            {result.severanceResults.art467Fine > 0 && (
              <div className="flex justify-between">
                <span>Multa Art. 467 CLT</span>
                <span className="font-medium">{formatCurrency(result.severanceResults.art467Fine)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>{formatCurrency(result.severanceResults.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Horas Extras e Intervalos</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground whitespace-nowrap">Valores de horas extras e multas</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.overtimeResults.weekdayOvertime > 0 && (
              <div className="flex justify-between">
                <span>Horas Extras 50%</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.weekdayOvertime)}</span>
              </div>
            )}
            {result.overtimeResults.weekendOvertime > 0 && (
              <div className="flex justify-between">
                <span>Horas Extras 100%</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.weekendOvertime)}</span>
              </div>
            )}
            {result.overtimeResults.dsrOverHoursExtras > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-600 dark:text-blue-400">DSR sobre Horas Extras (Súmula 172 TST)</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(result.overtimeResults.dsrOverHoursExtras)}</span>
              </div>
            )}
            {result.overtimeResults.nightShiftDifferential > 0 && (
              <div className="flex justify-between">
                <span>Adicional Noturno (Art. 73 CLT)</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.nightShiftDifferential)}</span>
              </div>
            )}
{(result as any).overtimeResults?.art384Pay > 0 && (
  <div className="flex justify-between">
    <span>Intervalo do Art. 384 (Mulher) - 15min por dia com HE</span>
    <span className="font-medium">{formatCurrency((result as any).overtimeResults.art384Pay)}</span>
  </div>
)}
            {result.overtimeResults.lunchBreakPenalty > 0 && (
              <div className="flex justify-between">
                <span>Multa Intervalo Almoço (Art. 71 CLT)</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.lunchBreakPenalty)}</span>
              </div>
            )}
            {result.overtimeResults.betweenShiftsPenalty > 0 && (
              <div className="flex justify-between">
                <span>Multa Intervalo 11h (Art. 66 CLT)</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.betweenShiftsPenalty)}</span>
              </div>
            )}
            {result.overtimeResults.onCallPay > 0 && (
              <div className="flex justify-between">
                <span>Sobreaviso (Súmula 428 TST)</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.onCallPay)}</span>
              </div>
            )}
            {result.overtimeResults.standbyPay > 0 && (
              <div className="flex justify-between">
                <span>Prontidão</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.standbyPay)}</span>
              </div>
            )}
            {result.overtimeResults.inItinerePay > 0 && (
              <div className="flex justify-between">
                <span>Horas In Itinere (Súmula 90 TST)</span>
                <span className="font-medium">{formatCurrency(result.overtimeResults.inItinerePay)}</span>
              </div>
            )}
            {result.overtimeResults.reflectionsDetailed && (
              <div className="bg-blue-500/10 border-t border-blue-500/20 pt-3 mt-2">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">📊 REFLEXOS DAS HORAS EXTRAS:</p>
                {result.overtimeResults.reflectionsByItem?.weekday && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">HE 50%:</p>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekday.vacation)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekday.vacationBonus)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekday.thirteenth)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ FGTS 8%</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekday.fgts)}</span></div>
                  </div>
                )}
                {result.overtimeResults.reflectionsByItem?.weekend && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">HE 100%:</p>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekend.vacation)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekend.vacationBonus)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekend.thirteenth)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ FGTS 8%</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.weekend.fgts)}</span></div>
                  </div>
                )}
                {(result.overtimeResults.reflectionsByItem?.lunchBreak || result.overtimeResults.reflectionsByItem?.betweenShifts) && (
                  <>
                    {result.overtimeResults.reflectionsByItem?.lunchBreak && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Intervalo Intrajornada:</p>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.vacation)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.vacationBonus)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.thirteenth)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ FGTS 8%</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.lunchBreak.fgts)}</span></div>
                      </div>
                    )}
                    {result.overtimeResults.reflectionsByItem?.betweenShifts && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Intervalo Interjornada:</p>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.vacation)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.vacationBonus)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.thirteenth)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ FGTS 8%</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.betweenShifts.fgts)}</span></div>
                      </div>
                    )}
                    {result.overtimeResults.reflectionsByItem?.onCall && result.overtimeResults.onCallPay > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Sobreaviso:</p>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.onCall.vacation)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.onCall.vacationBonus)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.onCall.thirteenth)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ FGTS 8%</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.onCall.fgts)}</span></div>
                      </div>
                    )}
                    {result.overtimeResults.reflectionsByItem?.standby && result.overtimeResults.standbyPay > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Prontidão:</p>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.standby.vacation)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.standby.vacationBonus)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.standby.thirteenth)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ FGTS 8%</span><span className="font-medium">{formatCurrency(result.overtimeResults.reflectionsByItem.standby.fgts)}</span></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>{formatCurrency(result.overtimeResults.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5" />
              <span>Adicionais</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground whitespace-nowrap">Insalubridade, periculosidade e reflexos</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.additionalsResults.insalubrityAmount > 0 && (
              <div className="flex justify-between">
                <span>Insalubridade</span>
                <span className="font-medium">{formatCurrency(result.additionalsResults.insalubrityAmount)}</span>
              </div>
            )}
            {result.additionalsResults.dangerousnessAmount > 0 && (
              <div className="flex justify-between">
                <span>Periculosidade</span>
                <span className="font-medium">{formatCurrency(result.additionalsResults.dangerousnessAmount)}</span>
              </div>
            )}
            {result.additionalsResults.transferBonusAmount > 0 && (
              <div className="flex justify-between">
                <span>Adicional de Transferência (25%)</span>
                <span className="font-medium">{formatCurrency(result.additionalsResults.transferBonusAmount)}</span>
              </div>
            )}
            {result.additionalsResults.breakageFeeAmount > 0 && (
              <div className="flex justify-between">
                <span>Quebra de Caixa (10%)</span>
                <span className="font-medium">{formatCurrency(result.additionalsResults.breakageFeeAmount)}</span>
              </div>
            )}
            {result.additionalsResults.timeServiceBonusAmount > 0 && (
              <div className="flex justify-between">
                <span>Anuênio / Tempo de Serviço</span>
                <span className="font-medium">{formatCurrency(result.additionalsResults.timeServiceBonusAmount)}</span>
              </div>
            )}
            {result.additionalsResults.reflections > 0 && (
              <>
                <div className="bg-blue-500/10 border-t border-blue-500/20 pt-3 mt-2">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    📊 REFLEXOS DOS ADICIONAIS (Súmula 347 TST):
                  </p>
                  {result.additionalsResults.reflectionsByItem?.insalubrity && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Insalubridade:</p>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ DSR</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.dsr)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.vacation)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.vacationBonus)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.insalubrity.thirteenth)}</span></div>
                    </div>
                  )}
                  {result.additionalsResults.reflectionsByItem?.dangerousness && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Periculosidade:</p>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ DSR</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.dsr)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.vacation)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.vacationBonus)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.dangerousness.thirteenth)}</span></div>
                    </div>
                  )}
                  {result.additionalsResults.reflectionsByItem?.transferBonus && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Adicional de Transferência:</p>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ DSR</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.dsr)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.vacation)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.vacationBonus)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.transferBonus.thirteenth)}</span></div>
                    </div>
                  )}
                  {result.additionalsResults.reflectionsByItem?.breakageFee && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Quebra de Caixa:</p>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ DSR</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.dsr)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.vacation)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.vacationBonus)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.breakageFee.thirteenth)}</span></div>
                    </div>
                  )}
                  {result.additionalsResults.reflectionsByItem?.timeServiceBonus && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Anuênio / Tempo de Serviço:</p>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ DSR</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.dsr)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.vacation)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 1/3 Férias</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.vacationBonus)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">→ 13º</span><span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsByItem.timeServiceBonus.thirteenth)}</span></div>
                    </div>
                  )}
                  {result.additionalsResults.reflectionsDetailed && (
                    <>
                      {result.additionalsResults.reflectionsDetailed.dsrReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo DSR</span>
                          <span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsDetailed.dsrReflection)}</span>
                        </div>
                      )}
                      {result.additionalsResults.reflectionsDetailed.vacationReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo Férias</span>
                          <span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsDetailed.vacationReflection)}</span>
                        </div>
                      )}
                      {result.additionalsResults.reflectionsDetailed.vacationBonusReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo 1/3 Férias</span>
                          <span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsDetailed.vacationBonusReflection)}</span>
                        </div>
                      )}
                      {result.additionalsResults.reflectionsDetailed.thirteenthReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo 13º</span>
                          <span className="font-medium">{formatCurrency(result.additionalsResults.reflectionsDetailed.thirteenthReflection)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-blue-500/20">
                    <span className="text-blue-600 dark:text-blue-400">Total Reflexos</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(result.additionalsResults.reflections)}</span>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>{formatCurrency(result.additionalsResults.total)}</span>
            </div>
          </CardContent>
        </Card>

        {result.functionDeviationResults && (
          <Card>
            <CardHeader>
              <CardTitle>Desvio de Função</CardTitle>
              <div className="text-sm text-muted-foreground whitespace-nowrap">Diferenças salariais e reflexos</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Diferença Salarial</span>
                <span className="font-medium">{formatCurrency(result.functionDeviationResults.salaryDifference)}</span>
              </div>
              {result.functionDeviationResults.reflections > 0 && (
                <div className="bg-blue-500/10 border-t border-blue-500/20 pt-3 mt-2">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    📊 REFLEXOS DO DESVIO:
                  </p>
                  {result.functionDeviationResults.reflectionsDetailed && (
                    <>
                      {result.functionDeviationResults.reflectionsDetailed.vacationReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo Férias</span>
                          <span className="font-medium">{formatCurrency(result.functionDeviationResults.reflectionsDetailed.vacationReflection)}</span>
                        </div>
                      )}
                      {result.functionDeviationResults.reflectionsDetailed.vacationBonusReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo 1/3 Férias</span>
                          <span className="font-medium">{formatCurrency(result.functionDeviationResults.reflectionsDetailed.vacationBonusReflection)}</span>
                        </div>
                      )}
                      {result.functionDeviationResults.reflectionsDetailed.thirteenthReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo 13º</span>
                          <span className="font-medium">{formatCurrency(result.functionDeviationResults.reflectionsDetailed.thirteenthReflection)}</span>
                        </div>
                      )}
                      {result.functionDeviationResults.reflectionsDetailed.dsrReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo DSR</span>
                          <span className="font-medium">{formatCurrency(result.functionDeviationResults.reflectionsDetailed.dsrReflection)}</span>
                        </div>
                      )}
                      {result.functionDeviationResults.reflectionsDetailed.fgtsReflection > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">→ Reflexo FGTS 8%</span>
                          <span className="font-medium">{formatCurrency(result.functionDeviationResults.reflectionsDetailed.fgtsReflection)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-blue-500/20">
                    <span className="text-blue-600 dark:text-blue-400">Total Reflexos</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(result.functionDeviationResults.reflections)}</span>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>{formatCurrency(result.functionDeviationResults.total)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Memória de Cálculo</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Detalhamento dos cálculos realizados</div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {result.calculationMemory.join('\n')}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Honorários e Descontos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Honorários Advocatícios ({result.honorariosResults?.percentage || 15}%)</CardTitle>
            <div className="text-sm text-muted-foreground whitespace-nowrap">CLT, art. 791-A</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Base</span>
              <span className="font-medium">{formatCurrency(result.totalWithCorrectionAndInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span>Percentual</span>
              <span className="font-medium">{result.honorariosResults?.percentage || 15}%</span>
            </div>
            <div className="flex justify-between text-primary font-semibold">
              <span>💰 Honorários</span>
              <span>{formatCurrency(result.honorariosResults?.amount || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descontos Legais</CardTitle>
            <div className="text-sm text-muted-foreground whitespace-nowrap">INSS e IRRF ao final</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.discountsResults && (
              <>
                <div className="flex justify-between"><span>INSS</span><span className="font-medium">{formatCurrency(result.discountsResults.inss)}</span></div>
                <div className="flex justify-between"><span>IRRF</span><span className="font-medium">{formatCurrency(result.discountsResults.irrf)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total Descontos</span><span>{formatCurrency(result.discountsResults.total)}</span></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {result.netTotal !== undefined && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              <span>Total Líquido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(result.netTotal)}</div>
            <p className="text-sm text-green-600 mt-1">Após descontos legais</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fundamentos Legais</CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">Base legal para os cálculos</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.legalBasis.map((basis, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Badge variant="outline" className="mt-0.5">
                  {index + 1}
                </Badge>
                <span className="text-sm">{basis}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onNewCalculation}>
          Novo Cálculo
        </Button>
        <Button onClick={onExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Modal para Salvar Cálculo */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {savedCalculationId ? 'Atualizar Cálculo' : 'Salvar Cálculo'}
            </DialogTitle>
            <DialogDescription>
              {savedCalculationId 
                ? 'Atualize as informações do cálculo salvo.'
                : 'Salve este cálculo para acessá-lo e editá-lo depois.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-title">Título *</Label>
              <Input
                id="save-title"
                placeholder="Ex: Cálculo - João Silva"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Nome do cliente ou identificação do cálculo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="save-description">Descrição (Opcional)</Label>
              <Textarea
                id="save-description"
                placeholder="Ex: Demissão sem justa causa - Horas extras não pagas"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Observações ou detalhes do caso
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSaveDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!saveTitle.trim() || isSaving}
            >
              {isSaving ? (
                'Salvando...'
              ) : (
                savedCalculationId ? 'Atualizar' : 'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}