import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, CheckCircle, AlertTriangle, XCircle, Clock, Server, Database, MessageSquare, Calculator, CreditCard, FileText, Instagram } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS } from '@/styles/marketing';

export default function Status() {
  const navigate = useNavigate();

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
        return <Badge className="bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">Operacional</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500/15 text-yellow-200 border border-yellow-500/25">Degradado</Badge>;
      case 'outage':
        return <Badge className="bg-red-500/15 text-red-200 border border-red-500/25">Indisponível</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/15 text-blue-200 border border-blue-500/25">Programado</Badge>;
      case 'resolved':
        return <Badge className="bg-white/10 text-slate-200 border border-white/10">Resolvido</Badge>;
      default:
        return <Badge className="bg-white/10 text-slate-200 border border-white/10">Desconhecido</Badge>;
    }
  };

  const overallStatus = services.every(service => service.status === 'operational') ? 'operational' : 'degraded';

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <section className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-10 max-w-screen-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/central-ajuda')}
            className="mb-6 text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Central de Ajuda
          </Button>

          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-500/15 border border-orange-500/25 rounded-xl">
              <Activity className="w-8 h-8 text-orange-300" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Status do Sistema</h1>
              <p className="text-lg text-slate-300 mt-2">Monitoramento em tempo real dos nossos serviços</p>
              <div className="flex items-center mt-3">
                {getStatusIcon(overallStatus)}
                <span className={`ml-2 font-medium ${overallStatus === 'operational' ? 'text-emerald-300' : 'text-yellow-300'}`}>
                  {overallStatus === 'operational' ? 'Todos os sistemas operacionais' : 'Alguns sistemas com problemas'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Overall Status */}
          <Card className={[MARKETING_CARD_CLASS, 'mb-8'].join(' ')}>
            <CardContent className="p-8">
              <div className="text-center">
                <div
                  className={[
                    'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ring-1',
                    overallStatus === 'operational'
                      ? 'bg-emerald-500/15 ring-emerald-500/25'
                      : 'bg-yellow-500/15 ring-yellow-500/25',
                  ].join(' ')}
                >
                  {overallStatus === 'operational' ? 
                    <CheckCircle className="w-8 h-8 text-emerald-300" /> : 
                    <AlertTriangle className="w-8 h-8 text-yellow-300" />
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
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                        <service.icon className="w-6 h-6 text-orange-300" />
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
          <Card className={[MARKETING_CARD_CLASS, 'mb-8'].join(' ')}>
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card className={[MARKETING_CARD_CLASS, 'mb-8'].join(' ')}>
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Histórico de Incidentes</CardTitle>
              <CardDescription>
                Últimos eventos e manutenções programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div key={index} className="border-l-2 border-white/10 pl-4 py-3">
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
          <Card className={MARKETING_CARD_CLASS}>
            <CardContent className="p-8 text-center">
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
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
                  onClick={() => navigate('/contato')}
                >
                  Receber Notificações
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.open('https://www.instagram.com/veredictajus/', '_blank')}
                  className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 bg-transparent"
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