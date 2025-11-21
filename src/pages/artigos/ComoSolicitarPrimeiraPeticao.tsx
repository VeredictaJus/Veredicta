import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, FileText, Upload, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function ComoSolicitarPrimeiraPeticao() {
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
              1.2k visualizações
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              8 min de leitura
            </div>
          </div>
          
          {/* Título e Subtítulo */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Como solicitar minha primeira petição?
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl font-medium">
            Guia completo para advogados iniciarem na plataforma Veredicta com confiança e eficiência.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0" style={{ backgroundColor: '#ffffff' }}>
            <CardContent className="p-8" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Introdução</h2>
                <p className="text-gray-900 leading-7 mb-4 font-medium">
                  A Veredicta é uma plataforma que conecta advogados a redatores jurídicos especializados, 
                  oferecendo uma solução eficiente para a elaboração de petições de alta qualidade. Este guia 
                  detalhado irá orientá-lo através de cada etapa do processo de solicitação da sua primeira petição.
                </p>
                <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-r-lg p-5 mb-6 shadow-sm">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-blue-900 font-semibold mb-1">Importante</p>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        Certifique-se de ter uma conta ativa e um plano contratado antes de iniciar sua primeira solicitação.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prerequisites */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pré-requisitos</h2>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow" style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-5" style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">Conta Criada</h3>
                          <p className="text-gray-800 text-sm font-medium">Registro completo na plataforma com dados verificados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow" style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-5" style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">Plano Ativo</h3>
                          <p className="text-gray-800 text-sm font-medium">Assinatura de um dos nossos planos (Free, Start, Pro ou Elite)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow" style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-5" style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">Documentação Preparada</h3>
                          <p className="text-gray-800 text-sm font-medium">Documentos e informações necessárias para a petição organizados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Step by step */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Passo a Passo Detalhado</h2>
                
                {/* Step 1 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                    <h3 className="text-xl font-bold text-gray-900">Acessar "Nova Petição"</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Faça login na sua conta e navegue até o painel principal. Clique no botão "Nova Petição" 
                      localizado no canto superior direito da tela.
                    </p>
                    <div className="bg-orange-50 border-l-4 border-l-orange-400 p-4 rounded-r-lg shadow-sm">
                      <p className="text-sm text-orange-800">
                        <strong className="text-orange-900">💡 Dica:</strong> O botão "Nova Petição" também está disponível no menu lateral esquerdo 
                        para acesso rápido.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                    <h3 className="text-xl font-bold text-gray-900">Escolher Tipo de Petição</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Selecione o tipo de petição que você precisa. Nossa plataforma oferece mais de 50 modelos 
                      especializados nas principais áreas do direito:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Direito Trabalhista</h4>
                        <ul className="text-sm text-gray-800 space-y-1 font-medium">
                          <li>• Reclamação Trabalhista</li>
                          <li>• Pedido de Horas Extras</li>
                          <li>• Rescisão Indireta</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Direito Civil</h4>
                        <ul className="text-sm text-gray-800 space-y-1 font-medium">
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
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                    <h3 className="text-xl font-bold text-gray-900">Preencher Informações</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Complete o formulário com todas as informações necessárias. Seja detalhado e preciso:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-orange-600 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900">Dados das Partes</h4>
                          <p className="text-sm text-gray-800 font-medium">Nome completo, CPF/CNPJ, endereço do requerente e requerido</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-orange-600 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900">Fatos Relevantes</h4>
                          <p className="text-sm text-gray-800 font-medium">Descrição detalhada dos acontecimentos que motivam a ação</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-orange-600 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900">Pedidos</h4>
                          <p className="text-sm text-gray-800 font-medium">Especificação clara do que se pretende obter com a ação</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</div>
                    <h3 className="text-xl font-bold text-gray-900">Anexar Documentos</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Faça upload de todos os documentos relevantes para sua petição:
                    </p>
                    <Card className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-l-blue-500 mb-4 shadow-sm " style={{ backgroundColor: '#ffffff' }}>
                      <CardContent className="p-5 " style={{ backgroundColor: '#ffffff' }}>
                        <div className="flex items-center mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-900 text-base">Formatos Aceitos</span>
                        </div>
                        <p className="text-sm text-gray-900 ml-12 font-medium">
                          PDF, DOC, DOCX, JPG, PNG (até 10MB por arquivo, máximo 20 arquivos)
                        </p>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 font-bold"><strong>Documentos Essenciais:</strong></p>
                      <ul className="text-sm text-gray-800 space-y-1 ml-4 font-medium">
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
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">5</div>
                    <h3 className="text-xl font-bold text-gray-900">Revisar e Enviar</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Antes de finalizar, revise cuidadosamente todas as informações fornecidas:
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">Todas as informações estão corretas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">Documentos foram anexados</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">Tipo de petição está correto</span>
                      </div>
                    </div>
                    <p className="text-gray-900 font-medium">
                      Clique em "Enviar Petição" para submeter sua solicitação. Você receberá uma confirmação 
                      por email com o número de protocolo.
                    </p>
                  </div>
                </div>
              </section>

              {/* Tracking */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Acompanhamento do Progresso</h2>
                <p className="text-gray-900 mb-4 font-medium">
                  Após enviar sua petição, você pode acompanhar seu progresso em tempo real:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-4 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-yellow-100 rounded">
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                        <h4 className="font-bold text-yellow-900 text-lg">Em Análise</h4>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">Redator está revisando sua solicitação</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-4 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-blue-100 rounded">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-blue-900 text-lg">Em Produção</h4>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">Petição está sendo redigida</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-4 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 bg-green-100 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="font-bold text-green-900 text-lg">Concluída</h4>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">Petição pronta para download</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Tips */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Dicas Importantes</h2>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-4 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-green-900 mb-1 text-base">Seja Detalhado</h4>
                          <p className="text-green-800 text-sm font-medium">
                            Quanto mais informações você fornecer, melhor será a qualidade da petição elaborada.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-4 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-900 mb-1 text-base">Documentos Organizados</h4>
                          <p className="text-blue-800 text-sm font-medium">
                            Nomeie seus arquivos de forma clara e organize-os por categoria antes do upload.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-4 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Send className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-900 mb-1 text-base">Comunique-se</h4>
                          <p className="text-orange-800 text-sm font-medium">
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
            <Button variant="outline" onClick={() => navigate('/central-ajuda')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Central de Ajuda
            </Button>
            <Button onClick={() => navigate('/artigos/prazo-entrega-peticoes')}>
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}