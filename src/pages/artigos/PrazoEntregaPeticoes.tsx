import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, AlertTriangle, CheckCircle, Zap, Shield } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function PrazoEntregaPeticoes() {
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
              890 visualizações
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              6 min de leitura
            </div>
          </div>
          
          {/* Título e Subtítulo */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Prazo de entrega das petições
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl font-medium">
            Entenda nossos SLAs, políticas de prazo e como garantir entregas pontuais para seus clientes.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 " style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0 " style={{ backgroundColor: '#ffffff' }}>
            <CardContent className="p-8 " style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
              {/* SLAs por Plano */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-950 mb-6">SLAs por Plano de Assinatura</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-green-950">Free</h3>
                        <Badge className="bg-green-500 text-white border-green-600 font-semibold">Gratuito</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-green-800 font-medium">Petições:</span>
                          <span className="font-bold text-green-900">3-5 dias úteis</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-green-800 font-medium">Revisões:</span>
                          <span className="font-bold text-green-900">3-5 dias úteis</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <p className="text-xs text-green-700 text-center">1 petição gratuita</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-blue-950">Start</h3>
                        <Badge className="bg-blue-600 text-white border-blue-700 font-semibold">Básico</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-blue-800 font-medium">Petições:</span>
                          <span className="font-bold text-blue-900">Até 3 dias úteis</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-blue-800 font-medium">Revisões:</span>
                          <span className="font-bold text-blue-900">Até 3 dias úteis</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <p className="text-xs text-blue-700 text-center">4 petições incluídas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-purple-950">Pro</h3>
                        <Badge className="bg-orange-500 text-white border-orange-600 font-semibold">Mais Popular</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-purple-800 font-medium">Petições:</span>
                          <span className="font-bold text-purple-900">Até 2 dias úteis</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-purple-800 font-medium">Revisões:</span>
                          <span className="font-bold text-purple-900">Até 2 dias úteis</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-purple-200">
                          <p className="text-xs text-purple-700 text-center">14 petições incluídas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-orange-950">Elite</h3>
                        <Badge className="bg-orange-600 text-white border-orange-700 font-semibold">Premium</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-orange-800 font-medium">Petições:</span>
                          <span className="font-bold text-orange-900">Até 1 dia útil</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-white/70">
                          <span className="text-orange-800 font-medium">Revisões:</span>
                          <span className="font-bold text-orange-900">Até 1 dia útil</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-orange-200">
                          <p className="text-xs text-orange-700 text-center">70 petições incluídas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Tipos de Urgência */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-950 mb-6">Tipos de Urgência</h2>
                
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900 mb-2">Normal</h3>
                          <p className="text-gray-900 mb-3 font-medium">
                            Solicitações dentro do prazo padrão do seu plano. Ideal para casos sem urgência específica.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Badge className="bg-green-100 text-green-700 border-green-300">Sem custo adicional</Badge>
                            <Badge className="bg-green-100 text-green-700 border-green-300">Melhor qualidade</Badge>
                            <Badge className="bg-green-100 text-green-700 border-green-300">Todos os planos</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Urgente</h3>
                          <p className="text-gray-900 mb-3 font-medium">
                            Redução de 50% no prazo padrão. Para casos com prazos processuais apertados.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Taxa +30%</Badge>
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Planos Pro+</Badge>
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Prioridade</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-900 mb-2">Emergencial</h3>
                          <p className="text-gray-900 mb-3 font-medium">
                            Entrega em até 24 horas. Para situações críticas com prazos fatais iminentes.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Badge className="bg-red-100 text-red-700 border-red-300">Taxa +100%</Badge>
                            <Badge className="bg-red-100 text-red-700 border-red-300">Premium+</Badge>
                            <Badge className="bg-red-100 text-red-700 border-red-300">Máxima prioridade</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Garantias */}
              <section>
                <h2 className="text-3xl font-bold text-gray-950 mb-6">Nossas Garantias</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900 mb-2">Garantia de Prazo</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Se não entregarmos no prazo prometido, você recebe desconto de 20% 
                            na próxima petição ou reembolso parcial.
                          </p>
                          <Badge className="bg-green-500 text-white border-green-600">SLA Garantido</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-shadow " style={{ backgroundColor: '#ffffff' }}>
                    <CardContent className="p-6 " style={{ backgroundColor: '#ffffff' }}>
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">Garantia de Qualidade</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Todas as petições passam por revisão técnica e jurídica 
                            antes da entrega final ao cliente.
                          </p>
                          <Badge className="bg-blue-500 text-white border-blue-600">Qualidade Assegurada</Badge>
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
            <Button variant="outline" onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}>
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}