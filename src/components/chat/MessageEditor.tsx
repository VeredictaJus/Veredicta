import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Save, X, Clock } from 'lucide-react';

interface MessageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContent: string) => void;
  originalContent: string;
  messageId: string;
  timestamp: Date;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  originalContent,
  messageId,
  timestamp
}) => {
  const [content, setContent] = useState(originalContent);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(originalContent);
      // Focus textarea after dialog opens
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(originalContent.length, originalContent.length);
      }, 100);
    }
  }, [isOpen, originalContent]);

  const handleSave = async () => {
    if (content.trim() === originalContent.trim()) {
      onClose();
      return;
    }

    if (!content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(content.trim());
      onClose();
    } catch (error) {
      console.error('Failed to save message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isChanged = content.trim() !== originalContent.trim();
  const isEmpty = !content.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Editar Mensagem</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Enviada em {timestamp.toLocaleString('pt-BR')}</span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Conteúdo da mensagem:
            </label>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="min-h-[100px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {content.length}/2000 caracteres
              </span>
              {isChanged && (
                <Badge variant="outline" className="text-xs">
                  Modificado
                </Badge>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="text-sm text-gray-900 break-words">
              {content || <em className="text-gray-400">Mensagem vazia</em>}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isEmpty || !isChanged}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>

        <div className="text-xs text-gray-500 text-center border-t pt-3">
          <p>💡 Dica: Use Ctrl+Enter para salvar ou Esc para cancelar</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};