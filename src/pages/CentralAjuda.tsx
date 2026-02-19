import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Calculator, 
  MessageSquare, 
  Users,
  ChevronRight,
  BookOpen,
  Clock,
  Shield
} from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function CentralAjuda() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      icon: FileText,
      title: 'Petições',
      description: 'Como solicitar, acompanhar e receber suas petições',
      articles: 12,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      icon: Calculator,
      title: 'Calculadora',
      description: 'Guias para usar a calculadora trabalhista',
      articles: 8,
      color: 'bg-green-100 text-green-800'
    },
    {
      icon: MessageSquare,
      title: 'Chat e Comunicação',
      description: 'Como usar o chat com redatores',
      articles: 6,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      icon: Users,
      title: 'Conta e Perfil',
      description: 'Gerenciar sua conta e configurações',
      articles: 10,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const popularArticles = [
    {
      title: 'Como solicitar minha primeira petição?',
      views: '1.2k visualizações',
      category: 'Petições'
    },
    {
      title: 'Prazo de entrega das petições',
      views: '890 visualizações',
      category: 'Petições'
    },
    {
      title: 'Como usar a calculadora trabalhista?',
      views: '756 visualizações',
      category: 'Calculadora'
    },
    {
      title: 'Sistema de correções e revisões',
      views: '623 visualizações',
      category: 'Petições'
    },
    {
      title: 'Como me comunicar com o redator?',
      views: '567 visualizações',
      category: 'Chat'
    }
  ];

  const quickAnswers = [
    {
      question: 'Qual o prazo médio de entrega?',
      answer: 'Entre 24h e 7 dias, dependendo da complexidade da petição.'
    },
    {
      question: 'Posso solicitar correções?',
      answer: 'Sim, você pode solicitar revisões. O número de revisões gratuitas varia conforme o plano contratado.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Pagamento por créditos ou planos mensais. Cartão ou boleto.'
    },
    {
      question: 'Os redatores são qualificados?',
      answer: 'Todos passam por rigoroso processo de seleção e aprovação.'
    }
  ];

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6 text-orange-200" />
          <h1 className="text-5xl font-bold mb-6">
            Central de
            <br />
            <span className="text-orange-200">Ajuda</span>
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Encontre respostas para suas dúvidas e aprenda a usar todas as funcionalidades da Veredicta.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Digite sua dúvida aqui..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/5 text-white placeholder:text-slate-400 rounded-xl border border-white/10"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Categorias de Ajuda
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore os tópicos organizados por categoria
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Artigos Populares
              </h2>
              <div className="space-y-4">
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Como solicitar minha primeira petição?
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">
                            Petições
                          </span>
                          <span>1.2k visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/prazo-entrega-peticoes')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Prazo de entrega das petições
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">
                            Petições
                          </span>
                          <span>890 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Como usar a calculadora trabalhista?
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">
                            Calculadora
                          </span>
                          <span>756 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/sistema-correcoes-revisoes')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Sistema de correções e revisões
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">
                            Petições
                          </span>
                          <span>623 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/artigos/comunicar-com-redator')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Como me comunicar com o redator?
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">
                            Chat
                          </span>
                          <span>567 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Respostas Rápidas
              </h2>
              <div className="space-y-4">
                {quickAnswers.map((qa, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {qa.question}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {qa.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <p className="text-xl text-gray-600">
              Acesse rapidamente as principais funcionalidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <BookOpen className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Guia do Iniciante
                </h3>
                <p className="text-gray-600 mb-4">
                  Aprenda o básico para começar a usar a plataforma
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/guia-iniciante')}
                >
                  Ver Guia
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Status do Sistema
                </h3>
                <p className="text-gray-600 mb-4">
                  Verifique o status dos nossos serviços
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/status')}
                >
                  Ver Status
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Segurança
                </h3>
                <p className="text-gray-600 mb-4">
                  Informações sobre segurança e privacidade
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/seguranca')}
                >
                  Saber Mais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Não encontrou o que procurava?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Nossa equipe de suporte está pronta para ajudar você
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50"
              onClick={() => navigate('/contato')}
            >
              Entrar em Contato
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-orange-100 border-0 font-semibold"
              onClick={() => navigate('/auth/register')}
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}