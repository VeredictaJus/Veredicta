import { useState } from 'react';
import { Bell, BellOff, Filter, Search, FileText, MessageSquare, CreditCard, CheckCircle, Users, TrendingUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';

const iconMap = {
  FileText,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Users,
  TrendingUp,
  Flag
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `Há ${minutes} min`;
  if (hours < 24) return `Há ${hours}h`;
  if (days === 1) return 'Ontem';
  return `Há ${days} dias`;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'user': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    case 'system': return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    case 'payment': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20';
    case 'report': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
    case 'approval': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    case 'chat_report': return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
    default: return 'bg-muted text-muted-foreground border border-border';
  }
};

export default function AdminNotifications() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Get chat reports from localStorage
  const chatReports = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  
  // Mock admin notifications
  const adminNotifications = [
    ...chatReports.map(report => ({
      ...report,
      timestamp: new Date(report.timestamp)
    })),
    {
      id: 'admin1',
      type: 'user',
      title: 'Novo Usuário Cadastrado',
      message: 'Maria Silva se cadastrou como redatora',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      icon: 'Users'
    },
    {
      id: 'admin2', 
      type: 'system',
      title: 'Relatório Mensal Disponível',
      message: 'Relatório de performance de Janeiro está pronto',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      icon: 'TrendingUp'
    }
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredNotifications = adminNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase()) ||
                         notification.message.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         (filter === notification.type);
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (id: string) => {
    // In real implementation, this would mark admin notification as read
    console.log('Marking admin notification as read:', id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-7 w-7" />
            Notificações Administrativas
            {filteredNotifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {filteredNotifications.filter(n => !n.read).length}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Monitore atividades do sistema e aprovações pendentes</p>
        </div>
        {filteredNotifications.filter(n => !n.read).length > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Marcar todas como lidas
          </Button>
        )}
      </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar notificações..."
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
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
              <SelectItem value="user">Usuários</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
              <SelectItem value="payment">Pagamentos</SelectItem>
              <SelectItem value="report">Relatórios</SelectItem>
              <SelectItem value="chat_report">Denúncias de Chat</SelectItem>
              <SelectItem value="approval">Aprovações</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de notificações */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const IconComponent = iconMap[notification.icon as keyof typeof iconMap] || FileText;
              
              return (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    !notification.read ? 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/30 dark:border-l-orange-400' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className={`w-12 h-12 ${getTypeColor(notification.type)}`}>
                        <AvatarFallback className={getTypeColor(notification.type)}>
                          <IconComponent className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full">
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BellOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {search || filter !== 'all' ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação no momento'}
                </h3>
                <p className="text-muted-foreground">
                  {search || filter !== 'all' 
                    ? 'Tente ajustar os filtros ou termos de busca'
                    : 'Sistema funcionando normalmente - sem alertas pendentes'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}