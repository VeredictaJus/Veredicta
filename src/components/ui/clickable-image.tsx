import React from 'react';
import { Eye, Download } from 'lucide-react';

interface ClickableImageProps {
  src: string;
  alt?: string;
  fileName?: string;
  onImageClick: (imageUrl: string, fileName?: string) => void;
  onDownload?: (imageUrl: string, fileName?: string) => void;
  isOwnMessage?: boolean;
}

export function ClickableImage({ 
  src, 
  alt = 'Imagem', 
  fileName, 
  onImageClick, 
  onDownload,
  isOwnMessage = false 
}: ClickableImageProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onImageClick(src, fileName);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownload) {
      onDownload(src, fileName);
    }
  };

  return (
    <div className="mt-3">
      <div className="relative group">
        <div 
          className="cursor-pointer" 
          onClick={handleClick}
        >
          <img 
            src={src} 
            alt={alt}
            className="max-w-full h-auto rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
            style={{ maxHeight: '300px' }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Botão de download */}
        {onDownload && (
          <button
            onClick={handleDownload}
            className={`absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
              isOwnMessage ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-600'
            }`}
            title="Baixar imagem"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Informações do arquivo */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${
            isOwnMessage ? 'text-white/70' : 'text-gray-500'
          }`}>
            {fileName || 'imagem.jpg'}
          </span>
        </div>
      </div>
    </div>
  );
}


















