import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Server, FileCheck, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';

export default function Seguranca() {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: Lock,
      title: "Criptografia End-to-End",
      description: "Todas as comunicações e documentos são criptografados com algoritmos de última geração",
      details: [
        "Protocolo TLS 1.3 para transmissão",
        "Criptografia AES-256 para armazenamento",
        "Chaves únicas por usuário",
        "Renovação automática de certificados"
      ]
    },
    {
      icon: Server,
      title: "Infraestrutura Segura",
      description: "Servidores localizados no Brasil com alta disponibilidade e segurança",
      details: [
        "Data centers certificados ISO 27001",
        "Backup automático 3x ao dia",
        "Monitoramento 24/7",
        "Recuperação de desastres"
      ]
    },
    {
      icon: Users,
      title: "Controle de Acesso",
      description: "Sistemas avançados de autenticação e autorização de usuários",
      details: [
        "Autenticação de dois fatores (2FA)",
        "Controle granular de permissões",
        "Log completo de atividades",
        "Sessões seguras com timeout"
      ]
    },
    {
      icon: FileCheck,
      title: "Conformidade LGPD",
      description: "Total conformidade com a Lei Geral de Proteção de Dados",
      details: [
        "Política de privacidade transparente",
        "Direito ao esquecimento",
        "Portabilidade de dados",
        "Consentimento explícito"
      ]
    }
  ];

  const certifications = [
    {
      name: "ISO 27001",
      description: "Gestão de Segurança da Informação",
      status: "Certificado"
    },
    {
      name: "SSL/TLS",
      description: "Certificado de Segurança Digital",
      status: "Ativo"
    },
    {
      name: "LGPD",
      description: "Lei Geral de Proteção de Dados",
      status: "Conforme"
    },
    {
      name: "PCI DSS",
      description: "Segurança para Pagamentos",
      status: "Certificado"
    }
  ];

  const userRights = [
    "Acesso aos seus dados pessoais",
    "Correção de informações incorretas",
    "Exclusão de dados pessoais",
    "Portabilidade dos seus dados",
    "Revogação do consentimento",
    "Informação sobre compartilhamento"
  ];

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

          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-500/15 border border-orange-500/25 rounded-xl">
              <Shield className="w-8 h-8 text-orange-300" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Segurança e Privacidade</h1>
              <p className="text-lg text-slate-300 mt-2">Informações sobre como protegemos seus dados e documentos</p>
              <div className="flex items-center mt-3">
                <CheckCircle className="w-5 h-5 text-emerald-300 mr-2" />
                <span className="text-emerald-200 font-medium">Certificado ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nosso Compromisso com a Segurança 🛡️
              </h2>
              <p className="text-gray-700 leading-7 mb-6">
                Na Veredicta, a segurança dos seus dados e documentos é nossa prioridade máxima. 
                Implementamos as mais avançadas medidas de segurança e seguimos rigorosamente 
                todas as normas de proteção de dados, incluindo a LGPD.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h3 className="font-semibold text-green-800 mb-2">🔒 Principais Garantias:</h3>
                <ul className="text-green-700 space-y-1">
                  <li>✓ Criptografia militar de 256 bits</li>
                  <li>✓ Servidores no Brasil com certificação ISO 27001</li>
                  <li>✓ Conformidade total com LGPD</li>
                  <li>✓ Backup automático e recuperação de dados</li>
                  <li>✓ Monitoramento 24/7 por equipe especializada</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Medidas de Segurança Implementadas</h2>
            
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                        <p className="text-blue-100">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {feature.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Certifications */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                🏆 Certificações e Conformidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {certifications.map((cert, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      <Badge className="bg-green-100 text-green-800">{cert.status}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LGPD Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                📋 Seus Direitos (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                De acordo com a Lei Geral de Proteção de Dados, você tem os seguintes direitos 
                sobre seus dados pessoais:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {userRights.map((right, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Eye className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-purple-800">{right}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm">
                  <strong>Para exercer seus direitos:</strong> Entre em contato conosco através 
                  do e-mail <strong>privacidade@veredicta.com.br</strong> ou pelo telefone 
                  <strong>(11) 4000-0000</strong>. Responderemos em até 15 dias úteis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Processing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                🔄 Como Processamos Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Coleta de Dados</h4>
                  <p className="text-gray-700 mb-4">
                    Coletamos apenas os dados essenciais para prestar nossos serviços, incluindo:
                  </p>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>• Dados pessoais e profissionais para identificação</li>
                    <li>• Informações de contato para comunicação</li>
                    <li>• Documentos jurídicos para elaboração de petições</li>
                    <li>• Dados de pagamento para processamento financeiro</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Armazenamento</h4>
                  <p className="text-gray-700">
                    Todos os dados são armazenados em servidores seguros no Brasil, com criptografia 
                    avançada e backup automático. Mantemos os dados apenas pelo tempo necessário 
                    para cumprir nossas obrigações legais e contratuais.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Compartilhamento</h4>
                  <p className="text-gray-700">
                    Não compartilhamos seus dados com terceiros, exceto quando necessário para 
                    prestação do serviço (como processamento de pagamentos) ou quando exigido por lei.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Incident */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-orange-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Reporte Problemas de Segurança
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Se você identificar alguma vulnerabilidade ou problema de segurança, 
                    entre em contato conosco imediatamente:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>E-mail:</strong> seguranca@veredicta.com.br
                    </p>
                    <p className="text-gray-700">
                      <strong>Telefone:</strong> (11) 4000-0000 (24 horas)
                    </p>
                    <p className="text-gray-700">
                      <strong>WhatsApp:</strong> (11) 9 9999-9999
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Precisa de Mais Informações?
              </h2>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Nossa equipe está pronta para esclarecer qualquer dúvida sobre 
                segurança e privacidade dos seus dados.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/contato')}
                >
                  Entrar em Contato
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/privacidade')}
                >
                  Política de Privacidade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}