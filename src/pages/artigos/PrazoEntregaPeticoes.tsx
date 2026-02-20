import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Zap, Shield } from 'lucide-react';
import ArticleLayout from '@/components/Marketing/ArticleLayout';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS } from '@/styles/marketing';

export default function PrazoEntregaPeticoes() {
  const navigate = useNavigate();

  return (
    <ArticleLayout
      categoryLabel="Petições"
      viewsLabel="890 visualizações"
      readingTimeLabel="6 min de leitura"
      title="Prazo de entrega das petições"
      subtitle="Entenda nossos SLAs, políticas de prazo e como garantir entregas pontuais para seus clientes."
    >
      <Card className={MARKETING_CARD_CLASS}>
        <CardContent className="p-8">
              {/* SLAs por Plano */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">SLAs por Plano de Assinatura</h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-sky-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-white">Start</h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                          Básico
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-slate-300 font-medium">Petições:</span>
                          <span className="font-semibold text-white">até 3 dias úteis</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-slate-300 font-medium">Revisões:</span>
                          <span className="font-semibold text-white">até 3 dias úteis</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <p className="text-xs text-slate-300 text-center">4 peças por ciclo (30 dias)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-orange-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-white">Pro</h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-200">
                          Mais Contratado
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-slate-300 font-medium">Petições:</span>
                          <span className="font-semibold text-white">até 2 dias úteis</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-slate-300 font-medium">Revisões:</span>
                          <span className="font-semibold text-white">até 2 dias úteis</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <p className="text-xs text-slate-300 text-center">14 peças por ciclo (60 dias)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-amber-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-white">Elite</h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                          Premium
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-slate-300 font-medium">Petições:</span>
                          <span className="font-semibold text-white">até 1 dia útil</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-slate-300 font-medium">Revisões:</span>
                          <span className="font-semibold text-white">até 1 dia útil</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <p className="text-xs text-slate-300 text-center">70 peças por ciclo (90 dias)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Tipos de Urgência */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Tipos de Urgência</h2>
                
                <div className="space-y-4">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded-full">
                          <CheckCircle className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Normal</h3>
                          <p className="text-slate-300 mb-3">
                            Solicitações dentro do prazo padrão do seu plano. Ideal para casos sem urgência específica.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Sem custo adicional
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Melhor qualidade
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Todos os planos
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-amber-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full">
                          <Zap className="w-6 h-6 text-orange-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Urgente</h3>
                          <p className="text-slate-300 mb-3">
                            Redução de 50% no prazo padrão. Para casos com prazos processuais apertados.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Taxa adicional
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Prioridade
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Conforme disponibilidade
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-rose-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-rose-500/15 ring-1 ring-rose-500/25 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-rose-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Emergencial</h3>
                          <p className="text-slate-300 mb-3">
                            Entrega em até 24 horas. Para situações críticas com prazos fatais iminentes.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Taxa adicional
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Máxima prioridade
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                              Sujeito a disponibilidade
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Garantias */}
              <section>
                <h2 className="text-3xl font-semibold text-white mb-6">Nossas Garantias</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded-xl">
                          <Shield className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Garantia de Prazo</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Se não entregarmos no prazo prometido, você recebe desconto de 20% 
                            na próxima petição ou reembolso parcial.
                          </p>
                          <span className="inline-flex text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                            SLA Garantido
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-sky-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-orange-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Garantia de Qualidade</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Todas as petições passam por revisão técnica e jurídica 
                            antes da entrega final ao cliente.
                          </p>
                          <span className="inline-flex text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                            Qualidade Assegurada
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
        </CardContent>
      </Card>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
              onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}
            >
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
    </ArticleLayout>
  );
}