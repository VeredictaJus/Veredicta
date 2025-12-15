import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, MessageCircle, Users, Shield, Headphones, Bell } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function ComunicarComRedator() {
  const navigate = useNavigate();

  // Forçar modo claro na página
  useEffect(() => {
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Forçar modo claro
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Forçar variáveis CSS para modo claro
    root.style.setProperty('--background', '0 0% 100%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--foreground', '222.2 84% 4.9%');
    
    // Restaurar tema original ao desmontar
    return () => {
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--foreground');
      root.classList.remove('light');
      if (originalTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header - Modo Noturno */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
          {/* Logo e Botões de Login */}
          <div className="flex flex-nowrap items-center justify-between w-full gap-4 mb-6">
            <Logo textColor="light" size="lg" className="shrink-0" />
            <div className="flex flex-nowrap items-center gap-2 shrink-0">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth/login')}
                className="bg-transparent text-white border-gray-600 hover:bg-gray-800 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Cadastrar
              </Button>
            </div>
          </div>

          {/* Botão Voltar */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/central-ajuda')}
            className="mb-4 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Central de Ajuda
          </Button>
          
          {/* Badge e Informações */}
          <div className="flex items-center gap-4 mb-4">
            <Badge className="bg-orange-600 text-white">
              Chat
            </Badge>
            <div className="flex items-center text-gray-300 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              567 visualizações
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              4 min de leitura
            </div>
          </div>
          
          {/* Título e Subtítulo */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Como me comunicar com o redator?
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl font-medium">
            Guia completo para uma comunicação eficiente e produtiva com nossos redatores especializados.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 !bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 !bg-white" style={{ backgroundColor: '#ffffff !important' }}>
            <CardContent className="p-8 !bg-white" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
              {/* Sistema de Chat */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Sistema de Chat Integrado</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-blue-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <MessageCircle className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Chat em Tempo Real</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Comunicação instantânea com o redator responsável pela sua petição, 
                            com notificações em tempo real.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Mensagens instantâneas</li>
                            <li>• Indicadores de leitura</li>
                            <li>• Histórico completo</li>
                            <li>• Anexos de arquivos</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <Shield className="w-6 h-6 text-green-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacidade Total</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Todas as conversas são criptografadas e mantidas em sigilo absoluto, 
                            respeitando o sigilo profissional.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Horários de Atendimento</h2>
                
                <div className="space-y-4">
                  <Card className="!bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilidade dos Redatores</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Horário Comercial</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Segunda a Sexta:</span>
                              <span className="font-medium">9h às 18h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sábados:</span>
                              <span className="font-medium">8h às 12h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Domingos:</span>
                              <span className="font-medium text-gray-400">Não atendemos</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Tempo de Resposta</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Horário comercial:</span>
                              <span className="font-medium text-green-600">15-30 minutos</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fora do horário:</span>
                              <span className="font-medium text-orange-600">2-4 horas</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fins de semana:</span>
                              <span className="font-medium text-gray-600">Próximo dia útil</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex items-start">
                      <Bell className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Planos Premium e Enterprise</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Clientes dos planos Premium e Enterprise têm acesso a redatores com horário 
                          estendido (8h às 22h) e tempo de resposta prioritário (5-15 minutos).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tipos de Mensagem */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Tipos de Comunicação</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-t-4 border-t-green-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Esclarecimentos</h3>
                      <p className="text-gray-900 text-sm mb-3 font-medium">
                        Dúvidas sobre o processo, prazos, documentos necessários ou 
                        andamento da petição.
                      </p>
                      <div className="text-xs text-gray-600">
                        <p><strong>Exemplos:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• "Qual o prazo previsto?"</li>
                          <li>• "Preciso de mais documentos?"</li>
                          <li>• "Como está o andamento?"</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-t-4 border-t-orange-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Correções</h3>
                      <p className="text-gray-900 text-sm mb-3 font-medium">
                        Solicitações de alterações específicas no conteúdo, 
                        argumentação ou estrutura da petição.
                      </p>
                      <div className="text-xs text-gray-600">
                        <p><strong>Exemplos:</strong></p>
                        <ul className="mt-1 space-y-1">
                          <li>• "Alterar o valor do pedido"</li>
                          <li>• "Incluir jurisprudência X"</li>
                          <li>• "Ajustar argumentação Y"</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-t-4 border-t-blue-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Adicionais</h3>
                      <p className="text-gray-900 text-sm mb-3 font-medium">
                        Complementação de dados, novos documentos ou 
                        informações que surgiram após o início.
                      </p>
                      <div className="text-xs text-gray-600">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Boas Práticas de Comunicação</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-green-50 border-green-200 !bg-white">
                      <CardContent className="p-6 !bg-white">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">✓ Recomendações</h3>
                        <ul className="space-y-2 text-sm text-green-800 font-medium">
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Seja específico e direto ao ponto</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Forneça contexto quando necessário</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Use linguagem profissional e respeitosa</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Anexe documentos quando relevante</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Confirme o recebimento de informações</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Mantenha um registro das conversas</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200 !bg-white">
                      <CardContent className="p-6 !bg-white">
                        <h3 className="text-lg font-semibold text-red-800 mb-4">✗ Evite</h3>
                        <ul className="space-y-2 text-sm text-red-800 font-medium">
                          <li className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Mensagens muito longas ou confusas</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Múltiplas solicitações na mesma mensagem</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Linguagem inadequada ou agressiva</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Pressa excessiva nas respostas</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>Ignorar as orientações do redator</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Suporte Técnico</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-purple-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <Headphones className="w-6 h-6 text-purple-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quando Procurar o Suporte</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Para questões técnicas, problemas de acesso ou dúvidas sobre 
                            funcionalidades da plataforma.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Problemas de login ou acesso</li>
                            <li>• Dificuldades com upload de arquivos</li>
                            <li>• Falhas no sistema de chat</li>
                            <li>• Questões de faturamento</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-indigo-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <Users className="w-6 h-6 text-indigo-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Canais de Suporte</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Múltiplos canais disponíveis para atendê-lo da melhor forma 
                            possível, quando precisar.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
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
            <Button variant="outline" onClick={() => navigate('/artigos/sistema-correcoes-revisoes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button variant="outline" onClick={() => navigate('/central-ajuda')}>
              Voltar para Central de Ajuda
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}