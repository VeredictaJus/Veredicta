import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';

export default function PrivacyPolicy() {
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
              <Shield className="h-6 w-6 text-orange-600" />
              <span>Política de Privacidade</span>
            </CardTitle>
            <p className="text-gray-600">Última atualização: 23 de julho de 2025</p>
          </CardHeader>
          
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
                <p className="text-gray-700 mb-4">
                  A Veredicta ("nós", "nossa" ou "da empresa") está comprometida em proteger sua privacidade. 
                  Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas 
                  informações quando você utiliza nossa plataforma de redação de petições jurídicas.
                </p>
                <p className="text-gray-700 mb-4">
                  Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) 
                  e outras legislações aplicáveis de proteção de dados.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.1 Informações Fornecidas por Você</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Dados de Cadastro:</strong> Nome, email, telefone, CPF/CNPJ, endereço</li>
                    <li><strong>Dados Profissionais:</strong> Número da OAB, especialização, dados da empresa</li>
                    <li><strong>Informações de Pagamento:</strong> Dados do cartão de crédito (processados por terceiros seguros)</li>
                    <li><strong>Conteúdo:</strong> Informações fornecidas para elaboração de petições</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.2 Informações Coletadas Automaticamente</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Dados de Uso:</strong> Páginas visitadas, tempo de navegação, cliques</li>
                    <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
                    <li><strong>Cookies:</strong> Dados armazenados para melhorar sua experiência</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Como Utilizamos suas Informações</h2>
                <p className="text-gray-700 mb-4">
                  Utilizamos suas informações para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Prestação de Serviços:</strong> Conectar clientes e redatores, processar pedidos</li>
                  <li><strong>Comunicação:</strong> Enviar notificações, atualizações de status, suporte</li>
                  <li><strong>Pagamentos:</strong> Processar transações e emitir faturas</li>
                  <li><strong>Melhorias:</strong> Analisar uso da plataforma para otimizações</li>
                  <li><strong>Segurança:</strong> Prevenir fraudes e proteger a plataforma</li>
                  <li><strong>Compliance:</strong> Cumprir obrigações legais e regulamentares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Base Legal para Tratamento</h2>
                <p className="text-gray-700 mb-4">
                  Tratamos seus dados pessoais com base nas seguintes bases legais da LGPD:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Execução de Contrato:</strong> Para prestar os serviços contratados</li>
                  <li><strong>Consentimento:</strong> Para comunicações de marketing (quando aplicável)</li>
                  <li><strong>Interesse Legítimo:</strong> Para melhorar nossos serviços e segurança</li>
                  <li><strong>Obrigação Legal:</strong> Para cumprimento de leis e regulamentos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Compartilhamento de Informações</h2>
                <p className="text-gray-700 mb-4">
                  Podemos compartilhar suas informações nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Entre Usuários:</strong> Informações necessárias para prestação dos serviços</li>
                  <li><strong>Prestadores de Serviço:</strong> Terceiros que nos auxiliam (pagamento, hospedagem, analytics)</li>
                  <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou autoridades competentes</li>
                  <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Segurança dos Dados</h2>
                <p className="text-gray-700 mb-4">
                  Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Criptografia:</strong> Dados sensíveis são criptografados em trânsito e em repouso</li>
                  <li><strong>Controle de Acesso:</strong> Acesso limitado apenas a funcionários autorizados</li>
                  <li><strong>Monitoramento:</strong> Sistemas de detecção de intrusão e atividades suspeitas</li>
                  <li><strong>Backups:</strong> Backups regulares e seguros dos dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Retenção de Dados</h2>
                <p className="text-gray-700 mb-4">
                  Mantemos suas informações pessoais apenas pelo tempo necessário para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Prestar os serviços contratados</li>
                  <li>Cumprir obrigações legais e fiscais</li>
                  <li>Resolver disputas e fazer cumprir acordos</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Após esse período, os dados são anonimizados ou excluídos de forma segura.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Seus Direitos (LGPD)</h2>
                <p className="text-gray-700 mb-4">
                  De acordo com a LGPD, você tem os seguintes direitos:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Confirmação:</strong> Saber se tratamos seus dados pessoais</li>
                  <li><strong>Acesso:</strong> Obter acesso aos seus dados pessoais</li>
                  <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou inexatos</li>
                  <li><strong>Anonimização:</strong> Solicitar anonimização dos dados desnecessários</li>
                  <li><strong>Portabilidade:</strong> Solicitar portabilidade dos dados para outro fornecedor</li>
                  <li><strong>Eliminação:</strong> Solicitar eliminação dos dados pessoais</li>
                  <li><strong>Informação:</strong> Obter informações sobre o compartilhamento dos dados</li>
                  <li><strong>Revogação:</strong> Revogar consentimento quando aplicável</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies e Tecnologias Similares</h2>
                <p className="text-gray-700 mb-4">
                  Utilizamos cookies e tecnologias similares para:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Essenciais:</strong> Necessários para funcionamento da plataforma</li>
                  <li><strong>Funcionais:</strong> Lembrar suas preferências e configurações</li>
                  <li><strong>Analytics:</strong> Entender como você usa nossa plataforma</li>
                  <li><strong>Marketing:</strong> Personalizar conteúdo (com seu consentimento)</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Você pode controlar cookies através das configurações do seu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Transferência Internacional</h2>
                <p className="text-gray-700 mb-4">
                  Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. 
                  Quando isso ocorrer, garantimos que tais transferências atendam aos requisitos da LGPD, 
                  incluindo a implementação de salvaguardas adequadas.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Menores de Idade</h2>
                <p className="text-gray-700 mb-4">
                  Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente 
                  informações pessoais de menores de idade. Se tomarmos conhecimento de que coletamos 
                  dados de um menor sem consentimento parental adequado, tomaremos medidas para excluir 
                  essas informações.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Alterações nesta Política</h2>
                <p className="text-gray-700 mb-4">
                  Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas 
                  serão comunicadas com antecedência de 30 dias através da plataforma ou por email. 
                  O uso continuado após as alterações constitui aceitação da nova política.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Encarregado de Dados (DPO)</h2>
                <p className="text-gray-700 mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato 
                  com nosso Encarregado de Proteção de Dados:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Email: contato@veredictajus.com</li>
                  <li>Telefone: (11) 99999-9999</li>
                  <li>Endereço: Campo Mourão/PR</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Autoridade Nacional de Proteção de Dados</h2>
                <p className="text-gray-700 mb-4">
                  Se não estivermos conseguindo resolver suas questões sobre privacidade, você pode 
                  contatar a Autoridade Nacional de Proteção de Dados (ANPD) através do site: 
                  <a href="https://www.gov.br/anpd" className="text-orange-600 hover:text-orange-700 underline" target="_blank" rel="noopener noreferrer">
                    www.gov.br/anpd
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Contato</h2>
                <p className="text-gray-700 mb-4">
                  Para dúvidas sobre esta Política de Privacidade, entre em contato:
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