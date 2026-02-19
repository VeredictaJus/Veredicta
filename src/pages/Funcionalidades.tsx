import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calculator, 
  MessageSquare, 
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  BarChart3,
  Star,
  FileCheck,
  Bell,
  TrendingUp,
  Lock,
  Cloud,
  Award,
  Target,
  Settings,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';
import MarketingHero from '@/components/Marketing/MarketingHero';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, MARKETING_SECTION_ALT_CLASS, MARKETING_SECTION_CLASS } from '@/styles/marketing';

export default function Funcionalidades() {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: FileText,
      title: 'Redação de Petições Profissionais',
      description: 'Sistema completo de solicitação, atribuição e entrega de petições jurídicas de alta qualidade.',
      benefits: [
        'Redatores certificados e aprovados',
        'Entrega garantida dentro do prazo',
        'Sistema de revisão e correções ilimitadas',
        'Suporte a múltiplos tipos de petições',
        'Acompanhamento em tempo real do status'
      ],
      details: [
        'Upload de documentos e anexos',
        'Especificação de requisitos detalhados',
        'Comunicação direta com o redator',
        'Histórico completo de versões',
        'Download em múltiplos formatos'
      ]
    },
    {
      icon: Calculator,
      title: 'Calculadora Trabalhista Avançada',
      description: 'Ferramenta automatizada para cálculos trabalhistas precisos com legislação sempre atualizada.',
      benefits: [
        'Cálculos automatizados e precisos',
        'Legislação atualizada automaticamente',
        'Relatórios detalhados em PDF',
        'Histórico de cálculos salvos',
        'Exportação para Excel e PDF'
      ],
      details: [
        'Cálculo de verbas rescisórias',
        'Férias proporcionais e vencidas',
        '13º salário proporcional',
        'FGTS e multa de 40%',
        'INSS e IRRF'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Chat Integrado e Inteligente',
      description: 'Comunicação direta e segura entre clientes e redatores com controle automático de acesso.',
      benefits: [
        'Comunicação em tempo real',
        'Histórico completo de conversas',
        'Controle automático de acesso por petição',
        'Notificações push e por email',
        'Arquivos e anexos compartilhados'
      ],
      details: [
        'Chat ativo apenas durante petição atribuída',
        'Mensagens criptografadas',
        'Busca no histórico de conversas',
        'Indicadores de leitura',
        'Suporte a múltiplas conversas simultâneas'
      ]
    },
    {
      icon: Users,
      title: 'Gestão Completa de Redatores',
      description: 'Sistema robusto de aprovação, monitoramento e avaliação de performance dos redatores.',
      benefits: [
        'Processo de aprovação rigoroso',
        'Sistema de penalidades e suspensões',
        'Avaliação de qualidade por petição',
        'Dashboard de performance',
        'Ranking e métricas detalhadas'
      ],
      details: [
        'Aprovação manual por administradores',
        'Sistema de penalidades por atraso',
        'Multas automáticas por declínio',
        'Suspensão progressiva por infrações',
        'Relatórios de produtividade'
      ]
    },
    {
      icon: Shield,
      title: 'Segurança e Conformidade LGPD',
      description: 'Proteção total dos dados com criptografia de ponta a ponta e conformidade legal.',
      benefits: [
        'Criptografia SSL/TLS',
        'Backup automático diário',
        'Conformidade total com LGPD',
        'Auditoria de acessos',
        'Política de privacidade transparente'
      ],
      details: [
        'Dados armazenados em servidores seguros',
        'Acesso restrito por permissões',
        'Logs de auditoria completos',
        'Exclusão de dados sob demanda',
        'Certificações de segurança'
      ]
    },
    {
      icon: Clock,
      title: 'Gestão Inteligente de Prazos',
      description: 'Controle automático de prazos com alertas, notificações e sistema de penalidades.',
      benefits: [
        'Cálculo automático de deadlines',
        'Alertas proativos antes do prazo',
        'Sistema de tolerância configurável',
        'Penalidades automáticas por atraso',
        'Histórico de prazos e entregas'
      ],
      details: [
        'Deadline baseado em dias úteis',
        'Notificações 1h antes do prazo',
        'Tolerância de 1h após deadline',
        'Multa progressiva por atraso',
        'Reatribuição automática se necessário'
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Star,
      title: 'Sistema de Avaliações',
      description: 'Avalie a qualidade das petições recebidas e contribua para o ranking dos redatores.',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      style: { backgroundColor: '#fef3c7', color: '#b45309' }
    },
    {
      icon: BarChart3,
      title: 'Dashboard e Relatórios',
      description: 'Acompanhe estatísticas detalhadas de uso, performance e produtividade.',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      style: { backgroundColor: '#ffedd5', color: '#c2410c' }
    },
    {
      icon: DollarSign,
      title: 'Gestão de Pagamentos',
      description: 'Sistema integrado de pagamentos com controle de faturas e histórico completo.',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      style: { backgroundColor: '#d1fae5', color: '#047857' }
    },
    {
      icon: FileCheck,
      title: 'Revisão Humana Opcional',
      description: 'Solicite revisão por corretor humano antes de enviar ao cliente.',
      bgColor: 'bg-violet-100',
      textColor: 'text-violet-700',
      style: { backgroundColor: '#ede9fe', color: '#6d28d9' }
    },
    {
      icon: Bell,
      title: 'Notificações Inteligentes',
      description: 'Receba alertas sobre status de petições, prazos e mensagens importantes.',
      bgColor: 'bg-orange-200',
      textColor: 'text-orange-800',
      style: { backgroundColor: '#fed7aa', color: '#9a3412' }
    },
    {
      icon: Search,
      title: 'Busca Avançada',
      description: 'Encontre petições rapidamente com filtros por status, data, tipo e redator.',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      style: { backgroundColor: '#dbeafe', color: '#1d4ed8' }
    },
    {
      icon: Download,
      title: 'Exportação de Dados',
      description: 'Exporte petições, relatórios e cálculos em múltiplos formatos.',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-700',
      style: { backgroundColor: '#cffafe', color: '#0e7490' }
    },
    {
      icon: Settings,
      title: 'Personalização',
      description: 'Configure preferências, notificações e integrações conforme sua necessidade.',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      style: { backgroundColor: '#f1f5f9', color: '#334155' }
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: 'Solicite sua Petição',
      description: 'Preencha o formulário com os detalhes da petição, anexe documentos e defina prioridade.',
      icon: Upload
    },
    {
      step: 2,
      title: 'Atribuição Automática',
      description: 'Nossa plataforma atribui automaticamente a petição ao redator mais qualificado disponível.',
      icon: Zap
    },
    {
      step: 3,
      title: 'Acompanhamento em Tempo Real',
      description: 'Acompanhe o progresso, comunique-se com o redator e receba atualizações instantâneas.',
      icon: Eye
    },
    {
      step: 4,
      title: 'Revisão e Aprovação',
      description: 'Revise a petição entregue, solicite correções se necessário e aprove quando estiver satisfeito.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>

      {/* Hero Section */}
      <MarketingHero
        eyebrow="Plataforma"
        title={
          <>
            Funcionalidades <br />
            <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Completas
            </span>
          </>
        }
        subtitle={
          <>
            Descubra as ferramentas que estruturam a produção jurídica do seu escritório.
            <br />
            Tudo com padrão técnico, previsibilidade e controle.
          </>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.18)] px-8 py-6 text-lg font-semibold"
            onClick={() => navigate('/auth/register')}
          >
            Começar agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent px-8 py-6 text-lg font-semibold"
            onClick={() => navigate('/precos')}
          >
            Ver planos e preços
          </Button>
        </div>
      </MarketingHero>

      {/* Main Features Grid */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar suas petições jurídicas de forma profissional e eficiente.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-orange-300" />
                  </div>
                  <CardTitle className="text-2xl mb-2 text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-300 text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                        Benefícios
                      </h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center">
                        <Zap className="w-4 h-4 text-orange-300 mr-2" />
                        Recursos
                      </h4>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Processo simples e eficiente em apenas 4 passos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-6'].join(' ')}>
                  <div className="flex items-center justify-center w-16 h-16 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full text-2xl font-bold mb-4 mx-auto">
                    {step.step}
                  </div>
                  <div className="text-center mb-4">
                    <step.icon className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-300">{step.description}</p>
                  </div>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-orange-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Recursos Adicionais
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Mais funcionalidades para tornar sua experiência ainda melhor
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-orange-500/15 ring-1 ring-orange-400/30">
                    <feature.icon className="w-6 h-6 text-orange-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Por que escolher a Veredicta?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-8 text-center'].join(' ')}>
              <Award className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-3">Qualidade Garantida</h3>
              <p className="text-slate-300">
                Redatores certificados e aprovados, com processo rigoroso de seleção e avaliação contínua.
              </p>
            </div>
            
            <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-8 text-center'].join(' ')}>
              <TrendingUp className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-3">Eficiência Máxima</h3>
              <p className="text-slate-300">
                Processo automatizado que reduz tempo de espera e aumenta a produtividade do seu escritório.
              </p>
            </div>
            
            <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-8 text-center'].join(' ')}>
              <Lock className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-3">Segurança Total</h3>
              <p className="text-slate-300">
                Seus dados protegidos com criptografia de ponta a ponta e conformidade total com LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 bg-slate-950">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(249,115,22,0.14),transparent_60%)]" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
            Pronto para estruturar sua produção?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Junte-se a escritórios que operam com previsibilidade e padrão técnico na produção de peças.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-6 text-lg font-semibold shadow-[0_10px_30px_rgba(249,115,22,0.18)]"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar-se
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent px-8 py-6 text-lg font-semibold"
              onClick={() => navigate('/solicitar-demonstracao')}
            >
              Solicitar demonstração
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
