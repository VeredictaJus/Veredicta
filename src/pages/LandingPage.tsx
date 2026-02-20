import { useState } from 'react';
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
import PricingSection from '@/components/Marketing/PricingSection';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const promoVideoUrl =
    'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/copy_2E0B46BB-B907-4FFA-B7D8-31F3115A343B.mp4';
  const interactiveCardClass =
    'transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_16px_50px_rgba(0,0,0,0.35)] hover:border-orange-500/30';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center shrink-0">
              <Logo size="xl" clickable={false} textColor="light" />
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0 ml-auto justify-end">
              <Button 
                variant="outline" 
                className="bg-white/5 text-white border-white/15 hover:border-white/25 hover:bg-white/10 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/login')}
              >
                Entrar
              </Button>
              <Button
                variant="outline"
                className="hidden sm:inline-flex bg-white/5 text-white border-white/15 hover:border-white/25 hover:bg-white/10 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.18)] text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/register')}
              >
                Cadastrar-se
              </Button>
            </div>

            {/* CTA no mobile (2ª linha) */}
            <div className="w-full sm:hidden">
              <Button
                variant="outline"
                className="w-full bg-white/5 text-white border-white/15 hover:border-white/25 hover:bg-white/10 text-sm"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.32),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_55%)]"
        />
        <div className="container mx-auto px-4 py-24 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
              <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Alta demanda
              </span>{' '}
              não precisa significar sobrecarga.
            </h1>
            <p className="text-base md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              A Veredicta estrutura e executa a produção de peças jurídicas com especialistas humanos, permitindo que
              escritórios cresçam com previsibilidade, controle e padrão técnico.
            </p>
            
            {/* Para quem é a Veredicta */}
            <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-left max-w-3xl mx-auto shadow-xl backdrop-blur">
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
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => navigate('/auth/login')}
              >
                Fazer Login
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent text-white border-white/20 hover:bg-white/10"
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
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
                Execução humana com responsabilidade técnica.
              </h2>
              <p className="text-lg text-slate-300">
                Produção jurídica estruturada com contexto, técnica e responsabilidade profissional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Nosso padrão de execução</h3>
                <ul className="space-y-3 text-slate-200">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                    <span>Produção realizada por especialistas humanos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                    <span>Sem geração automática não supervisionada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                    <span>Sem banco genérico de modelos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                    <span>Redação com responsabilidade técnica</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-2xl border border-orange-500/20 p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Como funciona na prática</h3>
                <p className="text-slate-200 mb-4">
                  Inteligência humana aplicada à rotina jurídica.
                </p>
                <p className="text-slate-200">
                  Na Veredicta, você delega a redação das suas peças a redatores jurídicos especializados, que trabalham com contexto, técnica, responsabilidade e jurisprudência adequada — algo que ferramentas automáticas ainda não entregam com segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Todas as Áreas do Direito */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Atuação especializada por área
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Produção jurídica executada por especialistas com experiência prática nas principais áreas de atuação do contencioso recorrente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {legalAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <div
                  key={index}
                  className={['group bg-white/5 rounded-xl shadow-xl border border-white/10 p-6', interactiveCardClass].join(' ')}
                >
                  <div className="text-center mb-4">
                    <div
                      className={[
                        `w-16 h-16 rounded-full ${area.color} flex items-center justify-center mb-3 mx-auto`,
                        'transition-transform duration-300 group-hover:scale-[1.03]'
                      ].join(' ')}
                    >
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-white text-lg">
                      {area.name}
                    </h3>
                  </div>
                  
                  <p className="text-slate-300 text-sm text-center mb-4">
                    {area.description}
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-400 text-center mb-2">
                      Exemplos de petições:
                    </p>
                    {area.examples.map((example, idx) => (
                      <div key={idx} className="text-xs text-center text-slate-400">
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
            <div className={['group bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="text-base font-semibold text-white">
                Atendimento estruturado por fluxo
              </div>
            </div>

            <div className={['group bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="text-base font-semibold text-white">
                Prazos definidos previamente
              </div>
            </div>

            <div className={['group bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="text-base font-semibold text-white">
                Redação jurídica revisada antes da entrega
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Por que escolher a Veredicta?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Estrutura produtiva organizada para escritórios com alta demanda recorrente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={['group bg-white/5 text-center border border-white/10 shadow-xl rounded-2xl p-6', interactiveCardClass].join(' ')}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full mb-4 transition-transform duration-300 group-hover:scale-[1.03]">
                  <feature.icon className="h-8 w-8 text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Vídeo */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-white/5">
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
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold tracking-tight text-white mb-4 flex items-center justify-center gap-3">
              <Briefcase className="h-8 w-8 text-orange-400" />
              Impacto direto na operação do seu escritório
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className={['group bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                  <Clock className="h-6 w-6 text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Tempo</h3>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Redução de sobrecarga operacional</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Mais tempo estratégico para sócios</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Foco em crescimento e relacionamento com cliente</span>
                </li>
              </ul>
            </div>

            <div className={['group bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                  <FileText className="h-6 w-6 text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Volume</h3>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Capacidade produtiva sob demanda</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Absorção de picos sem ampliar equipe</span>
                </li>
              </ul>
            </div>

            <div className={['group bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                  <Scale className="h-6 w-6 text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Qualidade técnica</h3>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Padrão técnico consistente</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Linguagem adequada ao perfil do caso</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Fundamentação alinhada à jurisprudência</span>
                </li>
              </ul>
            </div>

            <div className={['group bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                  <BarChart3 className="h-6 w-6 text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Previsibilidade</h3>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Custo previsível</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Sem risco trabalhista</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Sem curva de aprendizado interna</span>
                </li>
              </ul>
            </div>

            <div className={['group bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl', interactiveCardClass].join(' ')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]">
                  <Target className="h-6 w-6 text-orange-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">Por que isso importa?</h3>
              </div>
              <ul className="space-y-2 text-slate-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Fortalece posicionamento do escritório</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Eleva percepção de valor do cliente final</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Reduz retrabalho interno</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
              Modelo de Produção Estruturado
            </h2>
            <p className="text-xl text-slate-300">
              Você mantém o controle estratégico enquanto estruturamos a produção jurídica com padrão técnico e previsibilidade.
            </p>
          </div>

          {/* Linha de progresso (desktop) */}
          <div className="relative max-w-6xl mx-auto">
            <div className="hidden lg:block absolute top-10 left-10 right-10 h-px bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      {/* Ícone + número */}
                      <div className="relative mb-5">
                        <div className="flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full shadow-xl backdrop-blur">
                          <Icon className="h-8 w-8 text-orange-300" />
                        </div>

                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center text-sm font-bold border-2 border-orange-400">
                          {step.step}
                        </div>
                      </div>

                      {/* Card do conteúdo */}
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
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

      <PricingSection />

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 bg-slate-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.12),transparent_55%)]"
        />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
            Uma nova forma de escalar a produção jurídica
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
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
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => navigate('/auth/login')}
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Logo size="lg" clickable={false} textColor="light" />
              </div>
              <p className="text-slate-400 max-w-xs">
                Inteligência humana aplicada à rotina jurídica.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-3">Produto</h4>
              <ul className="space-y-2 text-slate-400 flex flex-col items-center">
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
              <h4 className="font-semibold mb-3">Suporte</h4>
              <ul className="space-y-2 text-slate-400 flex flex-col items-center">
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
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-slate-400 flex flex-col items-center">
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
        </div>

        <div className="mt-8 border-t border-white/10">
          <div className="container mx-auto px-4 py-6 text-center text-slate-400">
            <p>&copy; {getCurrentYear()} Veredicta. Todos os direitos reservados.</p>
            <p className="mt-1 text-xs text-slate-500">CNPJ: 61.992.118/0001-38</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
