import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { getCurrentYear } from '@/utils/dateUtils';

export default function Privacidade() {
  const navigate = useNavigate();

  // Forçar modo claro na página
  useEffect(() => {
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Forçar modo claro
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Forçar variáveis CSS para modo claro
    root.style.setProperty('--background', '0 0% 100%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
    root.style.setProperty('--foreground', '222.2 84% 4.9%');
    
    // Restaurar tema original ao desmontar
    return () => {
      root.style.removeProperty('--background');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--foreground');
      root.classList.remove('light');
      if (originalTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header - Modo Noturno */}
      <header className="bg-slate-900 shadow-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
          {/* Logo e Botão Voltar */}
          <div className="flex flex-nowrap items-center justify-between w-full gap-4 mb-6">
            <Logo textColor="light" size="lg" className="shrink-0" />
            <div className="flex flex-nowrap items-center gap-2 shrink-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white hover:bg-gray-800 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </div>
          </div>

          {/* Título e Informações */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-600 rounded-lg">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Política de Privacidade
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Última atualização: 18 de Julho de {getCurrentYear()}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">1. Informações que Coletamos</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">2. Como Usamos suas Informações</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">3. Compartilhamento de Informações</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">4. Segurança dos Dados</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">5. Seus Direitos (LGPD)</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">6. Retenção de Dados</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">7. Cookies e Tecnologias Similares</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">8. Transferência Internacional</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">9. Alterações nesta Política</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
                <p>
                  Podemos atualizar esta política periodicamente. Mudanças significativas serão comunicadas através da plataforma ou por email. A data da última atualização está sempre indicada no início do documento.
                </p>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: '#ffffff' }}>
              <CardHeader>
                <CardTitle className="text-gray-900">10. Contato</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none" style={{ backgroundColor: '#ffffff' }}>
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