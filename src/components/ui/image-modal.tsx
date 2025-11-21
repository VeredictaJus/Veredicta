import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName?: string;
  onDownload?: () => void;
}

export function ImageModal({ isOpen, onClose, imageUrl, fileName, onDownload }: ImageModalProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  // Prevenir scroll quando modal está aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback: criar link de download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName || 'imagem.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-orange-600 border-b text-white">
          <h3 className="text-lg font-semibold truncate max-w-[300px]">
            {fileName || 'Imagem'}
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              title="Diminuir zoom"
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-white min-w-[60px] text-center font-semibold">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              title="Aumentar zoom"
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              title="Rotacionar"
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              title="Resetar"
              className="text-white hover:bg-white/20"
            >
              Reset
            </Button>
            
            <div className="w-px h-6 bg-white/30 mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Baixar imagem"
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Fechar"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Área da imagem */}
        <div className="flex items-center justify-center p-4 bg-white overflow-hidden" style={{ maxHeight: '80vh' }}>
          <img
            src={imageUrl}
            alt={fileName || 'Imagem'}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              cursor: scale > 1 ? 'grab' : 'default'
            }}
            draggable={false}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-orange-600 border-t text-sm text-center text-white">
          <p>Clique fora da imagem ou pressione ESC para fechar • Use os controles acima para zoom e rotação</p>
        </div>
      </div>
      
      {/* Overlay para fechar */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}
