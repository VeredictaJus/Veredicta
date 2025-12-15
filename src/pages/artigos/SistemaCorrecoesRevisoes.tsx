import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, FileEdit, CheckCircle, RefreshCw, MessageCircle, History } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function SistemaCorrecoesRevisoes() {
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
              Petições
            </Badge>
            <div className="flex items-center text-gray-300 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              623 visualizações
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              5 min de leitura
            </div>
          </div>
          
          {/* Título e Subtítulo */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Sistema de correções e revisões
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl font-medium">
            Entenda como funciona nosso processo de qualidade e como solicitar alterações nas suas petições.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 !bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 !bg-white" style={{ backgroundColor: '#ffffff !important' }}>
            <CardContent className="p-8 !bg-white" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
              {/* Fluxo de Qualidade */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Fluxo de Controle de Qualidade</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Redação Inicial</h3>
                      <p className="text-gray-900 mb-3 font-medium">
                        O redator especializado elabora a petição com base nas informações fornecidas e 
                        documentos anexados pelo cliente.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-700">
                          <strong>Tempo médio:</strong> 70% do prazo total é dedicado à redação inicial
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Revisão Técnica</h3>
                      <p className="text-gray-900 mb-3 font-medium">
                        Um segundo redator sênior revisa aspectos técnicos, jurisprudência aplicada e 
                        estrutura argumentativa da petição.
                      </p>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-orange-700">
                          <strong>Verificações:</strong> Fundamentação legal, coerência argumentativa, formatação
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Revisão Final</h3>
                      <p className="text-gray-900 mb-3 font-medium">
                        Verificação ortográfica, gramatical e de formatação por nossa equipe de qualidade 
                        antes da entrega ao cliente.
                      </p>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-700">
                          <strong>Garantia:</strong> 100% das petições passam por esta etapa antes da entrega
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Como Solicitar Correções */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Como Solicitar Correções</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-blue-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <FileEdit className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Método 1: Painel Web</h3>
                          <div className="space-y-2 text-sm text-gray-900 font-medium">
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

                  <Card className="border-l-4 border-l-green-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <MessageCircle className="w-6 h-6 text-green-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Método 2: Chat Direto</h3>
                          <div className="space-y-2 text-sm text-gray-900 font-medium">
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

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Dicas para Solicitações Eficientes</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Controle de Versões</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-purple-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <History className="w-6 h-6 text-purple-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Histórico Completo</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Todas as versões da petição são preservadas com timestamps e 
                            descrição das alterações realizadas.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Comparação entre versões</li>
                            <li>• Download de versões anteriores</li>
                            <li>• Log completo de mudanças</li>
                            <li>• Identificação do editor</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-indigo-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="w-6 h-6 text-indigo-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Automático</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Sistema de backup automático garante que nenhum trabalho 
                            seja perdido durante o processo de revisão.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
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
            <Button variant="outline" onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button onClick={() => navigate('/artigos/comunicar-com-redator')}>
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}