import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Users, MessageSquare, Calculator, Settings } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';

export default function GuiaIniciante() {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      title: "Criando sua conta",
      description: "Registre-se e escolha o plano ideal para seu escritório",
      icon: Users,
      details: [
        "Acesse a página de cadastro",
        "Preencha seus dados profissionais",
        "Escolha entre os planos disponíveis",
        "Confirme seu e-mail",
        "Complete seu perfil"
      ]
    },
    {
      number: 2,
      title: "Navegando pela plataforma",
      description: "Conheça as principais funcionalidades e menus",
      icon: Settings,
      details: [
        "Dashboard principal",
        "Menu de navegação lateral",
        "Área de notificações",
        "Configurações de conta",
        "Central de ajuda"
      ]
    },
    {
      number: 3,
      title: "Solicitando sua primeira petição",
      description: "Processo completo para criar sua primeira petição",
      icon: FileText,
      details: [
        "Clique em 'Nova Petição'",
        "Selecione o tipo de petição",
        "Preencha os dados necessários",
        "Anexe documentos obrigatórios",
        "Revise e envie a solicitação"
      ]
    },
    {
      number: 4,
      title: "Comunicação com redatores",
      description: "Use o chat integrado para se comunicar",
      icon: MessageSquare,
      details: [
        "Acesse o chat da petição",
        "Envie mensagens diretas",
        "Anexe documentos no chat",
        "Receba notificações em tempo real",
        "Mantenha histórico de conversas"
      ]
    },
    {
      number: 5,
      title: "Usando a calculadora",
      description: "Aproveite nossa calculadora trabalhista",
      icon: Calculator,
      details: [
        "Acesse a calculadora no menu",
        "Selecione o tipo de cálculo",
        "Insira os dados necessários",
        "Gere relatórios automáticos",
        "Exporte para PDF ou Excel"
      ]
    }
  ];

  const tips = [
    "Mantenha seus documentos organizados em pastas digitais",
    "Responda rapidamente às mensagens dos redatores",
    "Use a calculadora para validar valores antes das petições",
    "Configure notificações para acompanhar o progresso",
    "Aproveite o período de revisão gratuita"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <div className="flex flex-nowrap items-center justify-between w-full gap-2">
            <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate('/')}>
              <img src={logoImage} alt="Veredicta" className="h-6 sm:h-8 w-auto mr-2 sm:mr-3" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">Veredicta</span>
            </div>
            <div className="flex flex-nowrap items-center gap-2 shrink-0 ml-auto">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth/login')}
                className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/central-ajuda')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Central de Ajuda
          </Button>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="p-4 bg-orange-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Guia do Iniciante
              </h1>
              <p className="text-xl text-gray-600 mt-1">
                Aprenda o básico para começar a usar a plataforma
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bem-vindo à Veredicta! ⚖️
              </h2>
              <p className="text-gray-700 leading-7 mb-6">
                A Veredicta é a plataforma líder em redação de petições trabalhistas no Brasil. 
                Este guia te ajudará a dar os primeiros passos e aproveitar ao máximo todas as 
                funcionalidades disponíveis para advogados.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                <h3 className="font-semibold text-orange-800 mb-2">🎯 O que você aprenderá:</h3>
                <ul className="text-orange-700 space-y-1">
                  <li>• Como criar e configurar sua conta</li>
                  <li>• Navegação completa pela plataforma</li>
                  <li>• Processo de solicitação de petições</li>
                  <li>• Comunicação eficiente com redatores</li>
                  <li>• Uso da calculadora trabalhista</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">{step.number}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{step.title}</h3>
                        <p className="text-orange-100">{step.description}</p>
                      </div>
                      <step.icon className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Passos detalhados:</h4>
                    <div className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <Card className="mt-8 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                💡 Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Seguindo essas dicas, você terá uma experiência muito mais eficiente:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-blue-800 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚀 Próximos Passos
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Agora que você conhece o básico, explore recursos mais avançados da plataforma 
                e comece a criar suas petições profissionais.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/auth/register')}
                >
                  Criar Minha Conta
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
                >
                  Ver Artigos Detalhados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">
                📚 Recursos Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Como solicitar primeira petição</h4>
                  <p className="text-sm text-gray-600">Guia detalhado passo-a-passo</p>
                </div>
                <div 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Calculadora trabalhista</h4>
                  <p className="text-sm text-gray-600">Tutorial completo da ferramenta</p>
                </div>
                <div 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/precos')}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Planos e preços</h4>
                  <p className="text-sm text-gray-600">Escolha o plano ideal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}