import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  AlertTriangle, 
  Star, 
  Clock, 
  FileText, 
  MessageSquare,
  DollarSign,
  Shield,
  CheckCircle,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/images/veredicta-logo.png';
import { getCurrentYear } from '@/utils/dateUtils';

export default function ManualRedator() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'aprovacao',
      title: 'Processo de Aprovação',
      icon: Shield,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      content: [
        'Para se tornar um redator na plataforma Veredicta, você deve passar por nosso rigoroso processo de seleção.',
        'Após o cadastro inicial, você deverá enviar 3 (três) petições de sua própria autoria.',
        'Estas petições serão analisadas pela nossa equipe de suporte técnico especializada.',
        'O processo de análise leva entre 3 a 5 dias úteis.',
        'Somente redatores aprovados poderão participar da plataforma e receber demandas.',
        'Em caso de reprovação, você poderá tentar novamente após 30 dias.'
      ]
    },
    {
      id: 'prazos',
      title: 'Prazos e Penalidades',
      icon: AlertTriangle,
      color: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-900',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      content: [
        '⏰ PRAZOS POR PLANO DO CLIENTE:',
        '• PLANO START: 3 dias úteis (prazo até 18h do último dia)',
        '• PLANO PRO: 2 dias úteis (prazo até 18h do último dia)',
        '• PLANO ELITE: Mesmo dia (prazo até 18h) - APENAS se pedido for feito até 14h',
        '',
        '🕐 HORÁRIO LIMITE DE ENTREGA:',
        '• Horário oficial: 18h (horário de Brasília)',
        '• Tolerância: até 19h (60 minutos extras)',
        '• Após 19h, a petição será considerada ATRASADA',
        '',
        '📢 SISTEMA DE ALERTAS:',
        '• Você receberá um ALERTA às 17h (1h antes do prazo de entrega às 18h)',
        '• O alerta aparecerá automaticamente no dashboard',
        '• Tempo mínimo para trabalho de qualidade: 3 horas',
        '',
        '⚠️ REGRAS IMPORTANTES:',
        '• Pedidos feitos após 14h (Elite) = entrega no próximo dia útil às 18h',
        '• Pedidos em fins de semana = entrega no próximo dia útil às 18h',
        '• Dias úteis = Segunda a Sexta (exceto feriados)',
        '',
        '🚨 PENALIDADES POR ATRASO:',
        'ATENÇÃO: O cumprimento dos prazos é fundamental na plataforma Veredicta.',
        'O descumprimento de prazo resultará em penalidade automática.',
        '',
        '💰 MULTA AUTOMÁTICA:',
        '• PENALIDADE: 50% do VALOR DA PETIÇÃO atrasada será descontado do seu saldo',
        '• Exemplo: Petição de R$ 100,00 atrasada = Multa de R$ 50,00',
        '• A multa é descontada do seu saldo disponível para saque',
        '• Esta penalidade é irreversível e aplicada automaticamente após o vencimento',
        '',
        '🔄 REATRIBUIÇÃO AUTOMÁTICA:',
        '• A petição atrasada será REMOVIDA de você automaticamente',
        '• A petição volta para status "Pendente" no sistema',
        '• Outro redator poderá pegar a petição e completá-la',
        '• Você NÃO terá mais acesso à petição após o atraso',
        '• O cliente será atendido por outro redator',
        '',
        '⚠️ IMPORTANTE:',
        '• Recomendamos aceitar apenas demandas que conseguir cumprir dentro do prazo',
        '• Em casos excepcionais, entre em contato com o suporte ANTES do vencimento',
        '• A reatribuição protege o cliente e mantém a qualidade do serviço',
        '',
        '🚫 SUSPENSÃO POR REINCIDÊNCIA:',
        'O sistema aplica suspensões progressivas por atrasos recorrentes:',
        '',
        '1️⃣ 3 ATRASOS = 30 DIAS DE SUSPENSÃO',
        '   • Você ficará impedido de aceitar novas petições por 30 dias corridos',
        '   • Petições em andamento poderão ser concluídas',
        '',
        '2️⃣ 6 ATRASOS = 60 DIAS DE SUSPENSÃO',
        '   • Suspensão estendida para 60 dias corridos',
        '   • Acesso à plataforma bloqueado durante o período',
        '',
        '3️⃣ 9 ATRASOS = BLOQUEIO PERMANENTE',
        '   • Conta bloqueada permanentemente',
        '   • Somente o suporte pode desbloquear',
        '   • Necessário entrar em contato e justificar',
        '',
        '⚠️ As suspensões são automáticas e irreversíveis (exceto por suporte).',
        '⚠️ O contador de atrasos é permanente e acumula ao longo do tempo.'
      ]
    },
    {
      id: 'avaliacao',
      title: 'Sistema de Avaliação',
      icon: Star,
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-900',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      content: [
        '⭐ COMO FUNCIONA:',
        '• Todos os trabalhos entregues são avaliados pelos clientes (1-5 estrelas)',
        '• Sua média de avaliação fica visível em seu perfil',
        '• Redatores com melhores avaliações recebem destaque',
        '• As avaliações refletem a qualidade do seu trabalho',
        '',
        '📊 REQUISITO MÍNIMO DE AVALIAÇÃO:',
        '• Média mínima exigida: 3.8 estrelas',
        '• Mínimo de 3 avaliações para validação',
        '• Avaliação calculada automaticamente após cada entrega',
        '',
        '⚠️ SUSPENSÃO POR BAIXA AVALIAÇÃO:',
        'ATENÇÃO: Manter qualidade é essencial na plataforma Veredicta.',
        '',
        '🚫 MÉDIA ABAIXO DE 3.8 ESTRELAS (com 3+ avaliações):',
        '• Suspensão automática da conta',
        '• Não poderá aceitar novas petições',
        '• Acesso limitado apenas a Chat e Suporte',
        '• Suspensão permanece até contato com suporte',
        '',
        '📞 REABILITAÇÃO:',
        '• Entre em contato com o suporte',
        '• Explique sua situação',
        '• Aguarde análise da equipe',
        '• Comprometa-se com melhorias de qualidade',
        '• Apenas o suporte pode reativar sua conta',
        '',
        '💡 DICAS PARA MANTER BOA AVALIAÇÃO:',
        '• Entregue petições com qualidade e dentro do prazo',
        '• Mantenha comunicação clara com os clientes',
        '• Revise cuidadosamente antes de enviar',
        '• Siga as orientações técnicas do cliente',
        '• Seja profissional em toda interação',
        '',
        '⚠️ IMPORTANTE:',
        '• A média é calculada considerando TODAS as avaliações',
        '• Uma avaliação ruim pode impactar significativamente',
        '• Qualidade é mais importante que quantidade',
        '• Mantenha sempre o profissionalismo'
      ]
    },
    {
      id: 'chat',
      title: 'Chat e Comunicação',
      icon: MessageSquare,
      color: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-900',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      content: [
        'O chat com o cliente é a principal ferramenta de comunicação.',
        'Mantenha sempre um tom profissional e cordial.',
        'Responda às dúvidas dos clientes de forma clara e objetiva.',
        'O chat será automaticamente finalizado após a entrega da petição.',
        'Caso haja solicitação de correção, o chat será reativado.',
        'Não compartilhe informações pessoais ou contatos externos.',
        'Toda comunicação deve ocorrer exclusivamente pela plataforma.'
      ]
    },
    {
      id: 'pagamentos',
      title: 'Pagamentos e Saldo',
      icon: DollarSign,
      color: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-900',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      content: [
        '💰 PROCESSAMENTO DE PAGAMENTOS:',
        '• Os pagamentos são processados todo 5º dia útil do mês posterior ao mês trabalhado',
        '• Exemplo: Trabalhos realizados em novembro serão pagos no 5º dia útil de dezembro',
        '• O pagamento é feito mediante apresentação de nota fiscal',
        '',
        '📄 NOTA FISCAL (OBRIGATÓRIA):',
        '• As notas fiscais devem ser anexadas até o 5º dia de cada mês',
        '• A nota fiscal deve ser referente ao mês anterior trabalhado',
        '• Sem a nota fiscal, o pagamento não será processado',
        '• A nota fiscal deve estar em conformidade com a legislação vigente',
        '',
        '⚠️ IMPORTANTE:',
        '• Lembre-se: penalidades por atraso reduzem 50% do valor da petição (não do saldo total)',
        '• A multa é descontada do valor específico da petição atrasada',
        '• Atraso no envio da nota fiscal pode adiar o pagamento',
        '• Notas fiscais fora do prazo podem resultar em atraso no pagamento do mês seguinte'
      ]
    },
    {
      id: 'areas',
      title: 'Áreas de Atuação',
      icon: FileText,
      color: 'bg-violet-50 border-violet-200',
      textColor: 'text-violet-900',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      content: [
        'A plataforma atende TODAS as áreas do direito.',
        'Especialize-se nas áreas que domina para garantir qualidade.',
        'Principais áreas: Civil, Trabalhista, Penal, Tributário, Administrativo.',
        'Outras áreas: Família, Empresarial, Consumidor, Previdenciário.',
        'Áreas específicas: Ambiental, Internacional, Imobiliário.',
        'Indique suas especializações no seu perfil.',
        'Redatores especialistas recebem demandas prioritárias.'
      ]
    },
    {
      id: 'conduta',
      title: 'Código de Conduta',
      icon: Users,
      color: 'bg-slate-50 border-slate-200',
      textColor: 'text-slate-900',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      content: [
        'Mantenha sempre o mais alto padrão de ética profissional.',
        'Respeite os prazos estabelecidos e a confidencialidade dos casos.',
        'Não aceite demandas fora de sua área de especialização.',
        'Trate todos os clientes com respeito e profissionalismo.',
        'Não utilize a plataforma para fins que não sejam jurídicos.',
        'Qualquer violação pode resultar em suspensão ou banimento.',
        'Em caso de dúvidas éticas, consulte sempre o suporte.'
      ]
    },
    {
      id: 'suporte',
      title: 'Suporte e Dúvidas',
      icon: CheckCircle,
      color: 'bg-teal-50 border-teal-200',
      textColor: 'text-teal-900',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      content: [
        'Nossa equipe de suporte está disponível para ajudá-lo.',
        'Horário de atendimento: Segunda a Sexta, 9h às 18h.',
        'Para emergências relacionadas a prazos, temos plantão 24h.',
        'Use o chat de suporte na plataforma para dúvidas técnicas.',
        'Para questões administrativas, envie e-mail para contato@veredictajus.com.',
        'Mantenha sempre seus dados atualizados na plataforma.',
        'Leia este manual regularmente, pois pode ser atualizado.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logoImage} alt="Veredicta" className="h-8 w-auto" />
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-gray-900">Manual do Redator</h1>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo à Veredicta
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Este manual contém todas as informações essenciais sobre seus deveres, 
            obrigações e direitos como redator em nossa plataforma. Leia atentamente 
            e mantenha-se sempre atualizado.
          </p>
        </div>

        {/* Important Alert */}
        <Card className="mb-12 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-900">
                Importante: Leitura Obrigatória
              </h3>
            </div>
            <p className="text-orange-800">
              O conhecimento e cumprimento de todas as regras deste manual são 
              <strong> obrigatórios</strong> para todos os redatores. O não cumprimento 
              pode resultar em penalidades, suspensão ou banimento da plataforma.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} className={`shadow-md border-2 ${section.color} transition-all hover:shadow-lg`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${section.iconBg} flex items-center justify-center shadow-sm`}>
                      <IconComponent className={`h-6 w-6 ${section.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900">{section.title}</CardTitle>
                      <CardDescription className="text-sm mt-1 text-gray-600">
                        Regras e orientações importantes
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={`pt-0 ${section.textColor || 'text-gray-700'}`}>
                  <div className="space-y-3">
                    {section.content.map((item, index) => {
                      // Destaque para linhas importantes (que começam com emoji ou maiúsculas)
                      const isImportant = item.trim().startsWith('🚨') || 
                                         item.trim().startsWith('⚠️') || 
                                         item.trim().startsWith('💰') ||
                                         item.trim().startsWith('🔄') ||
                                         item.trim().startsWith('🚫') ||
                                         item.trim().startsWith('📊') ||
                                         item.trim().startsWith('⏰') ||
                                         item.trim().startsWith('🕐') ||
                                         item.trim().startsWith('📢') ||
                                         item.trim().startsWith('ATENÇÃO') ||
                                         item.trim().startsWith('IMPORTANTE');
                      
                      const isHeader = item.trim().endsWith(':') && item.length < 50;
                      
                      // Extrair cor do ícone para o bullet
                      const bulletColor = section.iconColor
                        .replace('text-', 'bg-')
                        .replace('-600', '-400')
                        .replace('-700', '-400');
                      
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          {item.trim() ? (
                            <div className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${isImportant ? 'bg-orange-500' : bulletColor}`}></div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 opacity-0"></div>
                          )}
                          <p className={`leading-relaxed ${isImportant ? 'font-semibold text-gray-900' : isHeader ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                            {item || '\u00A0'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 py-12 bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg text-white">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para Começar?
          </h3>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Agora que você conhece todas as regras, cadastre-se e comece 
            a fazer parte da melhor plataforma de redação jurídica do Brasil.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar como Redator
              <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50 border border-white"
              onClick={() => navigate('/auth/login')}
            >
              Já tenho Conta
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {getCurrentYear()} Veredicta. Todos os direitos reservados.</p>
          <p className="text-gray-400 mt-2">
            Este manual pode ser atualizado periodicamente. Mantenha-se sempre informado.
          </p>
        </div>
      </footer>
    </div>
  );
}