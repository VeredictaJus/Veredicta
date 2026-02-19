import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { getCurrentYear } from '@/utils/dateUtils';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function Termos() {
  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <section className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/25">
            <Scale className="h-7 w-7 text-orange-300" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">Termos de Serviço</h1>
          <p className="text-lg text-slate-300">
            Última atualização: 18 de Julho de {getCurrentYear()}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">1. Aceitação dos Termos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Ao acessar e usar a plataforma Veredicta, você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                </p>
                <p>
                  A Veredicta é uma plataforma que conecta profissionais do direito (clientes) com redatores especializados para a elaboração de petições jurídicas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">2. Descrição dos Serviços</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>A Veredicta oferece:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Plataforma de conexão entre clientes e redatores jurídicos</li>
                  <li>Sistema de solicitação e entrega de petições</li>
                  <li>Calculadora trabalhista integrada</li>
                  <li>Sistema de comunicação entre usuários</li>
                  <li>Ferramentas de gestão de prazos e qualidade</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">3. Cadastro e Conta de Usuário</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
                </p>
                <h4 className="font-semibold mt-4">3.1 Tipos de Usuário:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Clientes:</strong> Advogados e profissionais do direito que solicitam petições</li>
                  <li><strong>Redatores:</strong> Profissionais qualificados que elaboram as petições</li>
                  <li><strong>Administradores:</strong> Responsáveis pela gestão da plataforma</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">4. Processo de Aprovação de Redatores</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Todos os redatores devem passar por um processo de aprovação que inclui:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Envio de portfólio com 3 petições autorais</li>
                  <li>Análise por nossa equipe técnica especializada</li>
                  <li>Prazo de análise de 3 a 5 dias úteis</li>
                  <li>Possibilidade de nova tentativa após 30 dias em caso de reprovação</li>
                </ul>
                <h4 className="font-semibold mt-6">4.1 Natureza da Relação</h4>
                <p className="mt-2">
                  A relação entre a Veredicta e os redatores cadastrados na plataforma é de natureza <strong>prestadora de serviços autônoma</strong>, não configurando, em hipótese alguma, relação de emprego, vínculo trabalhista ou qualquer tipo de subordinação jurídica.
                </p>
                <p className="mt-2">
                  Os redatores atuam como <strong>prestadores de serviços autônomos</strong>, sendo responsáveis por suas próprias atividades profissionais, horários de trabalho e organização do serviço prestado. A plataforma atua exclusivamente como intermediária, conectando clientes e redatores, sem exercer controle sobre a forma de execução do trabalho ou estabelecer vínculo empregatício.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">5. Prazos e Penalidades</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  O cumprimento de prazos é fundamental na plataforma:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prazos são estabelecidos no momento da aceitação da demanda</li>
                  <li>Descumprimento resulta em penalidade automática de 50% do valor</li>
                  <li>Sistema de notificações automáticas</li>
                  <li>Histórico de penalidades acessível aos redatores</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">6. Pagamentos e Reembolsos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Os pagamentos são processados através da plataforma:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sistema de créditos pré-pagos</li>
                  <li>Planos mensais disponíveis</li>
                  <li>Pagamentos via cartão ou boleto</li>
                  <li>Reembolsos conforme política específica</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">7. Propriedade Intelectual</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  O cliente detém a propriedade intelectual das petições elaboradas através da plataforma. A Veredicta atua apenas como intermediária na prestação do serviço.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">8. Limitação de Responsabilidade</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  A Veredicta não se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Conteúdo jurídico das petições elaboradas</li>
                  <li>Resultados processuais decorrentes do uso das petições</li>
                  <li>Interpretações jurídicas específicas</li>
                  <li>Falhas temporárias no sistema</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">9. Confidencialidade e Sigilo Profissional</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  A Veredicta compromete-se a manter absoluto sigilo e confidencialidade sobre todas as informações, documentos e dados compartilhados através da plataforma, em conformidade com o Código de Ética e Disciplina da OAB e demais normas aplicáveis.
                </p>
                <h4 className="font-semibold mt-4">9.1 Obrigações de Confidencialidade:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Todas as informações compartilhadas na plataforma são tratadas com máxima confidencialidade</li>
                  <li>Redatores e clientes comprometem-se a manter sigilo sobre informações sensíveis</li>
                  <li>Acesso restrito apenas a usuários autorizados e envolvidos diretamente no serviço</li>
                  <li>Armazenamento seguro de dados em conformidade com padrões de segurança da informação</li>
                  <li>Proibição de compartilhamento de informações com terceiros não autorizados</li>
                </ul>
                <p className="mt-4">
                  Qualquer violação do sigilo profissional resultará em medidas disciplinares, podendo incluir suspensão ou encerramento da conta, além das responsabilidades legais cabíveis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">10. LGPD e Proteção de Dados</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  A Veredicta está comprometida com a proteção dos dados pessoais de seus usuários, em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                </p>
                <h4 className="font-semibold mt-4">10.1 Tratamento de Dados:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Coleta apenas de dados necessários para prestação dos serviços</li>
                  <li>Uso dos dados exclusivamente para fins relacionados à plataforma</li>
                  <li>Armazenamento seguro com medidas técnicas e administrativas adequadas</li>
                  <li>Compartilhamento apenas quando necessário para prestação do serviço ou por obrigação legal</li>
                </ul>
                <h4 className="font-semibold mt-4">10.2 Direitos dos Titulares:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Confirmação da existência de tratamento de dados</li>
                  <li>Acesso aos dados pessoais</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                  <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                  <li>Portabilidade dos dados</li>
                  <li>Revogação do consentimento</li>
                </ul>
                <p className="mt-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato através do email: contato@veredictajus.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">11. Uso Adequado da Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Os usuários comprometem-se a utilizar a plataforma de forma adequada, ética e em conformidade com a legislação vigente.
                </p>
                <h4 className="font-semibold mt-4">11.1 É expressamente proibido:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utilizar a plataforma para fins ilegais ou fraudulentos</li>
                  <li>Compartilhar informações falsas ou enganosas</li>
                  <li>Violar direitos de propriedade intelectual de terceiros</li>
                  <li>Realizar atividades que possam comprometer a segurança da plataforma</li>
                  <li>Interferir no funcionamento normal da plataforma ou de outros usuários</li>
                  <li>Utilizar sistemas automatizados para acessar a plataforma sem autorização</li>
                  <li>Compartilhar credenciais de acesso com terceiros</li>
                  <li>Praticar qualquer forma de discriminação, assédio ou comportamento inadequado</li>
                  <li>Solicitar ou oferecer serviços fora da plataforma com o objetivo de evitar taxas</li>
                </ul>
                <h4 className="font-semibold mt-4">11.2 Responsabilidades do Usuário:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer informações verdadeiras e atualizadas</li>
                  <li>Manter a segurança de suas credenciais de acesso</li>
                  <li>Notificar imediatamente sobre uso não autorizado de sua conta</li>
                  <li>Utilizar a plataforma de forma responsável e ética</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">12. Suspensão e Encerramento de Conta</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  A Veredicta reserva-se o direito de suspender ou encerrar contas de usuários que violem estes Termos de Serviço ou que pratiquem condutas inadequadas.
                </p>
                <h4 className="font-semibold mt-4">12.1 Motivos para Suspensão ou Encerramento:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violação dos Termos de Serviço ou Política de Privacidade</li>
                  <li>Prática de atividades fraudulentas ou ilegais</li>
                  <li>Descumprimento recorrente de prazos (para redatores)</li>
                  <li>Baixa qualidade recorrente dos serviços prestados (para redatores)</li>
                  <li>Comportamento inadequado ou desrespeitoso com outros usuários</li>
                  <li>Violação do sigilo profissional ou confidencialidade</li>
                  <li>Uso não autorizado da plataforma</li>
                  <li>Inatividade prolongada da conta (conforme política específica)</li>
                </ul>
                <h4 className="font-semibold mt-4">12.2 Efeitos da Suspensão ou Encerramento:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Impedimento de acesso à plataforma</li>
                  <li>Cancelamento de serviços em andamento (conforme caso)</li>
                  <li>Perda de créditos não utilizados (conforme política de reembolso)</li>
                  <li>Preservação de dados conforme obrigações legais e LGPD</li>
                </ul>
                <p className="mt-4">
                  A Veredicta notificará o usuário sobre a suspensão ou encerramento, quando aplicável, e fornecerá informações sobre os motivos e possíveis recursos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">13. Foro e Lei Aplicável</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Estes Termos de Serviço são regidos pela legislação brasileira, em especial pelo Código de Defesa do Consumidor (Lei nº 8.078/1990), quando aplicável, e pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
                <p className="mt-4">
                  Para a resolução de controvérsias decorrentes destes Termos, as partes elegem o <strong>Foro da Comarca de Belo Horizonte/MG</strong>, renunciando a qualquer outro, por mais privilegiado que seja.
                </p>
                <p className="mt-4">
                  Em caso de conflito entre as disposições destes Termos e a legislação aplicável, prevalecerão as disposições legais, sendo os Termos ajustados na medida do necessário para conformidade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">14. Modificações dos Termos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação na plataforma. O uso continuado dos serviços constitui aceitação dos novos termos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">15. Contato</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Para dúvidas sobre estes termos, entre em contato:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email: contato@veredictajus.com</li>
                  <li>Telefone: (44) 99727-1991</li>
                  <li>Endereço: R. Rio de Janeiro, 243, Sala 802 - Centro - Belo Horizonte/MG</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}