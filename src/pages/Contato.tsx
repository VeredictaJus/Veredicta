import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';
import { EmailService } from '@/services/emailService';

export default function Contato() {
  const navigate = useNavigate();

  // Forçar modo claro na página
  useEffect(() => {
    const root = document.documentElement;
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Forçar modo claro
    root.classList.remove('dark');
    
    // Restaurar tema original ao desmontar
    return () => {
      if (originalTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);
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
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <div className="flex flex-nowrap items-center justify-between w-full gap-2">
            <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate('/')}>
              <img src={logoImage} alt="Veredicta" className="h-6 sm:h-8 w-auto mr-2 sm:mr-3" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">Veredicta</span>
            </div>
            <div className="flex flex-nowrap items-center gap-2 shrink-0 ml-auto">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth/login')}
                className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/auth/register')}
                className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Entre em
            <br />
            <span className="text-orange-200">Contato</span>
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Tem alguma dúvida ou sugestão? Nossa equipe está pronta para ajudar você.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="shadow-lg" style={{ backgroundColor: '#ffffff' }}>
              <CardHeader style={{ backgroundColor: '#ffffff' }}>
                <CardTitle className="text-2xl flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-orange-600" />
                  Envie sua Mensagem
                </CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e responderemos o mais breve possível
                </CardDescription>
              </CardHeader>
              <CardContent style={{ backgroundColor: '#ffffff' }}>
                {/* Status Message */}
                {submitStatus.type && (
                  <div className={`p-4 rounded-lg mb-6 flex items-center space-x-3 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{submitStatus.message}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Qual o assunto da sua mensagem?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Descreva sua dúvida ou sugestão..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
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
              <Card className="shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                <CardContent className="p-6" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">E-mail</h3>
                      <p className="text-gray-600">contato@veredictajus.com</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Respondemos em até 24 horas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                <CardContent className="p-6" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Telefone</h3>
                      <p className="text-gray-600">(44) 99727-1991</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Segunda a sexta, 9h às 18h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                <CardContent className="p-6" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
                      <p className="text-gray-600">
                        Rua Rio de Janeiro, nº 243 - Sala 802<br />
                        Centro, Belo Horizonte/MG<br />
                        CEP: 30160-040
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card className="shadow-lg bg-orange-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Perguntas Frequentes
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Como funciona a plataforma?</h4>
                      <p className="text-sm text-gray-600">
                        Você solicita uma petição, um redator qualificado a elabora e entrega no prazo.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Qual o prazo de entrega?</h4>
                      <p className="text-sm text-gray-600">
                        Varia de 24h a 7 dias dependendo da complexidade da petição.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Como me tornar redator?</h4>
                      <p className="text-sm text-gray-600">
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
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ainda não é nosso cliente?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e comece a usar a Veredicta hoje mesmo
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50"
              onClick={() => navigate('/auth/register')}
            >
              Cadastrar Gratuitamente
            </Button>
            <Button 
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-100 border-0 font-semibold"
              onClick={() => navigate('/auth/login')}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}