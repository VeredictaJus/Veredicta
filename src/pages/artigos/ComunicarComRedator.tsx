import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Users, Shield, Headphones, Bell } from 'lucide-react';
import ArticleLayout from '@/components/Marketing/ArticleLayout';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS } from '@/styles/marketing';

export default function ComunicarComRedator() {
  const navigate = useNavigate();

  return (
    <ArticleLayout
      categoryLabel="Chat"
      viewsLabel="567 visualizações"
      readingTimeLabel="4 min de leitura"
      title="Como me comunicar com o redator?"
      subtitle="Guia completo para uma comunicação eficiente e produtiva com nossos redatores especializados."
    >
      <Card className={MARKETING_CARD_CLASS}>
        <CardContent className="p-8">
              {/* Sistema de Chat */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Sistema de Chat Integrado</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-orange-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <MessageCircle className="w-6 h-6 text-orange-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Chat em Tempo Real</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Comunicação instantânea com o redator responsável pela sua petição, 
                            com notificações em tempo real.
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            <li>• Mensagens instantâneas</li>
                            <li>• Indicadores de leitura</li>
                            <li>• Histórico completo</li>
                            <li>• Anexos de arquivos</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Shield className="w-6 h-6 text-emerald-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Privacidade Total</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Todas as conversas são criptografadas e mantidas em sigilo absoluto, 
                            respeitando o sigilo profissional.
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            <li>• Criptografia ponta-a-ponta</li>
                            <li>• Sigilo profissional</li>
                            <li>• Acesso restrito</li>
                            <li>• Conformidade LGPD</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Horários de Atendimento */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Horários de Atendimento</h2>
                
                <div className="space-y-4">
                  <Card className={MARKETING_CARD_CLASS}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Disponibilidade dos Redatores</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-white mb-3">Horário Comercial</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-300">Segunda a Sexta:</span>
                              <span className="font-medium text-white">9h às 18h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Sábados:</span>
                              <span className="font-medium text-white">8h às 12h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Domingos:</span>
                              <span className="font-medium text-slate-400">Não atendemos</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-white mb-3">Tempo de Resposta</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-300">Horário comercial:</span>
                              <span className="font-medium text-emerald-300">15-30 minutos</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Fora do horário:</span>
                              <span className="font-medium text-orange-300">2-4 horas</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Fins de semana:</span>
                              <span className="font-medium text-slate-300">Próximo dia útil</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-white/5 border border-white/10 border-l-4 border-l-orange-400 p-4 rounded-2xl">
                    <div className="flex items-start">
                      <Bell className="w-5 h-5 text-orange-300 mr-2 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Prioridade de Atendimento</p>
                        <p className="text-slate-300 text-sm mt-1">
                          Em volumes e demandas recorrentes, a prioridade pode variar conforme disponibilidade operacional.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tipos de Mensagem */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Tipos de Comunicação</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-t-4 border-t-emerald-400'].join(' ')}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Esclarecimentos</h3>
                      <p className="text-slate-300 text-sm mb-3">
                        Dúvidas sobre o processo, prazos, documentos necessários ou 
                        andamento da petição.
                      </p>
                      <div className="text-xs text-slate-300">
                        <p><strong>Exemplos:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• "Qual o prazo previsto?"</li>
                          <li>• "Preciso de mais documentos?"</li>
                          <li>• "Como está o andamento?"</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-t-4 border-t-orange-400'].join(' ')}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Correções</h3>
                      <p className="text-slate-300 text-sm mb-3">
                        Solicitações de alterações específicas no conteúdo, 
                        argumentação ou estrutura da petição.
                      </p>
                      <div className="text-xs text-slate-300">
                        <p><strong>Exemplos:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• "Alterar o valor do pedido"</li>
                          <li>• "Incluir jurisprudência X"</li>
                          <li>• "Ajustar argumentação Y"</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-t-4 border-t-sky-400'].join(' ')}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Informações Adicionais</h3>
                      <p className="text-slate-300 text-sm mb-3">
                        Complementação de dados, novos documentos ou 
                        informações que surgiram após o início.
                      </p>
                      <div className="text-xs text-slate-300">
                        <p><strong>Exemplos:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• "Anexo novo documento"</li>
                          <li>• "Informação adicional"</li>
                          <li>• "Mudança na estratégia"</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Boas Práticas */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Boas Práticas de Comunicação</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className={[MARKETING_CARD_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Recomendações</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-300 mt-1">•</span>
                            <span>Seja específico e direto ao ponto</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-300 mt-1">•</span>
                            <span>Forneça contexto quando necessário</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-300 mt-1">•</span>
                            <span>Use linguagem profissional e respeitosa</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-300 mt-1">•</span>
                            <span>Anexe documentos quando relevante</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-300 mt-1">•</span>
                            <span>Confirme o recebimento de informações</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-emerald-300 mt-1">•</span>
                            <span>Mantenha um registro das conversas</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className={[MARKETING_CARD_CLASS, 'border-l-4 border-l-rose-400'].join(' ')}>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Evite</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex items-start space-x-2">
                            <span className="text-rose-300 mt-1">•</span>
                            <span>Mensagens muito longas ou confusas</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-rose-300 mt-1">•</span>
                            <span>Múltiplas solicitações na mesma mensagem</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-rose-300 mt-1">•</span>
                            <span>Linguagem inadequada ou agressiva</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-rose-300 mt-1">•</span>
                            <span>Pressa excessiva nas respostas</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-rose-300 mt-1">•</span>
                            <span>Ignorar as orientações do redator</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-rose-300 mt-1">•</span>
                            <span>Compartilhar informações confidenciais por outros canais</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Suporte Técnico */}
              <section>
                <h2 className="text-3xl font-semibold text-white mb-6">Suporte Técnico</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-purple-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Headphones className="w-6 h-6 text-purple-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Quando Procurar o Suporte</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Para questões técnicas, problemas de acesso ou dúvidas sobre 
                            funcionalidades da plataforma.
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            <li>• Problemas de login ou acesso</li>
                            <li>• Dificuldades com upload de arquivos</li>
                            <li>• Falhas no sistema de chat</li>
                            <li>• Questões de faturamento</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-indigo-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Users className="w-6 h-6 text-indigo-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Canais de Suporte</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Múltiplos canais disponíveis para atendê-lo da melhor forma 
                            possível, quando precisar.
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            <li>• Chat de suporte na plataforma</li>
                            <li>• E-mail: contato@veredictajus.com</li>
                            <li>• WhatsApp: (44) 99727-1991</li>
                          </ul>
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
              onClick={() => navigate('/artigos/sistema-correcoes-revisoes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => navigate('/central-ajuda')}
            >
              Voltar para Central de Ajuda
            </Button>
          </div>
    </ArticleLayout>
  );
}