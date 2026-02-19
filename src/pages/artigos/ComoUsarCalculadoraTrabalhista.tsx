import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calculator, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function ComoUsarCalculadoraTrabalhista() {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <section className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-10 max-w-screen-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/central-ajuda')}
            className="mb-6 text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Central de Ajuda
          </Button>

          <div className="flex items-center gap-4 mb-5">
            <Badge className="bg-orange-500/15 text-orange-200 border border-orange-500/30">Calculadora</Badge>
            <div className="flex items-center text-slate-300 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              756 visualizações
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              7 min de leitura
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Como usar a calculadora trabalhista?</h1>
          <p className="text-lg text-slate-300 max-w-3xl">
            Tutorial completo para dominar nossa ferramenta de cálculos trabalhistas e otimizar seu tempo.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Introdução à Calculadora</h2>
                <p className="text-gray-900 leading-7 mb-4 font-medium">
                  A Calculadora Trabalhista da Veredicta é uma ferramenta poderosa que automatiza cálculos 
                  complexos do direito do trabalho, garantindo precisão e agilidade para advogados trabalhistas. 
                  Nossa calculadora está sempre atualizada com as últimas alterações da legislação.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex items-start">
                    <Calculator className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium">Acesso à Ferramenta</p>
                      <p className="text-blue-700 text-sm">
                        A calculadora está disponível em todos os planos e pode ser acessada pelo menu principal 
                        ou através do link direto no painel do usuário.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tipos de Cálculos */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Tipos de Cálculos Disponíveis</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-green-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Rescisão de Contrato</h3>
                      <ul className="text-sm text-gray-800 space-y-2 font-medium">
                        <li>• Aviso prévio indenizado</li>
                        <li>• Saldo de salário</li>
                        <li>• 13º salário proporcional</li>
                        <li>• Férias proporcionais + 1/3</li>
                        <li>• FGTS + multa de 40%</li>
                        <li>• Seguro desemprego</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Horas Extras</h3>
                      <ul className="text-sm text-gray-800 space-y-2 font-medium">
                        <li>• Horas extras 50%</li>
                        <li>• Horas extras 100%</li>
                        <li>• Adicional noturno</li>
                        <li>• Reflexos em DSR</li>
                        <li>• Reflexos em férias</li>
                        <li>• Reflexos em 13º salário</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Férias</h3>
                      <ul className="text-sm text-gray-800 space-y-2 font-medium">
                        <li>• Férias simples</li>
                        <li>• Férias em dobro</li>
                        <li>• Férias proporcionais</li>
                        <li>• Abono constitucional</li>
                        <li>• Terço constitucional</li>
                        <li>• Férias coletivas</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Outros Cálculos</h3>
                      <ul className="text-sm text-gray-800 space-y-2 font-medium">
                        <li>• Equiparação salarial</li>
                        <li>• Diferenças de função</li>
                        <li>• Adicionais de periculosidade</li>
                        <li>• Adicionais de insalubridade</li>
                        <li>• Estabilidades especiais</li>
                        <li>• Indenizações diversas</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Passo a Passo */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Tutorial Passo a Passo</h2>
                
                {/* Step 1 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                    <h3 className="text-xl font-bold text-gray-900">Acessar a Calculadora</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      No painel principal, clique em "Calculadora Trabalhista" no menu lateral esquerdo 
                      ou use o ícone de calculadora na barra superior.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Atalho:</strong> Use Ctrl+K para abrir a busca rápida e digite "calculadora".
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                    <h3 className="text-xl font-bold text-gray-900">Selecionar Tipo de Cálculo</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Na tela inicial, escolha o tipo de cálculo que deseja realizar. 
                      Use os filtros por categoria para encontrar rapidamente:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 p-3 rounded">
                        <h4 className="font-medium text-green-800">Rescisão</h4>
                        <p className="text-xs text-green-600">Cálculos de fim de contrato</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium text-blue-800">Verbas</h4>
                        <p className="text-xs text-blue-600">Horas extras, férias, 13º</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <h4 className="font-medium text-orange-800">Adicionais</h4>
                        <p className="text-xs text-orange-600">Periculosidade, insalubridade</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                    <h3 className="text-xl font-bold text-gray-900">Inserir Dados Obrigatórios</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Preencha os campos obrigatórios destacados com asterisco (*). 
                      A calculadora possui validação em tempo real:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Dados Pessoais</h4>
                          <p className="text-sm text-gray-800 font-medium">Nome, CPF, data de nascimento do trabalhador</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Dados Contratuais</h4>
                          <p className="text-sm text-gray-800 font-medium">Admissão, demissão, salário, função</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Dados Específicos</h4>
                          <p className="text-sm text-gray-800 font-medium">Informações específicas do tipo de cálculo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</div>
                    <h3 className="text-xl font-bold text-gray-900">Configurar Parâmetros Avançados</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Configure opções avançadas conforme a necessidade do caso:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Configurações Gerais</h4>
                          <ul className="text-sm text-gray-800 space-y-1 font-medium">
                            <li>• Período de cálculo personalizado</li>
                            <li>• Índices de correção monetária</li>
                            <li>• Data base para atualização</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Opções Específicas</h4>
                          <ul className="text-sm text-gray-800 space-y-1 font-medium">
                            <li>• Descontos legais</li>
                            <li>• Valores já pagos</li>
                            <li>• Jurisprudência aplicável</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">5</div>
                    <h3 className="text-xl font-bold text-gray-900">Executar e Revisar Cálculo</h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-900 mb-3 font-medium">
                      Clique em "Calcular" e revise os resultados apresentados:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">Verificar valores principais</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">Conferir memória de cálculo</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-900 font-medium">Validar períodos e bases</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Interpretação de Resultados */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Interpretando os Resultados</h2>
                
                <div className="space-y-6">
                  <Card className="!bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Executivo</h3>
                      <p className="text-gray-900 mb-3 font-medium">
                        A primeira seção apresenta um resumo com os valores mais importantes:
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid md:grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">R$ 15.430,50</div>
                            <div className="text-sm text-gray-600">Total Bruto</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">R$ 2.156,80</div>
                            <div className="text-sm text-gray-600">Total Descontos</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">R$ 13.273,70</div>
                            <div className="text-sm text-gray-600">Valor Líquido</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="!bg-white">
                    <CardContent className="p-6 !bg-white">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Discriminação Detalhada</h3>
                      <p className="text-gray-900 mb-3 font-medium">
                        Cada verba é apresentada com sua base de cálculo e fundamentação legal:
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-900 font-medium">Aviso Prévio Indenizado (30 dias)</span>
                          <span className="font-bold">R$ 2.500,00</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-900 font-medium">13º Salário Proporcional (8/12)</span>
                          <span className="font-bold">R$ 1.666,67</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-900 font-medium">Férias Proporcionais + 1/3 (8/12)</span>
                          <span className="font-bold">R$ 2.222,22</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Exportação */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Exportação de Resultados</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-red-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <Download className="w-6 h-6 text-red-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar PDF</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Relatório completo formatado para anexar em petições ou apresentar ao cliente.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Cabeçalho personalizado</li>
                            <li>• Memória de cálculo detalhada</li>
                            <li>• Fundamentação legal</li>
                            <li>• Assinatura digital</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-400 !bg-white">
                    <CardContent className="p-6 !bg-white">
                      <div className="flex items-start space-x-4">
                        <FileSpreadsheet className="w-6 h-6 text-green-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar Excel</h3>
                          <p className="text-gray-900 text-sm mb-3 font-medium">
                            Planilha editável para análises adicionais ou integração com outros sistemas.
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Fórmulas preservadas</li>
                            <li>• Dados estruturados</li>
                            <li>• Gráficos automáticos</li>
                            <li>• Formato compatível</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Limitações */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Limitações e Considerações</h2>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">Casos Complexos</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          A calculadora pode não contemplar todas as particularidades de casos muito específicos. 
                          Sempre revise os resultados com base no caso concreto.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Atualizações Legislativas</p>
                        <p className="text-blue-700 text-sm mt-1">
                          Nossa base de dados é atualizada mensalmente. Para mudanças recentes na legislação, 
                          verifique nosso blog jurídico ou entre em contato com o suporte.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Responsabilidade Profissional</p>
                        <p className="text-red-700 text-sm mt-1">
                          A calculadora é uma ferramenta de apoio. A responsabilidade pelos cálculos 
                          e sua aplicação no caso concreto permanece com o advogado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/artigos/prazo-entrega-peticoes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Artigo Anterior
            </Button>
            <Button onClick={() => navigate('/artigos/sistema-correcoes-revisoes')}>
              Próximo Artigo
              <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}