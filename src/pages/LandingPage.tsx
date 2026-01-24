import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Users, 
  FileText, 
  Clock, 
  Star,
  ArrowRight,
  Scale,
  Shield,
  Zap,
  Trophy,
  Calculator,
  BookOpen,
  Target,
  Briefcase,
  Home,
  Car,
  Factory,
  Heart,
  Globe,
  Leaf
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCurrentYear } from '@/utils/dateUtils';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');

  // Forçar modo claro na landing page
  useEffect(() => {
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Forçar modo claro
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Cleanup: restaurar tema original quando sair da página
    return () => {
      root.classList.remove('light');
      if (originalTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  // Função para lidar com assinatura de planos
  const handleSubscribe = async (planName: string) => {
    console.log('🔍 LandingPage.tsx - handleSubscribe CHAMADO com planName:', planName);
    try {
      // Mapear nomes dos planos para identificadores
      const planMap: { [key: string]: string } = {
        'Free': 'free',
        'Start': 'start',
        'Pro': 'pro', 
        'Elite': 'elite'
      };

      const planId = planMap[planName];
      if (!planId) {
        toast.error('Plano não encontrado');
        return;
      }

      if (planId === 'free') {
        // FREE: cadastro normal
        navigate('/auth/register');
      } else {
        // Planos pagos: cadastro com plano desejado
        const encodedPlan = encodeURIComponent(planId);
        const url = `/auth/register?plan=${encodedPlan}`;
        console.log('🔍 LandingPage.tsx - Navegando para:', url);
        console.log('🔍 LandingPage.tsx - planId:', planId);
        console.log('🔍 LandingPage.tsx - encodedPlan:', encodedPlan);
        navigate(url);
      }
      
    } catch (error) {
      console.error('Erro ao processar assinatura:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'Petições Profissionais',
      description: 'Redatores especializados em todas as áreas jurídicas'
    },
    {
      icon: Shield,
      title: 'Revisão por Corretor',
      description: 'Todas as petições passam por correção especializada antes da entrega'
    },
    {
      icon: Calculator,
      title: 'Calculadora Trabalhista',
      description: 'Ferramenta integrada para cálculos trabalhistas precisos'
    },
    {
      icon: Clock,
      title: 'Entrega Rápida',
      description: 'Prazos garantidos com qualidade assegurada'
    }
  ];

  const legalAreas = [
    {
      name: 'Direito Civil',
      icon: Scale,
      color: 'bg-blue-100 text-blue-800',
      description: 'Contratos, responsabilidade civil, direitos reais',
      examples: ['Ação de cobrança', 'Usucapião', 'Indenização por danos']
    },
    {
      name: 'Direito Trabalhista',
      icon: Briefcase,
      color: 'bg-green-100 text-green-800',
      description: 'Relações de trabalho, direitos do trabalhador',
      examples: ['Horas extras', 'Rescisão indireta', 'Adicional insalubridade']
    },
    {
      name: 'Direito Penal',
      icon: Shield,
      color: 'bg-red-100 text-red-800',
      description: 'Defesa criminal, recursos, habeas corpus',
      examples: ['Recurso em sentido estrito', 'Habeas corpus', 'Defesa prévia']
    },
    {
      name: 'Direito Tributário',
      icon: Calculator,
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Questões fiscais, impostos, contribuições',
      examples: ['Restituição IR', 'Parcelamento fiscal', 'Mandado de segurança']
    },
    {
      name: 'Direito Administrativo',
      icon: FileText,
      color: 'bg-purple-100 text-purple-800',
      description: 'Relação com poder público, servidores',
      examples: ['Concurso público', 'Aposentadoria', 'Licenças e alvarás']
    },
    {
      name: 'Direito de Família',
      icon: Heart,
      color: 'bg-pink-100 text-pink-800',
      description: 'Divórcio, guarda, pensão alimentícia',
      examples: ['Divórcio consensual', 'Guarda compartilhada', 'Pensão alimentícia']
    },
    {
      name: 'Direito Empresarial',
      icon: Factory,
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Sociedades, contratos comerciais, falência',
      examples: ['Recuperação judicial', 'Dissolução sociedade', 'Contratos comerciais']
    },
    {
      name: 'Direito do Consumidor',
      icon: Users,
      color: 'bg-orange-100 text-orange-800',
      description: 'Defesa do consumidor, CDC, recall',
      examples: ['Danos morais CDC', 'Vício produto', 'Revisão contrato']
    },
    {
      name: 'Direito Previdenciário',
      icon: Clock,
      color: 'bg-gray-100 text-gray-800',
      description: 'Benefícios INSS, aposentadorias, pensões',
      examples: ['Aposentadoria rural', 'Auxílio-doença', 'Revisão de benefício']
    },
    {
      name: 'Direito Ambiental',
      icon: Leaf,
      color: 'bg-emerald-100 text-emerald-800',
      description: 'Licenças ambientais, crimes ambientais',
      examples: ['TAC ambiental', 'Licenciamento', 'Compensação ambiental']
    },
    {
      name: 'Direito Imobiliário',
      icon: Home,
      color: 'bg-teal-100 text-teal-800',
      description: 'Compra, venda, locação, regularização',
      examples: ['Escritura pública', 'Ação despejo', 'Usucapião urbano']
    },
    {
      name: 'Direito Digital',
      icon: Globe,
      color: 'bg-cyan-100 text-cyan-800',
      description: 'LGPD, crimes virtuais, contratos digitais',
      examples: ['LGPD compliance', 'Direito ao esquecimento', 'Contratos online']
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Solicite',
      description: 'Descreva sua necessidade jurídica com detalhes',
      icon: FileText
    },
    {
      step: '2', 
      title: 'Redator Especializado',
      description: 'Profissional qualificado aceita sua demanda',
      icon: Users
    },
    {
      step: '3',
      title: 'Correção Especializada',
      description: 'Corretor especializado revisa e aprimora a petição',
      icon: CheckCircle
    },
    {
      step: '4',
      title: 'Receba',
      description: 'Petição pronta e aprovada em sua conta',
      icon: Trophy
    }
  ];

  const plans = [
    {
      name: 'Free',
      displayName: 'Free',
      price: 'Gratuito',
      period: '',
      petitions: '1 petição',
      creditPrice: '',
      badge: 'Gratuito',
      badgeColor: 'bg-green-500',
      warning: 'Uma vez por CPF ou CNPJ',
      features: [
        '1 petição gratuita',
        'Entrega em 3-5 dias úteis',
        '1 revisão gratuita',
        'Consulta com redator e chat incluso',
        'Confidencialidade garantida (NDA)'
      ]
    },
    {
      name: 'Start',
      displayName: 'Start',
      price: 'R$ 520',
      period: '/mês',
      petitions: '4 petições',
      creditPrice: 'R$ 130,00',
      features: [
        '4 petições incluídas',
        'Até 3 dias úteis por entrega',
        '1 revisão gratuita no pacote',
        'Consulta com redator e chat incluso',
        'Validade: 30 dias',
        'Confidencialidade garantida (NDA)'
      ]
    },
    {
      name: 'Pro',
      displayName: 'Pro',
      price: 'R$ 1.680',
      period: 'a cada 60 dias',
      petitions: '14 petições',
      creditPrice: 'R$ 120,00',
      badge: 'Mais Popular',
      badgeColor: 'bg-blue-500',
      savings: 'Economia de R$ 10,00 por petição',
      features: [
        '14 petições incluídas',
        'Entregas em até 2 dias úteis',
        '1 revisão gratuita por petição',
        'Consulta com redator e chat incluso',
        '+1 petição bônus na renovação',
        'Validade: 60 dias',
        'Confidencialidade garantida (NDA)'
      ]
    },
    {
      name: 'Elite',
      displayName: 'Elite',
      price: 'R$ 7.000',
      period: 'a cada 90 dias',
      petitions: '70 petições',
      creditPrice: 'R$ 100,00',
      savings: 'Melhor custo-benefício: R$ 100,00 por petição',
      features: [
        '70 petições incluídas',
        'Entrega em até 1 dia útil (prioridade máxima)',
        '1 revisão gratuita por petição',
        'Revisão extra por advogado sênior (opcional)',
        'Consulta direta com redator via plataforma',
        '+3 petições bônus na renovação',
        'Acesso antecipado a novos recursos',
        'Validade: 90 dias',
        'Confidencialidade garantida (NDA)'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Ricardo Almeida',
      role: 'Advogado Trabalhista - Belo Horizonte/MG',
      avatar: '/avatars/ricardo-almeida.jpeg',
      content: 'Uso a Veredicta há 8 meses e já solicitei mais de 40 petições. A qualidade é excelente e os prazos sempre cumpridos. Consegui aumentar minha carteira de clientes em 60% sem perder a qualidade do atendimento.',
      rating: 5
    },
    {
      name: 'Patrícia Costa',
      role: 'Sócia - Escritório Costa & Associados',
      avatar: '/avatars/patricia-costa.jpeg',
      content: 'Nossa equipe de 5 advogados usa a plataforma regularmente. Economizamos cerca de 15 horas por semana que antes eram gastas na redação de petições. Os clientes elogiam a qualidade técnica e a argumentação jurídica.',
      rating: 5
    },
    {
      name: 'Fernando Rodrigues',
      role: 'Redator Jurídico Especializado',
      avatar: '/avatars/fernando-rodrigues.jpeg',
      content: 'Trabalho como redator há 1 ano na plataforma. A flexibilidade de horários me permite conciliar com minha advocacia e ainda tenho uma renda complementar estável. Os valores são justos e o sistema de pagamento é confiável.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-4">
          <div className="flex flex-nowrap items-center justify-between w-full gap-2">
            <div className="flex items-center shrink-0">
              <Logo size="xl" clickable={false} textColor="light" />
            </div>
            <div className="flex flex-nowrap items-center gap-2 shrink-0 ml-auto">
              <Button 
                variant="outline" 
                className="bg-white text-slate-900 border-gray-300 hover:bg-gray-100 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/login')}
              >
                Entrar
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/register')}
              >
                Cadastrar-se
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Mais peças. Menos horas. Com inteligência humana.
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Delegue a redação jurídica a especialistas humanos e foque no que só o advogado pode fazer.
              <br />
              Produza mais, com qualidade técnica e previsibilidade — sem contratar, sem treinar, sem sobrecarregar seu escritório.
            </p>
            
            {/* Para quem é a Veredicta */}
            <div className="mt-10 bg-slate-900/70 border border-white/10 rounded-2xl p-6 md:p-8 text-left max-w-3xl mx-auto shadow-xl backdrop-blur">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-2">
                <Target className="h-6 w-6 text-orange-400" />
                Para quem é a Veredicta
              </h2>

              <p className="text-slate-200 mb-4">
                A Veredicta é para escritórios que já têm demanda, mas não querem crescer no caos.
              </p>

              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Escritórios pequenos com alto volume</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Escritórios médios e grandes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Contencioso recorrente e prazos apertados</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-white font-semibold">
                  Se escrever peças está consumindo o tempo do advogado, você está no lugar certo.
                </p>

                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold whitespace-nowrap"
                  onClick={() => navigate('/auth/register')}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                variant="outline" 
                size="lg"
                className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-white"
                onClick={() => navigate('/auth/login')}
              >
                Fazer Login
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white text-orange-600 border-orange-600 hover:bg-orange-50"
                onClick={() => navigate('/manual-redator')}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Manual do Redator
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Por que a Veredicta não é automação jurídica */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Por que a Veredicta não é automação jurídica
              </h2>
              <p className="text-lg text-gray-600">
                Aqui você delega a redação com segurança: contexto, técnica e responsabilidade — com inteligência humana aplicada à rotina jurídica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">O que não é</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <span>Não é IA</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <span>Não é banco de modelos</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <span>Não é automação genérica</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <span>Não é texto sem responsabilidade jurídica</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">O que é</h3>
                <p className="text-gray-700 mb-4">
                  Inteligência humana aplicada à rotina jurídica.
                </p>
                <p className="text-gray-700">
                  Na Veredicta, você delega a redação das suas peças a redatores jurídicos especializados, que trabalham com contexto, técnica, responsabilidade e jurisprudência adequada — algo que ferramentas automáticas ainda não entregam com segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Todas as Áreas do Direito */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todas as Áreas do Direito
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma conecta você com redatores especializados em todas as áreas jurídicas, 
              garantindo expertise específica para cada tipo de petição.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {legalAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 hover:border-orange-200">
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 rounded-full ${area.color} flex items-center justify-center mb-3 mx-auto`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {area.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm text-center mb-4">
                    {area.description}
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 text-center mb-2">
                      Exemplos de petições:
                    </p>
                    {area.examples.map((example, idx) => (
                      <div key={idx} className="text-xs text-center text-gray-500">
                        • {example}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Destaque adicional */}
          <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center border border-orange-500/20 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              Não encontrou sua área?
            </h3>
            <p className="text-slate-200 text-lg mb-6">
              Trabalhamos com todas as especialidades jurídicas. Entre em contato e 
              encontraremos o redator especializado para seu caso específico.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center text-slate-100">
                <div className="bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full p-2 mr-3">
                  <Globe className="h-6 w-6 text-orange-300" />
                </div>
                <span className="font-medium">Cobertura Nacional</span>
              </div>
              <div className="flex items-center text-slate-100">
                <div className="bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full p-2 mr-3">
                  <Users className="h-6 w-6 text-orange-300" />
                </div>
                <span className="font-medium">Redatores Especializados</span>
              </div>
              <div className="flex items-center text-slate-100">
                <div className="bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full p-2 mr-3">
                  <Clock className="h-6 w-6 text-orange-300" />
                </div>
                <span className="font-medium">Prazos Garantidos</span>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Especialidades Jurídicas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
              <div className="text-gray-600">Redatores Especializados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">5000+</div>
              <div className="text-gray-600">Petições Elaboradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Taxa de Aprovação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Veredicta?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plataforma completa que conecta demanda e oferta no mercado jurídico
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white text-center border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-orange-100">
              Continue no controle. Nós tiramos o peso da operação
            </p>
          </div>

          {/* Linha de progresso (desktop) */}
          <div className="relative max-w-6xl mx-auto">
            <div className="hidden lg:block absolute top-10 left-10 right-10 h-px bg-white/30" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      {/* Ícone + número */}
                      <div className="relative mb-5">
                        <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg">
                          <Icon className="h-8 w-8 text-orange-600" />
                        </div>

                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold border-2 border-orange-600">
                          {step.step}
                        </div>
                      </div>

                      {/* Card do conteúdo */}
                      <div className="w-full bg-white/10 border border-white/15 rounded-xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-orange-100 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {/* Setas (desktop) */}
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-10 -translate-x-5">
                        <ArrowRight className="h-6 w-6 text-orange-200 mx-auto" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Planos e Preços
            </h2>
            <p className="text-xl text-gray-300">
              Escolha o plano ideal para o seu escritório. Todos os planos incluem acesso completo à plataforma e redatores especializados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className="relative bg-gray-800 border-gray-700 shadow-lg"
              >
                <CardHeader className="text-center relative pt-8">
                  {plan.badge && (
                    <Badge className={`absolute top-2 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white z-10 px-3 py-1`}>
                      ☆ {plan.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl text-white">{plan.displayName}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && (
                      <div className="text-gray-300 text-sm mt-1">{plan.period}</div>
                    )}
                  </div>
                  {plan.warning && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-600 mr-1">▲</span>
                        <span className="text-yellow-600 text-sm">{plan.warning}</span>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {plan.creditPrice && (
                    <div className="mb-6 p-3 bg-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-300">Valor por petição:</p>
                      <p className="text-lg font-bold text-white">{plan.creditPrice}</p>
                      {plan.savings && (
                        <div className="mt-2 flex items-center justify-center">
                          <span className="text-green-400 mr-1">🍃</span>
                          <span className="text-green-400 text-sm">{plan.savings}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => {
                      console.log('🔍 BOTÃO CLICADO! Plan:', plan.name);
                      handleSubscribe(plan.name);
                    }}
                  >
                    Assinar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que dizem nossos usuários
            </h2>
            <p className="text-xl text-gray-600">
              Depoimentos reais de advogados e redatores
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(' ')
                          .filter(Boolean)
                          .map((part) => part[0]?.toUpperCase())
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="font-semibold text-gray-900 leading-tight">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 leading-tight">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Junte-se à comunidade de advogados e redatores que já transformaram sua prática jurídica
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-2 border-white"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar-se Gratuitamente
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent"
              onClick={() => navigate('/auth/login')}
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Logo size="lg" clickable={false} textColor="light" />
              </div>
              <p className="text-gray-400 max-w-xs">
                Plataforma líder em redação de petições jurídicas sob demanda.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 flex flex-col items-center">
                <li>
                  <button 
                    onClick={() => navigate('/funcionalidades')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/precos')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Preços
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/calculadora')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Calculadora
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400 flex flex-col items-center">
                <li>
                  <button 
                    onClick={() => navigate('/central-ajuda')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Central de Ajuda
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/contato')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contato
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/status')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Status
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 flex flex-col items-center">
                <li>
                  <button 
                    onClick={() => navigate('/termos')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Termos de Serviço
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/privacidade')} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Política de Privacidade
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {getCurrentYear()} Veredicta. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
