import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Filter, Eye, MessageSquare } from 'lucide-react';
import { useChatAPI } from '@/hooks/useChatAPI';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportDetailsModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: string, notes?: string) => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const [newStatus, setNewStatus] = useState(report?.status || 'pending');
  const [adminNotes, setAdminNotes] = useState(report?.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(newStatus, adminNotes.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!report) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Detalhes do Relatório
          </DialogTitle>
          <DialogDescription>
            Analise e tome ação sobre este relatório de conteúdo inadequado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className={`mt-1 ${getStatusColor(report.status)}`}>
                    {report.status === 'pending' && 'Pendente'}
                    {report.status === 'reviewed' && 'Analisado'}
                    {report.status === 'resolved' && 'Resolvido'}
                    {report.status === 'dismissed' && 'Dispensado'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data do Relatório</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDistanceToNow(new Date(report.timestamp), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Motivo</label>
                <p className="text-sm text-gray-900 mt-1">
                  {report.reason === 'harassment' && 'Assédio ou Bullying'}
                  {report.reason === 'inappropriate' && 'Linguagem Inapropriada'}
                  {report.reason === 'spam' && 'Spam ou Conteúdo Repetitivo'}
                  {report.reason === 'discrimination' && 'Discriminação'}
                  {report.reason === 'inappropriate_content' && 'Conteúdo Inadequado'}
                </p>
              </div>

              {report.details && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Detalhes Adicionais</label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded border">
                    {report.details}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tomar Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Novo Status
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewed">Analisado</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="dismissed">Dispensado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Notas Administrativas
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas sobre a ação tomada..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EnhancedChatReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { loadReports, updateReportStatus } = useChatAPI({
    conversationId: 'admin',
    userId: 'admin-user'
  });

  // Load reports on mount
  useEffect(() => {
    const loadInitialReports = async () => {
      setIsLoading(true);
      try {
        await loadReports();
        // For demo purposes, load from localStorage
        const storedReports = JSON.parse(localStorage.getItem('chat_reports') || '[]');
        setReports(storedReports);
        setFilteredReports(storedReports);
      } catch (error) {
        console.error('Error loading reports:', error);
        toast({
          title: "Erro ao carregar relatórios",
          description: "Não foi possível carregar os relatórios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialReports();
  }, [loadReports, toast]);

  // Filter reports
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportedUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (reasonFilter !== 'all') {
      filtered = filtered.filter(report => report.reason === reasonFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, reasonFilter]);

  const handleUpdateReportStatus = async (status: string, notes?: string) => {
    if (!selectedReport) return;

    try {
      await updateReportStatus(selectedReport.id, status, notes);
      
      // Update local state
      const updatedReports = reports.map(report =>
        report.id === selectedReport.id
          ? {
              ...report,
              status,
              adminNotes: notes,
              reviewedBy: 'Admin User',
              reviewedAt: new Date()
            }
          : report
      );
      
      setReports(updatedReports);
      
      // Update localStorage for demo
      localStorage.setItem('chat_reports', JSON.stringify(updatedReports));
      
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'dismissed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando relatórios...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios de Chat</h1>
        <p className="text-gray-600">Gerencie relatórios de conteúdo inadequado no sistema de chat</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{reviewedCount}</p>
                <p className="text-sm text-gray-600">Analisados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                <p className="text-sm text-gray-600">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por usuário ou motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="reviewed">Analisado</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="dismissed">Dispensado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Motivos</SelectItem>
                <SelectItem value="harassment">Assédio</SelectItem>
                <SelectItem value="inappropriate">Linguagem Inapropriada</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="discrimination">Discriminação</SelectItem>
                <SelectItem value="inappropriate_content">Conteúdo Inadequado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios ({filteredReports.length})</CardTitle>
          <CardDescription>
            Lista de todos os relatórios de mensagens reportadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum relatório encontrado</p>
              <p className="text-sm">Não há relatórios que correspondam aos filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1">
                          {report.status === 'pending' && 'Pendente'}
                          {report.status === 'reviewed' && 'Analisado'}
                          {report.status === 'resolved' && 'Resolvido'}
                          {report.status === 'dismissed' && 'Dispensado'}
                        </span>
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.reporterName} reportou {report.reportedUserName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Motivo: {report.reason} • {formatDistanceToNow(new Date(report.timestamp), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateReportStatus}
        />
      )}
    </div>
  );
};