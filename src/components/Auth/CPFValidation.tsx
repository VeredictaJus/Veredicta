import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FreePlanDocumentService, DocumentValidationResult } from '@/services/freePlanDocumentService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface DocumentValidationProps {
  onValidationComplete: (isValid: boolean, document: string, documentType: 'CPF' | 'CNPJ') => void;
  initialDocument?: string;
}

export default function DocumentValidation({ onValidationComplete, initialDocument = '' }: DocumentValidationProps) {
  const [document, setDocument] = useState(initialDocument);
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  const formatDocumentInput = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara baseada no tamanho
    if (numbers.length <= 11) {
      // CPF: XXX.XXX.XXX-XX
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numbers.length <= 14) {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocumentInput(e.target.value);
    setDocument(formatted);
    setValidationResult(null);
    setIsValidated(false);
  };

  const validateDocument = async () => {
    if (!document || document.length < 14) {
      setValidationResult({
        canUseFreePlan: false,
        message: 'Por favor, digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
        error: 'INVALID_FORMAT'
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await FreePlanDocumentService.validateDocumentForFreePlan(document);
      setValidationResult(result);
      setIsValidated(result.canUseFreePlan);
      if (result.documentType) {
        onValidationComplete(result.canUseFreePlan, document, result.documentType);
      }
    } catch (error) {
      setValidationResult({
        canUseFreePlan: false,
        message: 'Erro interno. Tente novamente.',
        error: 'UNKNOWN_ERROR'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getAlertVariant = () => {
    if (!validationResult) return 'default';
    return validationResult.canUseFreePlan ? 'default' : 'destructive';
  };

  const getAlertIcon = () => {
    if (!validationResult) return null;
    return validationResult.canUseFreePlan ? CheckCircle : AlertCircle;
  };

  const getPlaceholder = () => {
    const numbers = document.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return '000.000.000-00';
    } else {
      return '00.000.000/0000-00';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="document">CPF ou CNPJ *</Label>
        <div className="flex gap-2">
          <Input
            id="document"
            type="text"
            placeholder={getPlaceholder()}
            value={document}
            onChange={handleDocumentChange}
            maxLength={18}
            className="flex-1"
            disabled={isValidating || isValidated}
          />
          <Button
            type="button"
            onClick={validateDocument}
            disabled={isValidating || !document || document.length < 14 || isValidated}
            variant="outline"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Verificar'
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          ⚠️ O plano Free pode ser usado apenas uma vez por CPF ou CNPJ
        </p>
      </div>

      {validationResult && (
        <Alert variant={getAlertVariant()}>
          {getAlertIcon() && (
            <getAlertIcon className="h-4 w-4" />
          )}
          <AlertDescription>
            {validationResult.message}
          </AlertDescription>
        </Alert>
      )}

      {isValidated && validationResult?.documentType && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {validationResult.documentType} válido! Você pode prosseguir com o plano Free.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
