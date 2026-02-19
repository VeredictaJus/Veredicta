import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
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
import MarketingHero from '@/components/Marketing/MarketingHero';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, MARKETING_SECTION_ALT_CLASS, MARKETING_SECTION_CLASS } from '@/styles/marketing';

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
      <MarketingHero
        eyebrow="Central de Ajuda"
        title={
          <>
            Central de <br />
            <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Ajuda
            </span>
          </>
        }
        subtitle="Encontre respostas para suas dúvidas e aprenda a usar todas as funcionalidades da Veredicta."
      >
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Digite sua dúvida aqui..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg bg-white/5 text-white placeholder:text-slate-400 rounded-2xl border border-white/10 shadow-xl"
          />
        </div>
      </MarketingHero>

      {/* Categories */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
              Categorias de Ajuda
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Explore os tópicos organizados por categoria
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500/15 ring-1 ring-orange-400/30 flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-8 h-8 text-orange-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-slate-300 mb-4">
                    {category.description}
                  </p>
                  <div className="text-sm text-slate-400">
                    {category.articles} artigos
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white mb-8">
                Artigos Populares
              </h2>
              <div className="space-y-4">
                <Card 
                  className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'cursor-pointer'].join(' ')}
                  onClick={() => navigate('/artigos/como-solicitar-primeira-peticao')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Como solicitar minha primeira petição?
                        </h3>
                        <div className="flex items-center text-sm text-slate-400">
                          <span className="px-2 py-1 bg-orange-500/15 text-orange-200 border border-orange-500/25 rounded-md text-xs mr-2">
                            Petições
                          </span>
                          <span>1.2k visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'cursor-pointer'].join(' ')}
                  onClick={() => navigate('/artigos/prazo-entrega-peticoes')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Prazo de entrega das petições
                        </h3>
                        <div className="flex items-center text-sm text-slate-400">
                          <span className="px-2 py-1 bg-orange-500/15 text-orange-200 border border-orange-500/25 rounded-md text-xs mr-2">
                            Petições
                          </span>
                          <span>890 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'cursor-pointer'].join(' ')}
                  onClick={() => navigate('/artigos/como-usar-calculadora-trabalhista')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Como usar a calculadora trabalhista?
                        </h3>
                        <div className="flex items-center text-sm text-slate-400">
                          <span className="px-2 py-1 bg-orange-500/15 text-orange-200 border border-orange-500/25 rounded-md text-xs mr-2">
                            Calculadora
                          </span>
                          <span>756 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'cursor-pointer'].join(' ')}
                  onClick={() => navigate('/artigos/sistema-correcoes-revisoes')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Sistema de correções e revisões
                        </h3>
                        <div className="flex items-center text-sm text-slate-400">
                          <span className="px-2 py-1 bg-orange-500/15 text-orange-200 border border-orange-500/25 rounded-md text-xs mr-2">
                            Petições
                          </span>
                          <span>623 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'cursor-pointer'].join(' ')}
                  onClick={() => navigate('/artigos/comunicar-com-redator')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Como me comunicar com o redator?
                        </h3>
                        <div className="flex items-center text-sm text-slate-400">
                          <span className="px-2 py-1 bg-orange-500/15 text-orange-200 border border-orange-500/25 rounded-md text-xs mr-2">
                            Chat
                          </span>
                          <span>567 visualizações</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white mb-8">
                Respostas Rápidas
              </h2>
              <div className="space-y-4">
                {quickAnswers.map((qa, index) => (
                  <Card key={index} className={MARKETING_CARD_CLASS}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2">
                        {qa.question}
                      </h3>
                      <p className="text-slate-300 text-sm">
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
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
              Ações Rápidas
            </h2>
            <p className="text-xl text-slate-300">
              Acesse rapidamente as principais funcionalidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'text-center'].join(' ')}>
              <CardContent className="p-6">
                <BookOpen className="w-12 h-12 text-orange-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Guia do Iniciante
                </h3>
                <p className="text-slate-300 mb-4">
                  Aprenda o básico para começar a usar a plataforma
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => navigate('/guia-iniciante')}
                >
                  Ver Guia
                </Button>
              </CardContent>
            </Card>

            <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'text-center'].join(' ')}>
              <CardContent className="p-6">
                <Clock className="w-12 h-12 text-orange-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Status do Sistema
                </h3>
                <p className="text-slate-300 mb-4">
                  Verifique o status dos nossos serviços
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => navigate('/status')}
                >
                  Ver Status
                </Button>
              </CardContent>
            </Card>

            <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'text-center'].join(' ')}>
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-orange-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Segurança
                </h3>
                <p className="text-slate-300 mb-4">
                  Informações sobre segurança e privacidade
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
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
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-3">
            Não encontrou o que procurava?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Nossa equipe de suporte está pronta para ajudar você
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white border-0"
              onClick={() => navigate('/contato')}
            >
              Entrar em Contato
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent font-semibold"
              onClick={() => navigate('/solicitar-demonstracao')}
            >
              Solicitar demonstração
            </Button>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}