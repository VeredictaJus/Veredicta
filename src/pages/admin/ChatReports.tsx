import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Flag, 
  Eye, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  MessageSquare, 
  Zap, 
  Users, 
  FileX,
  Search,
  Filter,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout/Layout';

interface ChatReport {
  id: string;
  type: 'chat_report';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  reportData: {
    messageId: string;
    reason: string;
    details?: string;
    reportedBy: string;
    reportedUser: string;
    reportedUserName: string;
    conversationId: string;
    messageContent: string;
    messageTimestamp: string;
  };
}

const reasonLabels = {
  harassment: 'Assédio ou Bullying',
  inappropriate: 'Linguagem Inapropriada',
  spam: 'Spam ou Conteúdo Repetitivo',
  discrimination: 'Discriminação',
  inappropriate_content: 'Conteúdo Inadequado'
};

const reasonIcons = {
  harassment: AlertTriangle,
  inappropriate: MessageSquare,
  spam: Zap,
  discrimination: Users,
  inappropriate_content: FileX
};

const reasonColors = {
  harassment: 'text-red-600 bg-red-50',
  inappropriate: 'text-orange-600 bg-orange-50',
  spam: 'text-yellow-600 bg-yellow-50',
  discrimination: 'text-purple-600 bg-purple-50',
  inappropriate_content: 'text-pink-600 bg-pink-50'
};

export default function ChatReports() {
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ChatReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  // Load reports from localStorage
  useEffect(() => {
    const chatReports = JSON.parse(localStorage.getItem('admin_notifications') || '[]')
      .filter((notif: any) => notif.type === 'chat_report');
    setReports(chatReports);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase()) ||
                         report.message.toLowerCase().includes(search.toLowerCase()) ||
                         report.reportData.reportedUserName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && !report.read) ||
                         (filter === 'reviewed' && report.read) ||
                         (filter === report.reportData.reason);
    return matchesSearch && matchesFilter;
  });

  const handleViewReport = (report: ChatReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
    setActionNotes('');
  };

  const handleTakeAction = async (action: 'dismiss' | 'warn' | 'suspend') => {
    if (!selectedReport) return;

    // Mark as read and update localStorage
    const updatedReports = reports.map(report => 
      report.id === selectedReport.id 
        ? { ...report, read: true }
        : report
    );
    setReports(updatedReports);
    
    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const updatedNotifications = allNotifications.map((notif: any) => 
      notif.id === selectedReport.id 
        ? { ...notif, read: true }
        : notif
    );
    localStorage.setItem('admin_notifications', JSON.stringify(updatedNotifications));

    // Simulate action processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    let actionMessage = '';
    switch (action) {
      case 'dismiss':
        actionMessage = 'Relatório foi dispensado e arquivado.';
        break;
      case 'warn':
        actionMessage = 'Aviso foi enviado ao usuário relatado.';
        break;
      case 'suspend':
        actionMessage = 'Usuário foi suspenso temporariamente.';
        break;
    }

    toast({
      title: "Ação executada",
      description: actionMessage,
    });

    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const getReasonIcon = (reason: string) => {
    const IconComponent = reasonIcons[reason as keyof typeof reasonIcons] || Flag;
    return IconComponent;
  };

  const getReasonColor = (reason: string) => {
    return reasonColors[reason as keyof typeof reasonColors] || 'text-gray-600 bg-gray-50';
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Flag className="h-7 w-7 text-red-600" />
              Relatórios de Chat
              {filteredReports.filter(r => !r.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {filteredReports.filter(r => !r.read).length}
                </Badge>
              )}
            </h1>
            <p className="text-gray-600">Gerencie denúncias e moderação de mensagens do chat</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar relatórios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="reviewed">Revisados</SelectItem>
              <SelectItem value="harassment">Assédio</SelectItem>
              <SelectItem value="inappropriate">Linguagem Inapropriada</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
              <SelectItem value="discrimination">Discriminação</SelectItem>
              <SelectItem value="inappropriate_content">Conteúdo Inadequado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de relatórios */}
        <div className="space-y-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => {
              const ReasonIcon = getReasonIcon(report.reportData.reason);
              
              return (
                <Card 
                  key={report.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    !report.read ? 'border-l-4 border-l-red-500 bg-red-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getReasonColor(report.reportData.reason)}`}>
                          <ReasonIcon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-sm font-medium ${!report.read ? 'font-semibold' : ''}`}>
                              {report.title}
                            </h3>
                            {!report.read && (
                              <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full">
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {reasonLabels[report.reportData.reason as keyof typeof reasonLabels]}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {report.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Usuário: {report.reportData.reportedUserName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(report.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                            <strong>Mensagem reportada:</strong> "{report.reportData.messageContent.substring(0, 100)}..."
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Analisar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {search || filter !== 'all' ? 'Nenhum relatório encontrado' : 'Nenhum relatório de chat'}
                </h3>
                <p className="text-gray-500">
                  {search || filter !== 'all' 
                    ? 'Tente ajustar os filtros ou termos de busca'
                    : 'Sistema funcionando normalmente - sem denúncias pendentes'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de detalhes do relatório */}
        {showDetailModal && selectedReport && (
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Análise de Relatório de Chat
                </DialogTitle>
                <DialogDescription>
                  Revise os detalhes e tome as ações necessárias para manter a segurança da plataforma.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informações do relatório */}
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flag className="h-5 w-5 text-red-600" />
                      Informações do Relatório
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Motivo:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {React.createElement(getReasonIcon(selectedReport.reportData.reason), { 
                            className: `h-4 w-4 ${getReasonColor(selectedReport.reportData.reason).split(' ')[0]}` 
                          })}
                          <span className="text-sm font-medium">
                            {reasonLabels[selectedReport.reportData.reason as keyof typeof reasonLabels]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Data do relatório:</span>
                        <p className="text-sm">{new Date(selectedReport.timestamp).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Reportado por:</span>
                        <p className="text-sm">{selectedReport.reportData.reportedBy.includes('client') ? 'Cliente' : 'Redator'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">usuário relatado:</span>
                        <p className="text-sm font-medium text-red-700">{selectedReport.reportData.reportedUserName}</p>
                      </div>
                    </div>
                    
                    {selectedReport.reportData.details && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Detalhes adicionais:</span>
                        <p className="text-sm mt-1 p-2 bg-white rounded border">
                          {selectedReport.reportData.details}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mensagem reportada */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Mensagem Reportada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {selectedReport.reportData.reportedUserName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {selectedReport.reportData.reportedUserName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(selectedReport.reportData.messageTimestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm">{selectedReport.reportData.messageContent}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações de moderação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ações de Moderação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Notas da análise (opcional):
                        </label>
                        <Textarea
                          placeholder="Adicione suas observações sobre este caso..."
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleTakeAction('dismiss')}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Dispensar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleTakeAction('warn')}
                          className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Avisar Usuário
                        </Button>
                        <Button
                          onClick={() => handleTakeAction('suspend')}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Suspender
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}