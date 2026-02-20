import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import MarketingHero from '@/components/Marketing/MarketingHero';
import { MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, MARKETING_SECTION_ALT_CLASS, MARKETING_SECTION_CLASS } from '@/styles/marketing';

export default function CalculadoraPreview() {
  const navigate = useNavigate();

  const SOCIAL_PROOF_LABEL = 'Usada por 120+ advogados';

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
      <MarketingHero
        eyebrow="Ferramenta"
        title={
          <>
            Calculadora Trabalhista <br />
            <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Inteligente
            </span>
          </>
        }
        subtitle={
          <>
            Automatize seus cálculos trabalhistas com precisão absoluta.
            <br />
            Nossa calculadora integrada elimina erros e acelera seu trabalho jurídico.
          </>
        }
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-3 shadow-xl">
            <Star className="w-5 h-5 text-orange-300" />
            <span className="text-white font-semibold">{SOCIAL_PROOF_LABEL}</span>
          </div>
        </div>
      </MarketingHero>

      {/* Calculator Preview */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header da Calculadora */}
            <Card className={[MARKETING_CARD_CLASS, 'mb-8'].join(' ')}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl text-white">
                  <Calculator className="h-8 w-8 text-orange-300" />
                  <span>Calculadora Trabalhista Automatizada</span>
                </CardTitle>
                <CardDescription className="text-lg max-w-4xl mx-auto whitespace-normal break-words text-slate-300">
                  Calcule verbas rescisórias, horas extras, adicionais e todas as verbas trabalhistas de forma automatizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-300" />
                    <p className="text-sm text-slate-200">
                      <strong>Importante:</strong> Esta calculadora utiliza os valores e legislação vigente em {new Date().getFullYear()}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-4 text-center text-slate-100">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <h3 className="font-semibold text-white">Verbas Rescisórias</h3>
                  <p className="text-sm text-slate-300">Aviso prévio, férias, 13º salário, FGTS</p>
                </CardContent>
              </Card>
              
              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-4 text-center text-slate-100">
                  <Calculator className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <h3 className="font-semibold text-white">Horas Extras</h3>
                  <p className="text-sm text-slate-300">50% úteis, 100% fins de semana</p>
                </CardContent>
              </Card>
              
              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-4 text-center text-slate-100">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <h3 className="font-semibold text-white">Adicionais</h3>
                  <p className="text-sm text-slate-300">Insalubridade, periculosidade, noturno</p>
                </CardContent>
              </Card>
              
              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-4 text-center text-slate-100">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                  <h3 className="font-semibold text-white">Desvio de Função</h3>
                  <p className="text-sm text-slate-300">Diferenças salariais e reflexos</p>
                </CardContent>
              </Card>
            </div>

            {/* Preview do Formulário em Etapas */}
            <Card className={[MARKETING_CARD_CLASS, 'shadow-2xl'].join(' ')}>
              <CardHeader className="bg-white/5 border-b border-white/10 text-white rounded-t-2xl">
                <CardTitle className="text-xl text-white">Preview da Interface</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Barra de Progresso das Etapas */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">1</div>
                      <span className="font-medium text-slate-200">Dados Pessoais</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">2</div>
                      <span className="font-medium text-slate-200">Dados Salariais</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">3</div>
                      <span className="font-medium text-slate-200">Jornada de Trabalho</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">4</div>
                      <span className="font-medium text-slate-200">Cálculos</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Preview dos Campos do Formulário */}
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Nome do Trabalhador *</label>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-300">
                        João da Silva Santos
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">CPF *</label>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-300">
                        123.456.789-00
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Data de Admissão *</label>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-300">
                        01/03/2020
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Data de Demissão</label>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-300">
                        15/10/2024
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Salário Base *</label>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-300">
                        R$ 3.500,00
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Jornada Diária</label>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-300">
                        8 horas
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview dos Resultados */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Resultados Calculados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-200">Aviso Prévio</span>
                        <span className="text-lg font-semibold text-emerald-200">R$ 2.916,67</span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-200">Férias + 1/3</span>
                        <span className="text-lg font-semibold text-emerald-200">R$ 1.458,33</span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-200">13º Proporcional</span>
                        <span className="text-lg font-semibold text-emerald-200">R$ 2.916,67</span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-200">FGTS + Multa</span>
                        <span className="text-lg font-semibold text-emerald-200">R$ 1.400,00</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/25">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-orange-200">TOTAL GERAL</span>
                      <span className="text-2xl font-semibold text-orange-200">R$ 8.691,67</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-8 pt-6 border-t border-white/10">
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
                  <p className="text-center text-slate-400 text-sm mt-4">
                    * Funcionalidade completa disponível apenas para usuários cadastrados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Recursos Poderosos</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Descubra todos os recursos que tornam nossa calculadora única no mercado
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'text-center'].join(' ')}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-orange-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculation Types */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">Tipos de Cálculos Suportados</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Nossa calculadora cobre todos os principais cálculos trabalhistas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {calculationTypes.map((type, index) => (
              <div key={index} className="text-center">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <CheckCircle className="w-6 h-6 text-orange-300 mx-auto mb-2" />
                  <span className="text-sm font-medium text-white">{type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto">
            <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-8'].join(' ')}>
              <div className="text-4xl font-semibold mb-2 text-white">99.9%</div>
              <div className="text-slate-300">Precisão nos Cálculos</div>
            </div>
            <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-8'].join(' ')}>
              <div className="text-4xl font-semibold mb-2 text-white">120+</div>
              <div className="text-slate-300">Advogados Ativos</div>
            </div>
            <div className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS, 'p-8'].join(' ')}>
              <div className="text-4xl font-semibold mb-2 text-white">3K+</div>
              <div className="text-slate-300">Cálculos Realizados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative overflow-hidden py-20 bg-slate-950 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.12),transparent_55%)]" />
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Revolucionar
            <br />
            <span className="text-orange-400">Seus Cálculos Trabalhistas?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e tenha acesso imediato à calculadora mais avançada do mercado jurídico
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-4 text-lg shadow-[0_10px_30px_rgba(249,115,22,0.18)]"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold bg-transparent"
              onClick={() => navigate('/solicitar-demonstracao')}
            >
              Solicitar demonstração
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-slate-400">
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