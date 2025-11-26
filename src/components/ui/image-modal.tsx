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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background com blur intenso */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Container principal com glassmorphism */}
      <div className="relative max-w-[90vw] max-h-[90vh] bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/30">
        {/* Header com glassmorphism */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/90 to-orange-600/90 dark:from-orange-600/90 dark:to-orange-700/90 backdrop-blur-md border-b border-white/20 dark:border-gray-700/30">
          <h3 className="text-lg font-semibold truncate max-w-[300px] text-white drop-shadow-lg">
            {fileName || 'Imagem'}
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              title="Diminuir zoom"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-white min-w-[60px] text-center font-semibold drop-shadow-md bg-white/10 dark:bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              title="Aumentar zoom"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              title="Rotacionar"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              title="Resetar"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-xs"
            >
              Reset
            </Button>
            
            <div className="w-px h-6 bg-white/30 dark:bg-white/20 mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Baixar imagem"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Fechar"
              className="text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Área da imagem com blur sutil no fundo */}
        <div className="flex items-center justify-center p-4 bg-gradient-to-br from-white/5 to-gray-100/5 dark:from-gray-900/5 dark:to-black/5 backdrop-blur-sm overflow-hidden" style={{ maxHeight: '80vh' }}>
          <div className="relative">
            {/* Sombra suave ao redor da imagem */}
            {/* ✅ OTIMIZAÇÃO: Usar will-change para melhor performance */}
            <div 
              className="absolute inset-0 blur-2xl opacity-30"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px)',
                willChange: 'transform',
                transform: 'translateZ(0)', // Force GPU acceleration
              }} 
            />
            
            <img
              src={imageUrl}
              alt={fileName || 'Imagem'}
              className="relative max-w-full max-h-full object-contain transition-transform duration-200 drop-shadow-2xl"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translateZ(0)`, // ✅ Force GPU acceleration
                cursor: scale > 1 ? 'grab' : 'default',
                filter: 'drop-shadow(0 25px 50px -12px rgba(0, 0, 0, 0.5))',
                willChange: 'transform', // ✅ Prevents forced reflow
              }}
              draggable={false}
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
        
        {/* Footer com glassmorphism */}
        <div className="p-4 bg-gradient-to-r from-orange-500/90 to-orange-600/90 dark:from-orange-600/90 dark:to-orange-700/90 backdrop-blur-md border-t border-white/20 dark:border-gray-700/30 text-sm text-center text-white">
          <p className="drop-shadow-md">Clique fora da imagem ou pressione ESC para fechar • Use os controles acima para zoom e rotação</p>
        </div>
      </div>
    </div>
  );
}
