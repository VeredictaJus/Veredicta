import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { getCurrentYear } from '@/utils/dateUtils';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function Privacidade() {
  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <section className="border-b border-white/10 bg-slate-900/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/25">
            <Shield className="h-7 w-7 text-orange-300" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">Política de Privacidade</h1>
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
                <CardTitle className="text-gray-900">1. Informações que Coletamos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <h4 className="font-semibold">1.1 Informações Pessoais:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nome completo e dados de identificação</li>
                  <li>Endereço de email e telefone</li>
                  <li>Informações profissionais (OAB, especialização)</li>
                  <li>Dados de pagamento (processados por terceiros seguros)</li>
                </ul>
                
                <h4 className="font-semibold mt-4">1.2 Informações de Uso:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Logs de acesso e navegação</li>
                  <li>Endereço IP e informações do dispositivo</li>
                  <li>Cookies e tecnologias similares</li>
                  <li>Histórico de transações e interações</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">2. Como Usamos suas Informações</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Processar pagamentos e transações</li>
                  <li>Comunicar sobre atualizações e serviços</li>
                  <li>Garantir segurança e prevenir fraudes</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                  <li>Personalizar sua experiência na plataforma</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">3. Compartilhamento de Informações</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>Compartilhamos suas informações apenas quando:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Necessário para prestação do serviço (redator-cliente)</li>
                  <li>Com provedores de serviços terceirizados confiáveis</li>
                  <li>Para cumprimento de obrigações legais</li>
                  <li>Mediante seu consentimento explícito</li>
                </ul>
                
                <p className="mt-4">
                  <strong>Nunca vendemos</strong> suas informações pessoais para terceiros.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">4. Segurança dos Dados</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>Implementamos medidas de segurança robustas:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criptografia SSL/TLS para transmissão de dados</li>
                  <li>Criptografia de dados em repouso</li>
                  <li>Autenticação multifator disponível</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Backups regulares e seguros</li>
                  <li>Acesso restrito por função</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">5. Seus Direitos (LGPD)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>Você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Acesso:</strong> Saber quais dados pessoais tratamos</li>
                  <li><strong>Correção:</strong> Corrigir dados incompletos ou inexatos</li>
                  <li><strong>Exclusão:</strong> Solicitar a eliminação de dados desnecessários</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  <li><strong>Oposição:</strong> Opor-se ao tratamento em situações específicas</li>
                  <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
                </ul>
                
                <p className="mt-4">
                  Para exercer seus direitos, entre em contato através do email: 
                  <strong> contato@veredictajus.com</strong>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">6. Retenção de Dados</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>Mantemos seus dados pelo tempo necessário para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prestação do serviço contratado</li>
                  <li>Cumprimento de obrigações legais</li>
                  <li>Exercício de direitos em processos judiciais</li>
                  <li>Manutenção da segurança da plataforma</li>
                </ul>
                
                <p className="mt-4">
                  Após o encerramento da conta, dados essenciais podem ser mantidos por até 5 anos para fins legais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">7. Cookies e Tecnologias Similares</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>Utilizamos cookies para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manter sua sessão ativa</li>
                  <li>Personalizar sua experiência</li>
                  <li>Analisar o uso da plataforma</li>
                  <li>Melhorar nossos serviços</li>
                </ul>
                
                <p className="mt-4">
                  Você pode gerenciar cookies através das configurações do seu navegador.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">8. Transferência Internacional</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Seus dados são processados principalmente no Brasil. Quando necessário transferir dados internacionalmente, garantimos proteção adequada através de:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cláusulas contratuais padrão</li>
                  <li>Certificações de adequação</li>
                  <li>Medidas de segurança adicionais</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">9. Alterações nesta Política</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Podemos atualizar esta política periodicamente. Mudanças significativas serão comunicadas através da plataforma ou por email. A data da última atualização está sempre indicada no início do documento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">10. Contato</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <p>
                  Para dúvidas sobre privacidade e proteção de dados:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Email:</strong> contato@veredictajus.com</li>
                  <li><strong>Telefone:</strong> (44) 99727-1991</li>
                  <li><strong>Endereço:</strong> R. Rio de Janeiro, 243, Sala 802 - Centro - Belo Horizonte/MG</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}