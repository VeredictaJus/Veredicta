import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Send, CheckCircle, AlertCircle } from 'lucide-react';
import ArticleLayout from '@/components/Marketing/ArticleLayout';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS } from '@/styles/marketing';

export default function ComoSolicitarPrimeiraPeticao() {
  const navigate = useNavigate();

  return (
    <ArticleLayout
      categoryLabel="Petições"
      viewsLabel="1.2k visualizações"
      readingTimeLabel="8 min de leitura"
      title="Como solicitar minha primeira petição?"
      subtitle="Guia completo para advogados iniciarem na plataforma Veredicta com confiança e eficiência."
    >
      <Card className={MARKETING_CARD_CLASS}>
        <CardContent className="p-8">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-4">Introdução</h2>
                <p className="text-slate-300 leading-7 mb-4">
                  A Veredicta é uma plataforma que conecta advogados a redatores jurídicos especializados, 
                  oferecendo uma solução eficiente para a elaboração de petições de alta qualidade. Este guia 
                  detalhado irá orientá-lo através de cada etapa do processo de solicitação da sua primeira petição.
                </p>
                <div className="bg-white/5 border border-white/10 border-l-4 border-l-orange-400 rounded-2xl p-5 mb-6">
                  <div className="flex items-start">
                    <div className="p-2 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl mr-3">
                      <AlertCircle className="w-5 h-5 text-orange-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Importante</p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Certifique-se de ter uma conta ativa e um plano contratado antes de iniciar sua primeira solicitação.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prerequisites */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-4">Pré-requisitos</h2>
                <div className="space-y-4">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1 text-lg">Conta Criada</h3>
                          <p className="text-slate-300 text-sm">Registro completo na plataforma com dados verificados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1 text-lg">Plano Ativo</h3>
                          <p className="text-slate-300 text-sm">Assinatura de um dos nossos planos (Start, Pro ou Elite)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'border-l-4 border-l-emerald-400'].join(' ')}>
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1 text-lg">Documentação Preparada</h3>
                          <p className="text-slate-300 text-sm">Documentos e informações necessárias organizados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Step by step */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Passo a Passo Detalhado</h2>
                
                {/* Step 1 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold mr-3">1</div>
                    <h3 className="text-xl font-semibold text-white">Acessar “Nova Petição”</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-slate-300 mb-3">
                      Faça login na sua conta e navegue até o painel principal. Clique no botão "Nova Petição" 
                      localizado no canto superior direito da tela.
                    </p>
                    <div className="bg-white/5 border border-white/10 border-l-4 border-l-orange-400 p-4 rounded-2xl">
                      <p className="text-sm text-slate-300">
                        <strong className="text-white">Dica:</strong> O botão "Nova Petição" também está disponível no menu lateral esquerdo 
                        para acesso rápido.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold mr-3">2</div>
                    <h3 className="text-xl font-semibold text-white">Escolher Tipo de Petição</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-slate-300 mb-3">
                      Selecione o tipo de petição que você precisa. Nossa plataforma oferece mais de 50 modelos 
                      especializados nas principais áreas do direito:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">Direito Trabalhista</h4>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• Reclamação Trabalhista</li>
                          <li>• Pedido de Horas Extras</li>
                          <li>• Rescisão Indireta</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">Direito Civil</h4>
                        <ul className="text-sm text-slate-300 space-y-1">
                          <li>• Ação de Cobrança</li>
                          <li>• Indenização por Danos</li>
                          <li>• Revisão Contratual</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold mr-3">3</div>
                    <h3 className="text-xl font-semibold text-white">Preencher Informações</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-slate-300 mb-3">
                      Complete o formulário com todas as informações necessárias. Seja detalhado e preciso:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-orange-300 mt-1" />
                        <div>
                          <h4 className="font-semibold text-white">Dados das Partes</h4>
                          <p className="text-sm text-slate-300">Nome completo, CPF/CNPJ, endereço do requerente e requerido</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-orange-300 mt-1" />
                        <div>
                          <h4 className="font-semibold text-white">Fatos Relevantes</h4>
                          <p className="text-sm text-slate-300">Descrição detalhada dos acontecimentos que motivam a ação</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-orange-300 mt-1" />
                        <div>
                          <h4 className="font-semibold text-white">Pedidos</h4>
                          <p className="text-sm text-slate-300">Especificação clara do que se pretende obter com a ação</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold mr-3">4</div>
                    <h3 className="text-xl font-semibold text-white">Anexar Documentos</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-slate-300 mb-3">
                      Faça upload de todos os documentos relevantes para sua petição:
                    </p>
                    <Card className={[MARKETING_CARD_CLASS, 'border-l-4 border-l-orange-400 mb-4'].join(' ')}>
                      <CardContent className="p-5">
                        <div className="flex items-center mb-2">
                          <div className="p-2 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl mr-3">
                            <Upload className="w-5 h-5 text-orange-300" />
                          </div>
                          <span className="font-semibold text-white text-base">Formatos Aceitos</span>
                        </div>
                        <p className="text-sm text-slate-300 ml-12">
                          PDF, DOC, DOCX, JPG, PNG (até 10MB por arquivo, máximo 20 arquivos)
                        </p>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      <p className="text-sm text-white font-semibold"><strong>Documentos Essenciais:</strong></p>
                      <ul className="text-sm text-slate-300 space-y-1 ml-4">
                        <li>• Documentos de identificação das partes</li>
                        <li>• Contratos, comprovantes ou evidências</li>
                        <li>• Correspondências relevantes</li>
                        <li>• Pareceres técnicos (se aplicável)</li>
                        <li>• Papel timbrado</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-500/15 ring-1 ring-orange-400/30 text-white rounded-full flex items-center justify-center font-semibold mr-3">5</div>
                    <h3 className="text-xl font-semibold text-white">Revisar e Enviar</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-slate-300 mb-3">
                      Antes de finalizar, revise cuidadosamente todas as informações fornecidas:
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Todas as informações estão corretas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Documentos foram anexados</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">Tipo de petição está correto</span>
                      </div>
                    </div>
                    <p className="text-slate-300">
                      Clique em "Enviar Petição" para submeter sua solicitação. Você receberá uma confirmação 
                      por email com o número de protocolo.
                    </p>
                  </div>
                </div>
              </section>

              {/* Tracking */}
              <section className="mb-8">
                <h2 className="text-3xl font-semibold text-white mb-4">Acompanhamento do Progresso</h2>
                <p className="text-slate-300 mb-4">
                  Após enviar sua petição, você pode acompanhar seu progresso em tempo real:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-orange-500/15 ring-1 ring-orange-400/30 rounded">
                          <AlertCircle className="w-4 h-4 text-orange-300" />
                        </div>
                        <h4 className="font-semibold text-white text-lg">Em Análise</h4>
                      </div>
                      <p className="text-sm text-slate-300">Redator está revisando sua solicitação</p>
                    </CardContent>
                  </Card>
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-orange-500/15 ring-1 ring-orange-400/30 rounded">
                          <FileText className="w-4 h-4 text-orange-300" />
                        </div>
                        <h4 className="font-semibold text-white text-lg">Em Produção</h4>
                      </div>
                      <p className="text-sm text-slate-300">Petição está sendo redigida</p>
                    </CardContent>
                  </Card>
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                        </div>
                        <h4 className="font-semibold text-white text-lg">Concluída</h4>
                      </div>
                      <p className="text-sm text-slate-300">Petição pronta para download</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Tips */}
              <section>
                <h2 className="text-3xl font-semibold text-white mb-4">Dicas Importantes</h2>
                <div className="space-y-4">
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-emerald-500/15 ring-1 ring-emerald-500/25 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1 text-base">Seja Detalhado</h4>
                          <p className="text-slate-300 text-sm">
                            Quanto mais informações você fornecer, melhor será a qualidade da petição elaborada.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                          <FileText className="w-5 h-5 text-orange-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1 text-base">Documentos Organizados</h4>
                          <p className="text-slate-300 text-sm">
                            Nomeie seus arquivos de forma clara e organize-os por categoria antes do upload.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl">
                          <Send className="w-5 h-5 text-orange-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1 text-base">Comunique-se</h4>
                          <p className="text-slate-300 text-sm">
                            Use o sistema de chat para esclarecer dúvidas com o redator durante o processo.
                          </p>
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
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent" onClick={() => navigate('/central-ajuda')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Central de Ajuda
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white" onClick={() => navigate('/artigos/prazo-entrega-peticoes')}>
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
    </ArticleLayout>
  );
}