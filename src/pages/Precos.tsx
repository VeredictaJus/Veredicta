import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, Star, ArrowRight, Zap, Crown, AlertTriangle } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';
import MarketingHero from '@/components/Marketing/MarketingHero';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, MARKETING_BADGE_CLASS, MARKETING_SECTION_ALT_CLASS, MARKETING_SECTION_CLASS } from '@/styles/marketing';

export default function Precos() {
  const navigate = useNavigate();
  const proHighlight = 'ring-1 ring-orange-500/30 shadow-[0_20px_60px_rgba(249,115,22,0.12)]';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      displayName: 'Gratuito',
      price: 'Gratuito',
      period: '',
      originalPrice: null,
      description: 'Ideal para testar a plataforma',
      petitions: '1 petição',
      creditPrice: '',
      icon: AlertTriangle,
      color: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25',
      badge: 'Gratuito',
      badgeColor: MARKETING_BADGE_CLASS,
      warning: 'Uma vez por CPF ou CNPJ',
      popular: false,
      features: [
        { name: '1 petição gratuita', included: true },
        { name: 'Entrega em 3-5 dias úteis', included: true },
        { name: '1 revisão gratuita', included: true },
        { name: 'Consulta com redator e chat incluso', included: true },
        { name: 'Validade: 7 dias', included: true },
        { name: 'Confidencialidade garantida (NDA)', included: true },
        { name: 'Suporte por email', included: false },
        { name: 'Prioridade no atendimento', included: false }
      ],
      cta: 'Começar Grátis',
      onClick: () => navigate('/auth/register')
    },
    {
      id: 'start',
      name: 'Start',
      displayName: 'Start',
      price: 'R$ 520',
      period: '/mês',
      originalPrice: null,
      description: 'Ideal para testar ou resolver demandas pontuais',
      petitions: '4 petições',
      creditPrice: 'R$ 130,00 por petição',
      icon: Zap,
      color: 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/25',
      badge: null,
      badgeColor: null,
      popular: false,
      features: [
        { name: '4 petições incluídas', included: true },
        { name: 'Até 3 dias úteis por entrega', included: true },
        { name: '1 revisão gratuita no pacote', included: true },
        { name: 'Consulta com redator e chat incluso', included: true },
        { name: 'Validade: 30 dias', included: true },
        { name: 'Confidencialidade garantida (NDA)', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Prioridade no atendimento', included: false }
      ],
      cta: 'Escolher Start',
      onClick: () => navigate('/auth/register?plan=start')
    },
    {
      id: 'pro',
      name: 'Pro',
      displayName: 'Pro',
      price: 'R$ 1.680',
      period: 'a cada 60 dias',
      originalPrice: null,
      description: 'Perfeito para escritórios com fluxo recorrente',
      petitions: '14 petições',
      creditPrice: 'R$ 120,00 por petição',
      savings: 'Economia de R$ 10,00 por petição',
      icon: Star,
      color: 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-500/25',
      badge: 'Mais Popular',
      badgeColor: MARKETING_BADGE_CLASS,
      popular: true,
      features: [
        { name: '14 petições incluídas', included: true },
        { name: 'Entregas em até 2 dias úteis', included: true },
        { name: '1 revisão gratuita por petição', included: true },
        { name: 'Consulta com redator e chat incluso', included: true },
        { name: '+1 petição bônus na renovação', included: true },
        { name: 'Validade: 60 dias', included: true },
        { name: 'Confidencialidade garantida (NDA)', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'Prioridade no atendimento', included: true }
      ],
      cta: 'Escolher Pro',
      onClick: () => navigate('/auth/register?plan=pro')
    },
    {
      id: 'elite',
      name: 'Elite',
      displayName: 'Elite',
      price: 'R$ 7.000',
      period: 'a cada 90 dias',
      originalPrice: null,
      description: 'Para grandes bancas e departamentos jurídicos',
      petitions: '70 petições',
      creditPrice: 'R$ 100,00 por petição',
      savings: 'Economia de R$ 30,00 por petição',
      icon: Crown,
      color: 'bg-purple-500/15 text-purple-200 ring-1 ring-purple-500/25',
      badge: null,
      badgeColor: null,
      popular: false,
      features: [
        { name: '70 petições incluídas', included: true },
        { name: 'Entrega em até 1 dia útil (prioridade máxima)', included: true },
        { name: '1 revisão gratuita por petição', included: true },
        { name: 'Revisão extra por advogado sênior (opcional)', included: true },
        { name: 'Consulta direta com redator via plataforma', included: true },
        { name: '+3 petições bônus na renovação', included: true },
        { name: 'Acesso antecipado a novos recursos', included: true },
        { name: 'Validade: 90 dias', included: true },
        { name: 'Confidencialidade garantida (NDA)', included: true },
        { name: 'Suporte dedicado 24/7', included: true },
        { name: 'Gestor de conta dedicado', included: true }
      ],
      cta: 'Escolher Elite',
      onClick: () => navigate('/auth/register?plan=elite')
    }
  ];

  const faqs = [
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento ou multas.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos cartão de crédito e débito. O pagamento é processado de forma segura através de parceiros certificados.'
    },
    {
      question: 'Há limite de revisões nas petições?',
      answer: 'Cada plano inclui revisões gratuitas conforme especificado. Revisões adicionais podem ser solicitadas com custo adicional.'
    },
    {
      question: 'Como funciona a calculadora trabalhista?',
      answer: 'A calculadora é automatizada e sempre atualizada com a legislação vigente. Está disponível em todos os planos.'
    },
    {
      question: 'Posso mudar de plano depois?',
      answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O ajuste será feito proporcionalmente.'
    },
    {
      question: 'O que acontece com petições não utilizadas?',
      answer: 'Petições não utilizadas expiram conforme a validade do seu plano. Recomendamos utilizar todas antes do vencimento.'
    }
  ];

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <MarketingHero
        eyebrow="Planos Flexíveis"
        title={
          <>
            Planos e <br />
            <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Preços
            </span>
          </>
        }
        subtitle={
          <>
            Escolha o plano ideal para suas necessidades jurídicas.
            <br />
            Sem compromisso, cancele quando quiser.
          </>
        }
      />

      {/* Pricing Plans */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={[
                    'relative h-full flex flex-col',
                    MARKETING_CARD_CLASS,
                    MARKETING_CARD_HOVER_CLASS,
                    plan.popular ? proHighlight : '',
                  ].join(' ')}
                >
                  {plan.badge && (
                    <Badge
                      className={[
                        'absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 shadow-lg whitespace-nowrap',
                        plan.badgeColor || MARKETING_BADGE_CLASS,
                      ].join(' ')}
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <CardHeader className={['text-center pb-6', plan.badge ? 'pt-12' : 'pt-8'].join(' ')}>
                    <div className={['w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', plan.color].join(' ')}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-white">{plan.displayName}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-semibold tracking-tight tabular-nums text-white">{plan.price}</span>
                      {plan.period && <div className="text-slate-400 text-sm mt-1">{plan.period}</div>}
                    </div>
                    {plan.creditPrice && (
                      <p className="text-sm text-slate-300 mt-2">
                        {plan.creditPrice}
                      </p>
                    )}
                    {plan.savings && (
                      <Badge className="mt-3 bg-emerald-500/15 text-emerald-200 border border-emerald-500/25">
                        {plan.savings}
                      </Badge>
                    )}
                    {plan.warning && (
                      <p className="text-xs text-orange-200/90 mt-3 font-medium">
                        {plan.warning}
                      </p>
                    )}
                    <CardDescription className="text-base mt-4 text-slate-300">
                    {plan.description}
                  </CardDescription>
                    <div className="mt-3">
                      <Badge variant="outline" className="text-sm border-white/15 text-slate-200 bg-white/5">
                        {plan.petitions}
                      </Badge>
                    </div>
                </CardHeader>
                  
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="space-y-3 mb-8 min-h-[300px]">
                    {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                            <X className="h-5 w-5 text-slate-500 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                          <span className={feature.included ? "text-slate-200 text-sm" : "text-slate-500 text-sm line-through"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                      className={[
                        'w-full',
                        plan.popular ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white' : 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
                      ].join(' ')}
                      size="lg"
                      onClick={plan.onClick}
                  >
                    {plan.cta}
                      {plan.id === 'free' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Compare os Planos
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Veja em detalhes o que cada plano oferece
            </p>
          </div>
          
          <div className="rounded-2xl shadow-xl overflow-hidden border border-white/10 bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Recurso</th>
                    <th className="px-6 py-4 text-center font-semibold">Free</th>
                    <th className="px-6 py-4 text-center font-semibold">Start</th>
                    <th className="px-6 py-4 text-center font-semibold bg-orange-500/10">Pro</th>
                    <th className="px-6 py-4 text-center font-semibold">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  <tr>
                    <td className="px-6 py-4 font-medium text-white">Petições por mês</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center">4</td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">14</td>
                    <td className="px-6 py-4 text-center">70</td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">Prazo de entrega</td>
                    <td className="px-6 py-4 text-center">3-5 dias úteis</td>
                    <td className="px-6 py-4 text-center">Até 3 dias úteis</td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">Até 2 dias úteis</td>
                    <td className="px-6 py-4 text-center">Até 1 dia útil</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-white">Revisões gratuitas</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center">1 no pacote</td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">1 por petição</td>
                    <td className="px-6 py-4 text-center">1 por petição + extra</td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">Chat com redator</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-white">Calculadora trabalhista</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">Suporte prioritário</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-slate-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-slate-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-white">Gestor de conta dedicado</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-slate-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-slate-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">
                      <X className="h-5 w-5 text-slate-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">Validade</td>
                    <td className="px-6 py-4 text-center">7 dias</td>
                    <td className="px-6 py-4 text-center">30 dias</td>
                    <td className="px-6 py-4 text-center bg-orange-500/10">60 dias</td>
                    <td className="px-6 py-4 text-center">90 dias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Tire suas dúvidas sobre nossos planos e serviços
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-3 text-lg">
                    {faq.question}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
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
            Escolha um plano e comece a operar com previsibilidade e padrão técnico.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.18)] px-8 py-6 text-lg font-semibold"
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
