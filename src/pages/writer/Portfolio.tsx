import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle2, AlertCircle, Clock, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { WriterProfile, WriterPortfolio } from '@/types';

interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
}

const mockPortfolioHistory: WriterPortfolio[] = [
  {
    id: '1',
    writer_id: 'writer_1',
    petition_files: [
      {
        file_name: 'Petição_Inicial_Trabalhista.pdf',
        file_url: '/mock/petition1.pdf',
        file_size: 2048000,
        upload_date: '2024-12-15T10:00:00Z'
      },
      {
        file_name: 'Contestação_Civil.pdf', 
        file_url: '/mock/petition2.pdf',
        file_size: 1536000,
        upload_date: '2024-12-15T10:00:00Z'
      },
      {
        file_name: 'Recurso_Apelação.pdf',
        file_url: '/mock/petition3.pdf',
        file_size: 1800000,
        upload_date: '2024-12-15T10:00:00Z'
      }
    ],
    submission_date: '2024-12-15T10:00:00Z',
    status: 'rejected',
    admin_comments: 'As petições apresentam boa estrutura, mas necessitam de maior aprofundamento jurídico e fundamentação doutrinária. Recomendamos revisar a argumentação e incluir mais jurisprudência relevante.',
    reviewed_by: 'Dra. Ana Costa - Supervisora',
    reviewed_at: '2024-12-18T14:30:00Z',
    rejection_reason: 'Qualidade técnica insuficiente'
  }
];

export default function Portfolio() {
  const { profile } = useAuth() as { profile: WriterProfile };
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const maxFiles = 3;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: FileUpload[] = [];
    
    files.forEach(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Arquivo ${file.name} não é um tipo válido. Use apenas PDF ou DOC/DOCX.`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: 5MB.`);
        return;
      }

      // Check total files
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        toast.error(`Máximo de ${maxFiles} arquivos permitidos.`);
        return;
      }

      validFiles.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      });
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].url) {
        URL.revokeObjectURL(newFiles[index].url!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length !== maxFiles) {
      toast.error(`Você deve enviar exatamente ${maxFiles} petições autorais.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Portfólio enviado com sucesso! Aguarde a análise da nossa equipe.');
      
      // In production, would update user status
      // updateWriterStatus('under_review');
      
      navigate('/writer/dashboard');
      
    } catch (error) {
      toast.error('Erro ao enviar portfólio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando Análise';
      case 'under_review':
        return 'Em Análise';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  // Show approval status if already approved
  if (profile.approval_status === 'approved') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfólio</h1>
            <p className="text-gray-600">Status da sua aprovação na plataforma</p>
          </div>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Parabéns!</strong> Seu portfólio foi aprovado e você já pode aceitar petições na plataforma.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-4">
          <Button onClick={() => navigate('/writer/available-petitions')}>
            Ver Petições Disponíveis
          </Button>
          <Button variant="outline" onClick={() => navigate('/writer/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submissão de Portfólio</h1>
          <p className="text-gray-600">Envie 3 petições autorais para análise da nossa equipe</p>
        </div>
      </div>

      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Status da Aprovação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(profile.approval_status)}>
              {getStatusLabel(profile.approval_status)}
            </Badge>
            <span className="text-sm text-gray-600">
              {profile.approval_status === 'pending_portfolio' && 'Aguardando submissão do portfólio'}
              {profile.approval_status === 'under_review' && 'Portfólio em análise pela equipe'}
              {profile.approval_status === 'rejected' && 'Portfólio rejeitado - você pode enviar novamente'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Histórico (se rejeitado) */}
      {profile.approval_status === 'rejected' && mockPortfolioHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Última Tentativa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockPortfolioHistory.map((portfolio) => (
              <div key={portfolio.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Enviado em {new Date(portfolio.submission_date).toLocaleDateString('pt-BR')}
                  </span>
                  <Badge className={getStatusColor(portfolio.status)}>
                    {getStatusLabel(portfolio.status)}
                  </Badge>
                </div>
                
                {portfolio.admin_comments && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Comentários da equipe:</strong><br />
                      {portfolio.admin_comments}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Formulário de upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Petições Autorais</CardTitle>
          <CardDescription>
            Envie 3 petições de sua própria autoria (PDF ou DOC/DOCX, máx. 5MB cada)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arraste seus arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-600">
              PDF, DOC ou DOCX • Máximo 5MB cada • {uploadedFiles.length}/{maxFiles} arquivos
            </p>
          </div>

          {/* Arquivos enviados */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Arquivos Selecionados:</h4>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Campo de descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva brevemente as petições enviadas, áreas de especialização, experiência relevante..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Botão de submissão */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/writer/dashboard')}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploadedFiles.length !== maxFiles || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Portfólio'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>As petições devem ser de sua própria autoria e demonstrar sua capacidade técnica</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Escolha petições de diferentes áreas para mostrar versatilidade</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>A análise leva entre 3 a 5 dias úteis</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Em caso de rejeição, você pode submeter novamente após 30 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}