import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Users, MessageSquare, Calculator, Settings } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS } from '@/styles/marketing';

export default function GuiaIniciante() {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Criando sua conta",
      description: "Registre-se e escolha o plano ideal para seu escritório",
      icon: Users,
      details: [
        "Acesse a página de cadastro",
        "Preencha seus dados profissionais",
        "Escolha entre os planos disponíveis",
        "Confirme seu e-mail",
        "Complete seu perfil"
      ]
    },
    {
      number: 2,
      title: "Navegando pela plataforma",
      description: "Conheça as principais funcionalidades e menus",
      icon: Settings,
      details: [
        "Dashboard principal",
        "Menu de navegação lateral",
        "Área de notificações",
        "Configurações de conta",
        "Central de ajuda"
      ]
    },
    {
      number: 3,
      title: "Solicitando sua primeira petição",
      description: "Processo completo para criar sua primeira petição",
      icon: FileText,
      details: [
        "Clique em 'Nova Petição'",
        "Selecione o tipo de petição",
        "Preencha os dados necessários",
        "Anexe documentos obrigatórios",
        "Revise e envie a solicitação"
      ]
    },
    {
      number: 4,
      title: "Comunicação com redatores",
      description: "Use o chat integrado para se comunicar",
      icon: MessageSquare,
      details: [
        "Acesse o chat da petição",
        "Envie mensagens diretas",
        "Anexe documentos no chat",
        "Receba notificações em tempo real",
        "Mantenha histórico de conversas"
      ]
    },
    {
      number: 5,
      title: "Usando a calculadora",
      description: "Aproveite nossa calculadora trabalhista",
      icon: Calculator,
      details: [
        "Acesse a calculadora no menu",
        "Selecione o tipo de cálculo",
        "Insira os dados necessários",
        "Gere relatórios automáticos",
        "Exporte para PDF ou Excel"
      ]
    }
  ];

  const tips = [
    "Mantenha seus documentos organizados em pastas digitais",
    "Responda rapidamente às mensagens dos redatores",
    "Use a calculadora para validar valores antes das petições",
    "Configure notificações para acompanhar o progresso",
    "Aproveite o período de revisão gratuita"
  ];

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
              <BookOpen className="w-8 h-8 text-orange-300" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Guia do Iniciante</h1>
              <p className="text-lg text-slate-300 mt-2">Aprenda o básico para começar a usar a plataforma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className={[MARKETING_CARD_CLASS, 'mb-8'].join(' ')}>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Bem-vindo à Veredicta
              </h2>
              <p className="text-slate-300 leading-7 mb-6">
                Este guia te ajuda a dar os primeiros passos e aproveitar ao máximo as funcionalidades da plataforma.
              </p>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                <h3 className="font-semibold text-white mb-2">O que você aprenderá</h3>
                <ul className="text-slate-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span>Como criar e configurar sua conta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span>Navegação completa pela plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span>Processo de solicitação de petições</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span>Comunicação eficiente com redatores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <span>Uso da calculadora trabalhista</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'overflow-hidden'].join(' ')}>
                <CardContent className="p-0">
                  <div className="bg-white/5 border-b border-white/10 text-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full flex items-center justify-center">
                        <span className="text-xl font-semibold">{step.number}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-1 text-white">{step.title}</h3>
                        <p className="text-slate-300">{step.description}</p>
                      </div>
                      <step.icon className="w-8 h-8 text-orange-300" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-white mb-3">Passos detalhados</h4>
                    <div className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <Card className={[MARKETING_CARD_CLASS, 'mt-8 mb-8'].join(' ')}>
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6">
                Seguindo essas dicas, você terá uma experiência muito mais eficiente:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-6 h-6 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-slate-300 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className={[MARKETING_CARD_CLASS, 'mb-8'].join(' ')}>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Próximos Passos
              </h2>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Agora que você conhece o básico, explore recursos mais avançados da plataforma 
                e comece a criar suas petições profissionais.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
                  onClick={() => navigate('/auth/register')}
                >
                  Criar Minha Conta
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Ver Artigos Detalhados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <Card className={MARKETING_CARD_CLASS}>
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Recursos Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div 
                  className="p-5 border border-white/10 bg-white/5 rounded-2xl hover:bg-white/[0.07] transition-colors cursor-pointer"
                  onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
                >
                  <h4 className="font-semibold text-white mb-2">Como solicitar primeira petição</h4>
                  <p className="text-sm text-slate-300">Guia detalhado passo-a-passo</p>
                </div>
                <div 
                  className="p-5 border border-white/10 bg-white/5 rounded-2xl hover:bg-white/[0.07] transition-colors cursor-pointer"
                  onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}
                >
                  <h4 className="font-semibold text-white mb-2">Calculadora trabalhista</h4>
                  <p className="text-sm text-slate-300">Tutorial completo da ferramenta</p>
                </div>
                <div 
                  className="p-5 border border-white/10 bg-white/5 rounded-2xl hover:bg-white/[0.07] transition-colors cursor-pointer"
                  onClick={() => navigate('/precos')}
                >
                  <h4 className="font-semibold text-white mb-2">Planos e preços</h4>
                  <p className="text-sm text-slate-300">Escolha o plano ideal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}