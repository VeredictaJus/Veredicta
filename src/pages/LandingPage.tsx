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
  BarChart3,
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
  const promoVideoUrl =
    'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/copy_2E0B46BB-B907-4FFA-B7D8-31F3115A343B.mp4';

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

  const WHATSAPP_PHONE_NUMBER = '5544997271991'; // (44) 99727-1991 sem caracteres especiais

  // CTA dos planos na landing: WhatsApp com mensagem
  const handleSubscribe = (planName: string) => {
    const messages: Record<string, string> = {
      Start:
        'Olá, gostaria de entender melhor o Plano Start e como estruturar a produção do meu escritório.',
      Pro:
        'Olá, tenho interesse no Plano Pro e gostaria de avaliar se ele é o mais adequado para o volume do meu escritório.',
      Elite:
        'Olá, gostaria de conversar sobre o Plano Elite e entender a estrutura avançada de produção.',
    };

    const message = messages[planName];
    if (!message) {
      toast.error('Plano não encontrado');
      return;
    }

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const features = [
    {
      icon: FileText,
      title: 'Produção técnica especializada',
      description: 'Redação jurídica humana, especializada e contextualizada.'
    },
    {
      icon: Shield,
      title: 'Revisão técnica antes da entrega',
      description: 'Todas as peças passam por conferência técnica antes da entrega.'
    },
    {
      icon: Scale,
      title: 'Fundamentação alinhada aos entendimentos atuais',
      description: 'Fundamentação alinhada aos entendimentos atuais dos tribunais.'
    },
    {
      icon: Clock,
      title: 'Prazos definidos e previsíveis',
      description: 'Produção com SLA e previsibilidade operacional.'
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
      title: 'Envio estruturado da demanda',
      description: 'Detalhamento técnico conforme área e estratégia do escritório.',
      icon: FileText
    },
    {
      step: '2', 
      title: 'Execução por especialista dedicado',
      description: 'Produção conforme padrão técnico definido.',
      icon: Users
    },
    {
      step: '3',
      title: 'Revisão técnica e validação',
      description: 'Conferência de coerência jurídica, fundamentação e adequação.',
      icon: CheckCircle
    },
    {
      step: '4',
      title: 'Entrega validada e pronta para protocolo',
      description: 'Peça organizada conforme padrão do seu escritório.',
      icon: Trophy
    }
  ];

  const plans = [
    {
      name: 'Start',
      displayName: 'Start – Estrutura Inicial de Produção',
      price: 'R$ 520',
      period: '/mês',
      tagline: 'Ideal para escritórios em fase de organização da capacidade produtiva.',
      warning: undefined,
      creditPrice: '',
      savings: undefined,
      ctaLabel: 'Solicitar Proposta',
      whatsAppMessage:
        'Olá, gostaria de entender melhor o Plano Start e como estruturar a produção do meu escritório.',
      features: [
        'Até 4 peças por ciclo',
        'Execução por especialista dedicado',
        'Revisão técnica antes da entrega',
        'Atendimento estruturado por fluxo',
        'Confidencialidade garantida (NDA)'
      ]
    },
    {
      name: 'Pro',
      displayName: 'Pro – Capacidade Produtiva Recorrente',
      price: 'R$ 1.680',
      period: 'a cada 60 dias',
      tagline: 'Indicado para escritórios com volume contínuo e prazos frequentes.',
      badge: 'Mais Contratado',
      badgeColor: 'bg-blue-500',
      warning: undefined,
      creditPrice: '',
      savings: undefined,
      ctaLabel: 'Solicitar Proposta',
      whatsAppMessage:
        'Olá, tenho interesse no Plano Pro e gostaria de avaliar se ele é o mais adequado para o volume do meu escritório.',
      features: [
        '14 peças por ciclo',
        'Execução por especialistas por área',
        'Revisão técnica individual por peça',
        'Atendimento estruturado e acompanhamento',
        'Prioridade operacional',
        '1 peça bônus na renovação',
        'Validade: 60 dias'
      ]
    },
    {
      name: 'Elite',
      displayName: 'Elite – Estrutura Avançada de Produção',
      price: 'R$ 7.000',
      period: 'a cada 90 dias',
      tagline:
        'Para escritórios com alta demanda recorrente e necessidade de prioridade máxima.',
      warning: undefined,
      creditPrice: '',
      savings: undefined,
      ctaLabel: 'Falar com Especialista',
      whatsAppMessage:
        'Olá, gostaria de conversar sobre o Plano Elite e entender a estrutura avançada de produção.',
      features: [
        '70 peças por ciclo',
        'Entrega prioritária (até 1 dia útil conforme demanda)',
        'Revisão técnica especializada',
        'Consulta direta com redator via plataforma',
        '3 peças bônus na renovação',
        'Acesso antecipado a novos recursos',
        'Validade: 90 dias'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-4">
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center shrink-0">
              <Logo size="xl" clickable={false} textColor="light" />
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0 ml-auto justify-end">
              <Button 
                variant="outline" 
                className="bg-white text-slate-900 border-gray-300 hover:bg-gray-100 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/login')}
              >
                Entrar
              </Button>
              <Button
                variant="outline"
                className="hidden sm:inline-flex bg-transparent text-white border-white/60 hover:bg-white/10 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/register')}
              >
                Cadastrar-se
              </Button>
            </div>

            {/* CTA no mobile (2ª linha) */}
            <div className="w-full sm:hidden">
              <Button
                variant="outline"
                className="w-full bg-transparent text-white border-white/60 hover:bg-white/10 text-sm"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
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
              Alta demanda não precisa significar sobrecarga.
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              A Veredicta estrutura e executa a produção de peças jurídicas com especialistas humanos, permitindo que escritórios cresçam com previsibilidade, controle e padrão técnico.
            </p>
            
            {/* Para quem é a Veredicta */}
            <div className="mt-10 bg-slate-900/70 border border-white/10 rounded-2xl p-6 md:p-8 text-left max-w-3xl mx-auto shadow-xl backdrop-blur">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-2">
                <Target className="h-6 w-6 text-orange-400" />
                Para quem é a Veredicta
              </h2>

              <p className="text-slate-200 mb-4">
                A Veredicta é ideal para escritórios que já operam com volume — e precisam de estrutura para crescer.
              </p>

              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Equipes com 3 ou mais advogados</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Volume recorrente de produção jurídica</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Demandas repetitivas e prazos frequentes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <span className="text-slate-200">Interesse em crescer com previsibilidade e controle</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-white font-semibold">
                  Se a produção de peças está limitando o crescimento do seu escritório, você está no lugar certo.
                </p>

                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold whitespace-nowrap"
                  onClick={() => navigate('/solicitar-demonstracao')}
                >
                  Solicitar Avaliação Estratégica
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
                Execução humana com responsabilidade técnica.
              </h2>
              <p className="text-lg text-gray-600">
                Produção jurídica estruturada com contexto, técnica e responsabilidade profissional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nosso padrão de execução</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <span>Produção realizada por especialistas humanos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <span>Sem geração automática não supervisionada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <span>Sem banco genérico de modelos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <span>Redação com responsabilidade técnica</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Como funciona na prática</h3>
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
              Atuação especializada por área
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Produção jurídica executada por especialistas com experiência prática nas principais áreas de atuação do contencioso recorrente.
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
              Estrutura adaptada à sua área de atuação
            </h3>
            <p className="text-slate-200 text-lg mb-6">
              Estruturamos produção jurídica conforme a área de atuação do seu escritório, com redatores especializados e padrão técnico definido.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center text-slate-100">
                <div className="bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full p-2 mr-3">
                  <CheckCircle className="h-6 w-6 text-orange-300" />
                </div>
                <span className="font-medium">Atuação nacional estruturada</span>
              </div>
              <div className="flex items-center text-slate-100">
                <div className="bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full p-2 mr-3">
                  <CheckCircle className="h-6 w-6 text-orange-300" />
                </div>
                <span className="font-medium">Especialistas por área</span>
              </div>
              <div className="flex items-center text-slate-100">
                <div className="bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full p-2 mr-3">
                  <CheckCircle className="h-6 w-6 text-orange-300" />
                </div>
                <span className="font-medium">Prazos previamente definidos</span>
              </div>
            </div>
          </div>

          {/* Destaques */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="text-base font-semibold text-gray-900">
                Atendimento estruturado por fluxo
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="text-base font-semibold text-gray-900">
                Prazos definidos previamente
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="text-base font-semibold text-gray-900">
                Redação jurídica revisada antes da entrega
              </div>
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
              Estrutura produtiva organizada para escritórios com alta demanda recorrente.
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

          {/* Vídeo */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-auto"
              >
                <source src={promoVideoUrl} type="video/mp4" />
                Seu navegador não suporta vídeo HTML5.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* O que você ganha na prática */}
      <section className="py-20 bg-white text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Briefcase className="h-8 w-8 text-orange-600" />
              Impacto direto na operação do seu escritório
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Tempo</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✔ Redução de sobrecarga operacional</li>
                <li>✔ Mais tempo estratégico para sócios</li>
                <li>✔ Foco em crescimento e relacionamento com cliente</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Volume</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✔ Capacidade produtiva sob demanda</li>
                <li>✔ Absorção de picos sem ampliar equipe</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Qualidade técnica</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✔ Padrão técnico consistente</li>
                <li>✔ Linguagem adequada ao perfil do caso</li>
                <li>✔ Fundamentação alinhada à jurisprudência</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Previsibilidade</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✔ Custo previsível</li>
                <li>✔ Sem risco trabalhista</li>
                <li>✔ Sem curva de aprendizado interna</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Por que isso importa?</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>✔ Fortalece posicionamento do escritório</li>
                <li>✔ Eleva percepção de valor do cliente final</li>
                <li>✔ Reduz retrabalho interno</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 text-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Modelo de Produção Estruturado
            </h2>
            <p className="text-xl text-slate-600">
              Você mantém o controle estratégico enquanto estruturamos a produção jurídica com padrão técnico e previsibilidade.
            </p>
          </div>

          {/* Linha de progresso (desktop) */}
          <div className="relative max-w-6xl mx-auto">
            <div className="hidden lg:block absolute top-10 left-10 right-10 h-px bg-slate-200" />

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
                      <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {/* Setas (desktop) */}
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-10 -translate-x-5">
                        <ArrowRight className="h-6 w-6 text-orange-400 mx-auto" />
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
              Modelos de Contratação por Capacidade Produtiva
            </h2>
            <p className="text-xl text-gray-300">
              Escolha a estrutura de capacidade produtiva mais adequada ao momento do seu escritório.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
                  {plan.tagline && (
                    <p className="mt-4 text-gray-300 text-sm leading-relaxed">
                      {plan.tagline}
                    </p>
                  )}
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
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {plan.ctaLabel || 'Solicitar Proposta'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona a experiência */}
      <section className="py-20 bg-white text-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como funciona a experiência na Veredicta
            </h2>
            <p className="text-xl text-gray-600">
              Clareza, previsibilidade e qualidade do pedido à entrega
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-center text-center min-h-[72px]">
              <p className="text-base font-semibold text-gray-900 text-center">
                Redação jurídica com checklist técnico
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-center text-center min-h-[72px]">
              <p className="text-base font-semibold text-gray-900 text-center">
                Acompanhamento do pedido à entrega
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-center text-center min-h-[72px]">
              <p className="text-base font-semibold text-gray-900 text-center">
                Comunicação clara e centralizada
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-center text-center min-h-[72px]">
              <p className="text-base font-semibold text-gray-900 text-center">
                Prazos definidos previamente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Uma nova forma de escalar a produção jurídica
          </h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Transforme a rotina do seu escritório
            <br />
            sem mudar sua forma de advogar
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar-se Gratuitamente
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-transparent"
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
                Inteligência humana aplicada à rotina jurídica.
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
