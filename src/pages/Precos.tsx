import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, Star, ArrowRight, Zap, Crown, AlertTriangle } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function Precos() {
  const navigate = useNavigate();

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
      color: 'bg-gray-100 text-gray-700',
      badge: 'Gratuito',
      badgeColor: 'bg-green-500',
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
      color: 'bg-blue-100 text-blue-700',
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
      color: 'bg-purple-100 text-purple-700',
      badge: 'Mais Popular',
      badgeColor: 'bg-orange-500',
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
      color: 'bg-orange-100 text-orange-700',
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-orange-500 text-white border-0 px-4 py-1">
            Planos Flexíveis
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Planos e
            <br />
            <span className="text-orange-200">Preços</span>
          </h1>
          <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Escolha o plano ideal para suas necessidades jurídicas. 
            Sem compromisso, cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`relative bg-white border-2 hover:shadow-xl transition-all duration-300 overflow-visible ${
                    plan.popular 
                      ? 'border-orange-500 shadow-xl scale-105' 
                      : 'border-gray-200 shadow-lg'
                  }`}
                >
                  {plan.badge && (
                    <Badge className={`absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 ${plan.badgeColor} text-white px-4 py-1.5 shadow-lg whitespace-nowrap`}>
                      {plan.badge}
                  </Badge>
                )}
                  
                  <CardHeader className={`text-center pb-6 ${plan.badge ? 'pt-12' : 'pt-8'}`}>
                    <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
                  <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                  </div>
                    {plan.creditPrice && (
                      <p className="text-sm text-gray-500 mt-2">
                        {plan.creditPrice}
                      </p>
                    )}
                    {plan.savings && (
                      <Badge className="mt-2 bg-green-100 text-green-700 border-0">
                        {plan.savings}
                      </Badge>
                    )}
                    {plan.warning && (
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        ⚠️ {plan.warning}
                      </p>
                    )}
                    <CardDescription className="text-base mt-3 text-gray-600">
                    {plan.description}
                  </CardDescription>
                    <div className="mt-3">
                      <Badge variant="outline" className="text-sm">
                        {plan.petitions}
                      </Badge>
                    </div>
                </CardHeader>
                  
                  <CardContent className="bg-white">
                    <ul className="space-y-3 mb-8 min-h-[300px]">
                    {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                            <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                          <span className={feature.included ? "text-gray-700 text-sm" : "text-gray-400 text-sm line-through"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Compare os Planos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja em detalhes o que cada plano oferece
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Recurso</th>
                    <th className="px-6 py-4 text-center font-semibold">Free</th>
                    <th className="px-6 py-4 text-center font-semibold">Start</th>
                    <th className="px-6 py-4 text-center font-semibold bg-orange-600">Pro</th>
                    <th className="px-6 py-4 text-center font-semibold">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Petições por mês</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center">4</td>
                    <td className="px-6 py-4 text-center bg-orange-50">14</td>
                    <td className="px-6 py-4 text-center">70</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Prazo de entrega</td>
                    <td className="px-6 py-4 text-center">3-5 dias úteis</td>
                    <td className="px-6 py-4 text-center">Até 3 dias úteis</td>
                    <td className="px-6 py-4 text-center bg-orange-50">Até 2 dias úteis</td>
                    <td className="px-6 py-4 text-center">Até 1 dia útil</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Revisões gratuitas</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center">1 no pacote</td>
                    <td className="px-6 py-4 text-center bg-orange-50">1 por petição</td>
                    <td className="px-6 py-4 text-center">1 por petição + extra</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Chat com redator</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Calculadora trabalhista</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Suporte prioritário</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">Gestor de conta dedicado</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-orange-50">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Validade</td>
                    <td className="px-6 py-4 text-center">7 dias</td>
                    <td className="px-6 py-4 text-center">30 dias</td>
                    <td className="px-6 py-4 text-center bg-orange-50">60 dias</td>
                    <td className="px-6 py-4 text-center">90 dias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tire suas dúvidas sobre nossos planos e serviços
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow bg-white border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl md:text-2xl text-orange-100 mb-8">
            Escolha seu plano e comece a transformar sua prática jurídica hoje mesmo
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold shadow-lg"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar-se Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg font-semibold shadow-lg"
              onClick={() => navigate('/auth/login')}
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
