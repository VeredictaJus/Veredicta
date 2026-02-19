import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Clock, 
  Shield, 
  CheckCircle, 
  TrendingUp, 
  Users,
  ArrowRight,
  Star,
  Zap,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function CalculadoraPreview() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: 'Cálculos Automatizados',
      description: 'Interface intuitiva que calcula automaticamente verbas rescisórias, horas extras, férias e muito mais.'
    },
    {
      icon: Clock,
      title: 'Resultados Instantâneos',
      description: 'Obtenha cálculos precisos em segundos, não em horas. Economize tempo valioso em cada processo.'
    },
    {
      icon: Shield,
      title: 'Conformidade Legal',
      description: 'Sempre atualizada com a legislação trabalhista mais recente. Garante precisão e segurança jurídica.'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Detalhados',
      description: 'Gere relatórios completos com memória de cálculo para anexar às suas petições.'
    },
    {
      icon: Zap,
      title: 'Múltiplos Cálculos',
      description: 'Suporte para diversos tipos: rescisão, horas extras, insalubridade, adicional noturno e mais.'
    },
    {
      icon: Users,
      title: 'Histórico Completo',
      description: 'Mantenha um histórico de todos os cálculos realizados para consulta e auditoria.'
    }
  ];

  const calculationTypes = [
    'Verbas Rescisórias',
    'Horas Extras',
    'Adicional Noturno',
    'Insalubridade',
    'Periculosidade',
    'Férias Proporcionais',
    'Décimo Terceiro',
    'FGTS e Multa',
    'Aviso Prévio',
    'Diferenças Salariais'
  ];

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white mb-6" variant="secondary">
            Ferramenta Exclusiva
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            Calculadora Trabalhista
            <br />
            <span className="text-orange-200">Inteligente</span>
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Automatize seus cálculos trabalhistas com precisão absoluta. 
            Nossa calculadora integrada elimina erros e acelera seu trabalho jurídico.
          </p>
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-6 py-3">
              <Star className="w-5 h-5 text-yellow-300 fill-current" />
              <span className="text-white font-semibold">Usada por 1000+ advogados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header da Calculadora */}
            <Card className="mb-8 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <Calculator className="h-8 w-8 text-orange-600" />
                  <span>Calculadora Trabalhista Automatizada</span>
                </CardTitle>
                <CardDescription className="text-lg max-w-4xl mx-auto whitespace-normal break-words">
                  Calcule verbas rescisórias, horas extras, adicionais e todas as verbas trabalhistas de forma automatizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Esta calculadora utiliza os valores e legislação vigente em {new Date().getFullYear()}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">Verbas Rescisórias</h3>
                  <p className="text-sm text-gray-600">Aviso prévio, férias, 13º salário, FGTS</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">Horas Extras</h3>
                  <p className="text-sm text-gray-600">50% úteis, 100% fins de semana</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <h3 className="font-semibold">Adicionais</h3>
                  <p className="text-sm text-gray-600">Insalubridade, periculosidade, noturno</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-semibold">Desvio de Função</h3>
                  <p className="text-sm text-gray-600">Diferenças salariais e reflexos</p>
                </CardContent>
              </Card>
            </div>

            {/* Preview do Formulário em Etapas */}
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Preview da Interface</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Barra de Progresso das Etapas */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">1</div>
                      <span className="font-medium">Dados Pessoais</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">2</div>
                      <span className="font-medium">Dados Salariais</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">3</div>
                      <span className="font-medium">Jornada de Trabalho</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">4</div>
                      <span className="font-medium">Cálculos</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Preview dos Campos do Formulário */}
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nome do Trabalhador *</label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-300 text-gray-600">
                        João da Silva Santos
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">CPF *</label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-300 text-gray-600">
                        123.456.789-00
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Data de Admissão *</label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-300 text-gray-600">
                        01/03/2020
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Data de Demissão</label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-300 text-gray-600">
                        15/10/2024
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Salário Base *</label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-300 text-gray-600">
                        R$ 3.500,00
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Jornada Diária</label>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-300 text-gray-600">
                        8 horas
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview dos Resultados */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados Calculados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Aviso Prévio</span>
                        <span className="text-lg font-bold text-green-600">R$ 2.916,67</span>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Férias + 1/3</span>
                        <span className="text-lg font-bold text-green-600">R$ 1.458,33</span>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">13º Proporcional</span>
                        <span className="text-lg font-bold text-green-600">R$ 2.916,67</span>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">FGTS + Multa</span>
                        <span className="text-lg font-bold text-green-600">R$ 1.400,00</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-800">TOTAL GERAL</span>
                      <span className="text-2xl font-bold text-orange-600">R$ 8.691,67</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      disabled 
                      className="opacity-50 cursor-not-allowed"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calcular
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled 
                      className="opacity-50 cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled 
                      className="opacity-50 cursor-not-allowed"
                    >
                      Salvar Cálculo
                    </Button>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-4">
                    * Funcionalidade completa disponível apenas para usuários cadastrados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos Poderosos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra todos os recursos que tornam nossa calculadora única no mercado
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculation Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tipos de Cálculos Suportados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa calculadora cobre todos os principais cálculos trabalhistas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {calculationTypes.map((type, index) => (
              <div key={index} className="text-center">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                  <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">{type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-orange-200">Precisão nos Cálculos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-orange-200">Advogados Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-orange-200">Cálculos Realizados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Revolucionar
            <br />
            <span className="text-orange-400">Seus Cálculos Trabalhistas?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e tenha acesso imediato à calculadora mais avançada do mercado jurídico
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold shadow-lg bg-transparent"
              onClick={() => navigate('/auth/login')}
            >
              Já tenho Conta
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span>Setup em 2 minutos</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}