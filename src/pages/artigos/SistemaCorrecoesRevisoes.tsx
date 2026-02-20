import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileEdit, CheckCircle, MessageCircle, History, AlertCircle } from 'lucide-react';
import ArticleLayout from '@/components/Marketing/ArticleLayout';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS } from '@/styles/marketing';

export default function SistemaCorrecoesRevisoes() {
  const navigate = useNavigate();

  return (
    <ArticleLayout
      categoryLabel="Petições"
      viewsLabel="623 visualizações"
      readingTimeLabel="5 min de leitura"
      title="Sistema de correções e revisões"
      subtitle="Entenda como funciona nosso processo de qualidade e como solicitar alterações nas suas petições."
    >
      <Card className={MARKETING_CARD_CLASS}>
        <CardContent className="p-8">
              {/* Fluxo de Qualidade */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Fluxo de Controle de Qualidade</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Redação Inicial</h3>
                      <p className="text-slate-300 mb-3">
                        O redator especializado elabora a petição com base nas informações fornecidas e 
                        documentos anexados pelo cliente.
                      </p>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-sm text-slate-300">
                          <strong className="text-white">Tempo médio:</strong> 70% do prazo total é dedicado à redação inicial
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Revisão Técnica</h3>
                      <p className="text-slate-300 mb-3">
                        Um segundo redator sênior revisa aspectos técnicos, jurisprudência aplicada e 
                        estrutura argumentativa da petição.
                      </p>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-sm text-slate-300">
                          <strong className="text-white">Verificações:</strong> Fundamentação legal, coerência argumentativa, formatação
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-500/15 ring-1 ring-emerald-500/25 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Revisão Final</h3>
                      <p className="text-slate-300 mb-3">
                        Verificação ortográfica, gramatical e de formatação por nossa equipe de qualidade 
                        antes da entrega ao cliente.
                      </p>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-sm text-slate-300">
                          <strong className="text-white">Garantia:</strong> 100% das petições passam por esta etapa antes da entrega
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Como Solicitar Correções */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Como Solicitar Correções</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-orange-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <FileEdit className="w-6 h-6 text-orange-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Método 1: Painel Web</h3>
                          <div className="space-y-2 text-sm text-slate-300 font-medium">
                            <p>1. Acesse "Minhas Petições"</p>
                            <p>2. Clique na petição desejada</p>
                            <p>3. Botão "Solicitar Correção"</p>
                            <p>4. Descreva as alterações</p>
                            <p>5. Envie a solicitação</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <MessageCircle className="w-6 h-6 text-emerald-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Método 2: Chat Direto</h3>
                          <div className="space-y-2 text-sm text-slate-300 font-medium">
                            <p>1. Abra o chat da petição</p>
                            <p>2. Comunique-se com o redator</p>
                            <p>3. Detalhe as mudanças</p>
                            <p>4. Aguarde confirmação</p>
                            <p>5. Acompanhe o progresso</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 bg-white/5 border border-white/10 border-l-4 border-l-orange-400 p-4 rounded-2xl">
                  <h4 className="font-semibold text-white mb-2">Dicas para Solicitações Eficientes</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Seja específico sobre o que precisa ser alterado</li>
                    <li>• Indique a seção ou parágrafo exato</li>
                    <li>• Forneça a redação desejada quando possível</li>
                    <li>• Anexe documentos adicionais se necessário</li>
                    <li>• Mantenha o tom profissional e respeitoso</li>
                  </ul>
                </div>
              </section>

              {/* Controle de Versões */}
              <section>
                <h2 className="text-3xl font-semibold text-white mb-6">Controle de Versões</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-purple-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <History className="w-6 h-6 text-purple-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Histórico Completo</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Todas as versões da petição são preservadas com timestamps e 
                            descrição das alterações realizadas.
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            <li>• Comparação entre versões</li>
                            <li>• Download de versões anteriores</li>
                            <li>• Log completo de mudanças</li>
                            <li>• Identificação do editor</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-indigo-400'].join(' ')}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="w-6 h-6 text-indigo-300 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Backup Automático</h3>
                          <p className="text-slate-300 text-sm mb-3">
                            Sistema de backup automático garante que nenhum trabalho 
                            seja perdido durante o processo de revisão.
                          </p>
                          <ul className="text-xs text-slate-300 space-y-1">
                            <li>• Salvamento automático a cada alteração</li>
                            <li>• Recuperação de versões perdidas</li>
                            <li>• Sincronização em tempo real</li>
                            <li>• Proteção contra perda de dados</li>
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
              onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
              onClick={() => navigate('/artigos/comunicar-com-redator')}
            >
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
    </ArticleLayout>
  );
}