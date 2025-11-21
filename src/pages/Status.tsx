import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, CheckCircle, AlertTriangle, XCircle, Clock, Server, Database, MessageSquare, Calculator, CreditCard, FileText, Instagram } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function Status() {
  const navigate = useNavigate();

  // Forçar modo claro na página
  useEffect(() => {
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Forçar modo claro
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Forçar variáveis CSS para modo claro
    root.style.setProperty('--background', '0 0% 100%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--foreground', '222.2 84% 4.9%');
    
    // Restaurar tema original ao desmontar
    return () => {
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--foreground');
      root.classList.remove('light');
      if (originalTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  const services = [
    {
      name: "Plataforma Web",
      description: "Interface principal e dashboard",
      status: "operational",
      uptime: "99.9%",
      lastIncident: "Nenhum",
      icon: Server
    },
    {
      name: "Sistema de Petições",
      description: "Processamento e gerenciamento de petições",
      status: "operational",
      uptime: "99.8%",
      lastIncident: "15 dias atrás",
      icon: FileText
    },
    {
      name: "Chat e Comunicação",
      description: "Sistema de mensagens em tempo real",
      status: "operational",
      uptime: "99.7%",
      lastIncident: "Nenhum",
      icon: MessageSquare
    },
    {
      name: "Calculadora Trabalhista",
      description: "Ferramenta de cálculos jurídicos",
      status: "operational",
      uptime: "99.9%",
      lastIncident: "Nenhum",
      icon: Calculator
    },
    {
      name: "Sistema de Pagamentos",
      description: "Processamento de transações financeiras",
      status: "operational",
      uptime: "99.6%",
      lastIncident: "7 dias atrás",
      icon: CreditCard
    },
    {
      name: "Armazenamento de Documentos",
      description: "Upload e gerenciamento de arquivos",
      status: "operational",
      uptime: "99.8%",
      lastIncident: "Nenhum",
      icon: Database
    }
  ];

  const incidents = [
    {
      date: "03 Jan 2024",
      title: "Lentidão no processamento de pagamentos",
      status: "resolved",
      duration: "1h 23min",
      description: "Instabilidade temporária no gateway de pagamentos causou lentidão nas transações.",
      impact: "Baixo"
    },
    {
      date: "28 Dez 2023",
      title: "Manutenção programada - Sistema de petições",
      status: "scheduled",
      duration: "2h 00min",
      description: "Atualização de segurança e otimização de performance.",
      impact: "Médio"
    },
    {
      date: "15 Dez 2023",
      title: "Indisponibilidade parcial do chat",
      status: "resolved",
      duration: "45min",
      description: "Problema na sincronização de mensagens foi corrigido rapidamente.",
      impact: "Baixo"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800">Operacional</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degradado</Badge>;
      case 'outage':
        return <Badge className="bg-red-100 text-red-800">Indisponível</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Programado</Badge>;
      case 'resolved':
        return <Badge className="bg-gray-100 text-gray-800">Resolvido</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>;
    }
  };

  const overallStatus = services.every(service => service.status === 'operational') ? 'operational' : 'degraded';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header - Modo Noturno */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
          {/* Logo e Botões de Login */}
          <div className="flex flex-nowrap items-center justify-between w-full gap-4 mb-6">
            <Logo textColor="light" size="lg" className="shrink-0" />
            <div className="flex flex-nowrap items-center gap-2 shrink-0">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth/login')}
                className="bg-transparent text-white border-gray-600 hover:bg-gray-800 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Cadastrar
              </Button>
            </div>
          </div>

          {/* Botão Voltar */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/central-ajuda')}
            className="mb-4 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Central de Ajuda
          </Button>
          
          {/* Título e Status */}
          <div className="flex items-center gap-6 mb-4">
            <div className="p-4 bg-orange-600 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Status do Sistema
              </h1>
              <p className="text-xl text-gray-300 mt-1">
                Monitoramento em tempo real dos nossos serviços
              </p>
              <div className="flex items-center mt-2">
                {getStatusIcon(overallStatus)}
                <span className={`ml-2 font-medium ${overallStatus === 'operational' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {overallStatus === 'operational' ? 'Todos os sistemas operacionais' : 'Alguns sistemas com problemas'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Overall Status */}
          <Card className="mb-8" style={{ backgroundColor: '#ffffff' }}>
            <CardContent className="p-8" style={{ backgroundColor: '#ffffff' }}>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  overallStatus === 'operational' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {overallStatus === 'operational' ? 
                    <CheckCircle className="w-8 h-8 text-green-500" /> : 
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  }
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {overallStatus === 'operational' ? 'Todos os Sistemas Operacionais' : 'Alguns Sistemas com Problemas'}
                </h2>
                <p className="text-gray-600 mb-4">
                  Última atualização: {new Date().toLocaleString('pt-BR')}
                </p>
                {getStatusBadge(overallStatus)}
              </div>
            </CardContent>
          </Card>

          {/* Services Status */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Status dos Serviços</h2>
            
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow" style={{ backgroundColor: '#ffffff' }}>
                <CardContent className="p-6" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <service.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(service.status)}
                        {getStatusBadge(service.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Uptime: {service.uptime}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Último incidente: {service.lastIncident}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics */}
          <Card className="mb-8" style={{ backgroundColor: '#ffffff' }}>
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent style={{ backgroundColor: '#ffffff' }}>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">99.8%</div>
                  <div className="text-sm text-gray-600">Uptime Geral</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">1.2s</div>
                  <div className="text-sm text-gray-600">Tempo de Resposta</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
                  <div className="text-sm text-gray-600">Incidentes Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Monitoramento</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incident History */}
          <Card className="mb-8" style={{ backgroundColor: '#ffffff' }}>
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Histórico de Incidentes</CardTitle>
              <CardDescription>
                Últimos eventos e manutenções programadas
              </CardDescription>
            </CardHeader>
            <CardContent style={{ backgroundColor: '#ffffff' }}>
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                          {getStatusBadge(incident.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{incident.date}</span>
                          <span>Duração: {incident.duration}</span>
                          <span>Impacto: {incident.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscribe to Updates */}
          <Card style={{ backgroundColor: '#ffffff' }}>
            <CardContent className="p-8 text-center" style={{ backgroundColor: '#ffffff' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Receba Atualizações de Status
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Seja notificado sobre manutenções programadas e incidentes que podem 
                afetar o funcionamento da plataforma.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/contato')}
                >
                  Receber Notificações
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.open('https://www.instagram.com/veredictajus/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  Seguir no Instagram
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}