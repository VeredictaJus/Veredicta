import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flag, AlertTriangle, MessageSquare, Zap, Users, FileX } from 'lucide-react';
import { ChatMessageData } from './ChatMessage';
import { useToast } from '@/hooks/use-toast';
import { rateLimiter } from '@/services/RateLimiter';

interface MessageReportProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string, details?: string) => void;
  message: ChatMessageData;
}

const reportReasons = [
  {
    id: 'harassment',
    label: 'Assédio ou Bullying',
    description: 'Comportamento ofensivo, intimidação ou ameaças',
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    id: 'inappropriate',
    label: 'Linguagem Inapropriada',
    description: 'Linguagem ofensiva, palavrões ou conteúdo impróprio',
    icon: MessageSquare,
    color: 'text-orange-600'
  },
  {
    id: 'spam',
    label: 'Spam ou Conteúdo Repetitivo',
    description: 'Mensagens repetitivas, propaganda não solicitada',
    icon: Zap,
    color: 'text-yellow-600'
  },
  {
    id: 'discrimination',
    label: 'Discriminação',
    description: 'Conteúdo discriminatório baseado em raça, gênero, religião, etc.',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    id: 'inappropriate_content',
    label: 'Conteúdo Inadequado',
    description: 'Conteúdo sexual, violento ou inadequado para o contexto',
    icon: FileX,
    color: 'text-pink-600'
  }
];

export const MessageReport: React.FC<MessageReportProps> = ({
  isOpen,
  onClose,
  onReport,
  message
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast({
        title: "Selecione um motivo",
        description: "Por favor, selecione um motivo para o relatório.",
        variant: "destructive",
      });
      return;
    }

    // Check rate limit
    const currentUserId = localStorage.getItem('user_id') || 'anonymous';
    const rateLimitCheck = rateLimiter.checkLimit(currentUserId, 'report');
    
    if (!rateLimitCheck.allowed) {
      toast({
        title: "Muitos relatórios",
        description: rateLimitCheck.reason || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      onReport(selectedReason, details.trim() || undefined);
      
      toast({
        title: "Relatório enviado",
        description: "Seu relatório foi enviado para análise dos administradores.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonData = reportReasons.find(r => r.id === selectedReason);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Reportar Mensagem
          </DialogTitle>
          <DialogDescription>
            Ajude-nos a manter um ambiente seguro reportando conteúdo inadequado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview da mensagem */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {message.senderName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {message.senderName}
                    </span>
                    {message.senderType && (
                      <Badge variant="outline" className="text-xs">
                        {message.senderType === 'admin' ? 'Admin' : 
                         message.senderType === 'support' ? 'Suporte' :
                         message.senderType === 'writer' ? 'Redator' : 'Cliente'}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                    {message.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção do motivo */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Por que você está reportando esta mensagem?
            </Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              <div className="space-y-3">
                {reportReasons.map((reason) => {
                  const IconComponent = reason.icon;
                  return (
                    <div key={reason.id} className="flex items-start space-x-3">
                      <RadioGroupItem 
                        value={reason.id} 
                        id={reason.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={reason.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <IconComponent className={`h-4 w-4 ${reason.color}`} />
                          <span className="font-medium">{reason.label}</span>
                        </Label>
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Detalhes adicionais */}
          <div>
            <Label htmlFor="details" className="text-base font-medium mb-2 block">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="details"
              placeholder="Forneça mais detalhes sobre o problema..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {details.length}/500 caracteres
            </div>
          </div>

          {/* Preview do que será enviado */}
          {selectedReasonData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <selectedReasonData.icon className={`h-5 w-5 ${selectedReasonData.color} mt-0.5`} />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Resumo do Relatório
                    </h4>
                    <p className="text-sm text-blue-800">
                      <strong>Motivo:</strong> {selectedReasonData.label}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Mensagem de:</strong> {message.senderName}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Data:</strong> {message.timestamp.toLocaleString('pt-BR')}
                    </p>
                    {details.trim() && (
                      <p className="text-sm text-blue-800 mt-2">
                        <strong>Detalhes:</strong> {details.trim()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};