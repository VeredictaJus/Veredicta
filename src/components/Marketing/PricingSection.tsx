import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

type Plan = {
  name: 'Start' | 'Pro' | 'Elite';
  displayName: string;
  price: string;
  period: string;
  tagline: string;
  badge?: string;
  badgeColor?: string;
  warning?: string;
  creditPrice?: string;
  savings?: string;
  ctaLabel?: string;
  whatsAppMessage: string;
  features: string[];
};

const WHATSAPP_PHONE_NUMBER = '5544997271991'; // (44) 99727-1991 sem caracteres especiais

const PLANS: Plan[] = [
  {
    name: 'Start',
    displayName: 'Start – Estrutura Inicial de Produção',
    price: 'R$ 520',
    period: '/mês',
    tagline: 'Ideal para escritórios em fase de organização da capacidade produtiva.',
    creditPrice: '',
    ctaLabel: 'Solicitar Proposta',
    whatsAppMessage:
      'Olá, gostaria de entender melhor o Plano Start e como estruturar a produção do meu escritório.',
    features: [
      'Até 4 peças por ciclo',
      'Execução por especialista dedicado',
      'Revisão técnica antes da entrega',
      'Atendimento estruturado por fluxo',
      'Confidencialidade garantida (NDA)',
      'Ciclo: 30 dias',
    ],
  },
  {
    name: 'Pro',
    displayName: 'Pro – Capacidade Produtiva Recorrente',
    price: 'R$ 1.680',
    period: 'a cada 60 dias',
    tagline: 'Indicado para escritórios com volume contínuo e prazos frequentes.',
    badge: 'Mais Contratado',
    badgeColor: 'bg-blue-500',
    creditPrice: '',
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
      'Validade: 60 dias',
    ],
  },
  {
    name: 'Elite',
    displayName: 'Elite – Estrutura Avançada de Produção',
    price: 'R$ 7.000',
    period: 'a cada 90 dias',
    tagline: 'Para escritórios com alta demanda recorrente e necessidade de prioridade máxima.',
    creditPrice: '',
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
      'Ciclo: 90 dias',
    ],
  },
];

export default function PricingSection() {
  const handleSubscribe = (planName: Plan['name']) => {
    const plan = PLANS.find((p) => p.name === planName);
    if (!plan) {
      toast.error('Plano não encontrado');
      return;
    }
    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(plan.whatsAppMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative overflow-hidden py-20 bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.14),transparent_60%)]"
      />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold tracking-tight text-white mb-4">
            Modelos de Contratação por Capacidade Produtiva
          </h2>
          <p className="text-xl text-slate-300">
            Escolha a estrutura de capacidade produtiva mais adequada ao momento do seu escritório.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto items-stretch">
          {PLANS.map((plan, index) => {
            const isFeatured = plan.name === 'Pro' || plan.badge === 'Mais Contratado';

            return (
              <Card
                key={index}
                className={[
                  'relative h-full flex flex-col bg-white/5 border border-white/10 shadow-xl backdrop-blur transition-transform',
                  'hover:-translate-y-0.5 hover:border-orange-500/30',
                  isFeatured
                    ? 'ring-1 ring-orange-500/30 shadow-[0_20px_60px_rgba(249,115,22,0.12)] md:-translate-y-2 md:hover:-translate-y-2'
                    : '',
                ].join(' ')}
              >
                <CardHeader className="text-center relative pt-8">
                  {plan.badge && (
                    <Badge
                      className={[
                        'absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1',
                        isFeatured
                          ? 'bg-orange-500/15 text-orange-200 border border-orange-500/30'
                          : `${plan.badgeColor} text-white`,
                      ].join(' ')}
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl text-white">{plan.displayName}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums text-white">
                      {plan.price}
                    </span>
                    {plan.period && <div className="text-slate-400 text-sm mt-1">{plan.period}</div>}
                  </div>
                  {plan.tagline && (
                    <p className="mt-4 text-slate-300 text-sm leading-relaxed">{plan.tagline}</p>
                  )}
                  {plan.warning && (
                    <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-200 mr-1">▲</span>
                        <span className="text-yellow-200 text-sm">{plan.warning}</span>
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                  {plan.creditPrice ? (
                    <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                      <p className="text-sm text-slate-300">Valor por petição:</p>
                      <p className="text-lg font-bold text-white">{plan.creditPrice}</p>
                      {plan.savings ? (
                        <div className="mt-2 flex items-center justify-center">
                          <span className="text-green-400 mr-1">🍃</span>
                          <span className="text-green-400 text-sm">{plan.savings}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={[
                      'w-full mt-6 text-white',
                      'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500',
                      'shadow-[0_10px_30px_rgba(249,115,22,0.16)]',
                    ].join(' ')}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {plan.ctaLabel || 'Solicitar Proposta'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

