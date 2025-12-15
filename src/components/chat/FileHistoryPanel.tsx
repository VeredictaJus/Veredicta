import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Image, 
  File, 
  Download, 
  Search,
  Calendar,
  User,
  Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  messageId: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  conversationId: string;
}

interface FileHistoryPanelProps {
  files: FileItem[];
  onDownload: (file: FileItem) => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('document') || type.includes('word')) return <FileText className="h-4 w-4 text-blue-600" />;
  return <File className="h-4 w-4 text-gray-500" />;
};

const getFileTypeCategory = (type: string): string => {
  if (type.startsWith('image/')) return 'images';
  if (type.includes('pdf')) return 'pdfs';
  if (type.includes('document') || type.includes('word')) return 'docs';
  return 'others';
};

export const FileHistoryPanel: React.FC<FileHistoryPanelProps> = ({
  files,
  onDownload,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredFiles = useMemo(() => {
    let filtered = files;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(file => getFileTypeCategory(file.type) === activeTab);
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [files, searchQuery, activeTab]);

  const categoryStats = useMemo(() => {
    const stats = {
      all: files.length,
      images: 0,
      pdfs: 0,
      docs: 0,
      others: 0
    };

    files.forEach(file => {
      const category = getFileTypeCategory(file.type);
      stats[category as keyof typeof stats]++;
    });

    return stats;
  }, [files]);

  const handleDownload = (file: FileItem) => {
    onDownload(file);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Paperclip className="h-4 w-4 mr-2" />
          Arquivos ({files.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Histórico de Arquivos</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou remetente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs">
                Todos ({categoryStats.all})
              </TabsTrigger>
              <TabsTrigger value="images" className="text-xs">
                Imagens ({categoryStats.images})
              </TabsTrigger>
              <TabsTrigger value="pdfs" className="text-xs">
                PDFs ({categoryStats.pdfs})
              </TabsTrigger>
              <TabsTrigger value="docs" className="text-xs">
                Docs ({categoryStats.docs})
              </TabsTrigger>
              <TabsTrigger value="others" className="text-xs">
                Outros ({categoryStats.others})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum arquivo encontrado</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">
                        Tente ajustar sua busca ou limpar o filtro
                      </p>
                    )}
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate" title={file.name}>
                              {file.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(file.size)}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="h-3 w-3" />
                                {file.senderName}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {formatDate(file.timestamp)}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Image Preview */}
                      {file.type.startsWith('image/') && (
                        <div className="mt-2">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="max-w-full h-20 object-cover rounded border"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};