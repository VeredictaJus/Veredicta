import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Scale } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logoImage} alt="Veredicta" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-gray-900">Veredicta</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Scale className="h-6 w-6 text-orange-600" />
              <span>Termos de Serviço</span>
            </CardTitle>
            <p className="text-gray-600">Última atualização: 23 de julho de 2025</p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Definições</h2>
                <p className="text-gray-700 mb-4">
                  Para fins deste Termo de Serviço, consideram-se as seguintes definições:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>"Plataforma"</strong>: Refere-se ao sistema Veredicta, incluindo website, aplicações e serviços relacionados.</li>
                  <li><strong>"Cliente"</strong>: Pessoa física ou jurídica que contrata serviços de redação de petições através da plataforma.</li>
                  <li><strong>"Redator"</strong>: Profissional habilitado que presta serviços de redação jurídica através da plataforma.</li>
                  <li><strong>"Petição"</strong>: Documento jurídico elaborado pelo redator conforme solicitação do cliente.</li>
                  <li><strong>"Créditos"</strong>: Unidade de medida utilizada para contratação de serviços na plataforma.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Objeto e Finalidade</h2>
                <p className="text-gray-700 mb-4">
                  A Veredicta é uma plataforma digital que conecta advogados (clientes) com redatores jurídicos especializados para a elaboração de petições e documentos jurídicos sob demanda.
                </p>
                <p className="text-gray-700 mb-4">
                  A plataforma oferece:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Sistema de solicitação e elaboração de petições jurídicas</li>
                  <li>Processo de revisão e controle de qualidade</li>
                  <li>Sistema de pagamentos e créditos</li>
                  <li>Calculadora trabalhista automatizada</li>
                  <li>Gestão de prazos e entregas</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cadastro e Elegibilidade</h2>
                <p className="text-gray-700 mb-4">
                  Para utilizar a plataforma, é necessário:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Ser maior de 18 anos ou pessoa jurídica devidamente constituída</li>
                  <li>Fornecer informações verdadeiras e atualizadas</li>
                  <li>Para redatores: possuir habilitação profissional válida (OAB)</li>
                  <li>Aceitar integralmente estes Termos de Serviço</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Planos e Pagamentos</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 Planos Disponíveis</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Plano Starter:</strong> R$ 2.000/mês - 10 petições incluídas - Créditos adicionais: R$ 220,00</li>
                    <li><strong>Plano Profissional:</strong> R$ 5.000/mês - 25 petições incluídas - Créditos adicionais: R$ 210,00</li>
                    <li><strong>Plano Premium:</strong> R$ 10.000/mês - 50 petições incluídas - Créditos adicionais: R$ 200,00</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Sistema de Créditos</h3>
                  <p className="text-gray-700 mb-2">
                    Cada petição consome 1 (um) crédito. Créditos não utilizados no mês são perdidos. 
                    Créditos adicionais podem ser adquiridos conforme valores do plano contratado.
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.3 Pagamentos</h3>
                  <p className="text-gray-700 mb-2">
                    Os pagamentos são processados mensalmente, via cartão de crédito ou PIX. 
                    O não pagamento implica em suspensão dos serviços.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Direitos e Obrigações dos Clientes</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Direitos</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Solicitar petições conforme plano contratado</li>
                    <li>Receber petições com qualidade e dentro dos prazos acordados</li>
                    <li>Solicitar revisões quando necessário</li>
                    <li>Utilizar a calculadora trabalhista</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Obrigações</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Fornecer informações completas e precisas para elaboração das petições</li>
                    <li>Efetuar pagamentos nos prazos estabelecidos</li>
                    <li>Utilizar a plataforma apenas para fins legítimos</li>
                    <li>Manter confidencialidade sobre informações sensíveis</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Direitos e Obrigações dos Redatores</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">6.1 Direitos</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Receber remuneração conforme acordado</li>
                    <li>Escolher as petições que deseja redigir</li>
                    <li>Ter acesso às ferramentas da plataforma</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">6.2 Obrigações</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Entregar petições com qualidade e dentro dos prazos</li>
                    <li>Manter habilitação profissional atualizada</li>
                    <li>Seguir as diretrizes da plataforma</li>
                    <li>Manter sigilo profissional</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Propriedade Intelectual</h2>
                <p className="text-gray-700 mb-4">
                  As petições elaboradas através da plataforma são de propriedade do cliente contratante. 
                  A plataforma Veredicta e seus componentes são protegidos por direitos autorais.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
                <p className="text-gray-700 mb-4">
                  A Veredicta atua como intermediadora entre clientes e redatores. A responsabilidade 
                  pelo conteúdo jurídico das petições é do redator que as elabora. A plataforma não 
                  se responsabiliza por decisões judiciais ou resultados de processos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cancelamento e Rescisão</h2>
                <p className="text-gray-700 mb-4">
                  O cliente pode cancelar sua assinatura a qualquer momento. O cancelamento será 
                  efetivado no final do período já pago. Créditos não utilizados são perdidos no cancelamento.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modificações dos Termos</h2>
                <p className="text-gray-700 mb-4">
                  A Veredicta reserva-se o direito de modificar estes termos a qualquer momento. 
                  Usuários serão notificados sobre mudanças significativas com 30 dias de antecedência.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Lei Aplicável e Foro</h2>
                <p className="text-gray-700 mb-4">
                  Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca 
                  de Campo Mourão/PR para dirimir quaisquer controvérsias decorrentes destes termos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contato</h2>
                <p className="text-gray-700 mb-4">
                  Para dúvidas sobre estes termos, entre em contato através de:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Email: contato@veredictajus.com</li>
                  <li>Telefone: (11) 99999-9999</li>
                  <li>Endereço: Campo Mourão/PR</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}