import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { EmailService } from '@/services/emailService';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';
import MarketingHero from '@/components/Marketing/MarketingHero';
import {
  MARKETING_CARD_CLASS,
  MARKETING_CARD_HOVER_CLASS,
  MARKETING_FIELD_CLASS,
  MARKETING_SECTION_ALT_CLASS,
  MARKETING_SECTION_CLASS,
} from '@/styles/marketing';

export default function Contato() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await EmailService.sendContactEmail(formData);
      
      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: response.message
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: response.message
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Erro inesperado. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <MarketingHero
        eyebrow="Suporte"
        title={
          <>
            Entre em <br />
            <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Contato
            </span>
          </>
        }
        subtitle="Tem alguma dúvida ou sugestão? Nossa equipe está pronta para ajudar você."
      />

      {/* Contact Content */}
      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-white">
                  <MessageSquare className="w-6 h-6 mr-3 text-orange-300" />
                  Envie sua Mensagem
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Preencha o formulário abaixo e responderemos o mais breve possível
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Status Message */}
                {submitStatus.type && (
                  <div
                    className={[
                      'p-4 rounded-xl mb-6 flex items-center space-x-3 border',
                      submitStatus.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-200 border-red-500/20',
                    ].join(' ')}
                  >
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-300" />
                    )}
                    <span className="text-sm font-medium">{submitStatus.message}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Nome Completo
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Seu nome completo"
                        className={MARKETING_FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        E-mail
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="seu@email.com"
                        className={MARKETING_FIELD_CLASS}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Assunto
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Qual o assunto da sua mensagem?"
                      className={MARKETING_FIELD_CLASS}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Mensagem
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Descreva sua dúvida ou sugestão..."
                      className={MARKETING_FIELD_CLASS}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">E-mail</h3>
                      <p className="text-slate-200">contato@veredictajus.com</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Respondemos em até 24 horas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-orange-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Telefone</h3>
                      <p className="text-slate-200">(44) 99727-1991</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Segunda a sexta, 9h às 18h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-500/15 ring-1 ring-orange-400/30 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Endereço</h3>
                      <p className="text-slate-200">
                        Rua Rio de Janeiro, nº 243 - Sala 802<br />
                        Centro, Belo Horizonte/MG<br />
                        CEP: 30160-040
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card className={MARKETING_CARD_CLASS}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Perguntas Frequentes
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-slate-100">Como funciona a plataforma?</h4>
                      <p className="text-sm text-slate-300">
                        Você solicita uma petição, um redator qualificado a elabora e entrega no prazo.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-100">Qual o prazo de entrega?</h4>
                      <p className="text-sm text-slate-300">
                        Varia de 24h a 7 dias dependendo da complexidade da petição.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-100">Como me tornar redator?</h4>
                      <p className="text-sm text-slate-300">
                        Cadastre-se e envie seu portfólio para análise da nossa equipe.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-3">
              Ainda não é nosso cliente?
            </h2>
            <p className="text-lg text-slate-300 mb-6">
              Cadastre-se gratuitamente e comece a usar a Veredicta hoje mesmo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
                onClick={() => navigate('/auth/register')}
              >
                Cadastrar-se
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}