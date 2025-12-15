import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Paperclip,
  X,
  FileText,
  Image,
  File,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ Tipo separado corretamente
export interface AttachmentFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress?: number;
  error?: string;
}

interface FileAttachmentProps {
  attachments: AttachmentFile[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  onSendWithAttachments: () => void;
  isUploading?: boolean;
  maxFileSize?: number;
  allowedTypes?: string[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

// ✅ Componente com nome diferente para evitar conflito com o tipo
export const FileAttachmentComponent: React.FC<FileAttachmentProps> = ({
  attachments,
  onAddFiles,
  onRemoveFile,
  onSendWithAttachments,
  isUploading = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxFileSize)}`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert('Alguns arquivos não puderam ser adicionados:\n\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onAddFiles(validFiles);
    }
  }, [maxFileSize, allowedTypes, onAddFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      e.target.value = ''; // permite re-selecionar o mesmo arquivo
    },
    [handleFileSelect]
  );

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={openFileDialog}
        disabled={isUploading}
        aria-label="Anexar arquivo"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {isDragOver && (
        <div
          className="fixed inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 flex items-center justify-center z-50"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-lg font-medium">Solte os arquivos aqui</p>
            <p className="text-sm text-gray-500">
              Tipos aceitos: {allowedTypes.join(', ')}
            </p>
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600">
            Arquivos anexados ({attachments.length})
          </p>

          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={cn(
                'flex items-center gap-2 p-2 bg-white rounded border',
                attachment.error && 'border-red-200 bg-red-50'
              )}
            >
              {getFileIcon(attachment.type)}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={attachment.name}>
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>

                {attachment.uploadProgress !== undefined && (
                  <Progress value={attachment.uploadProgress} className="h-1 mt-1" />
                )}

                {attachment.error && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <p className="text-xs text-red-600">{attachment.error}</p>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(attachment.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                aria-label={`Remover ${attachment.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {attachments.length > 0 && !isUploading && (
            <Button
              type="button"
              size="sm"
              onClick={onSendWithAttachments}
              className="w-full mt-2"
            >
              Enviar com {attachments.length} arquivo
              {attachments.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
