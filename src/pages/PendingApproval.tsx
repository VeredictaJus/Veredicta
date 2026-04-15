import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Mail, ArrowLeft } from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import AuthBackground from '@/components/ui/AuthBackground';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout } = useNewAuth();

  const handleBackToHome = async () => {
    await logout();
    // O logout já faz navigate('/'), não precisa chamar novamente
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <AuthBackground />
      
      <div className="w-full max-w-4xl relative z-10">
        <Card className="rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(30,64,175,0.12),rgba(30,58,138,0.08))] shadow-[0_8px_32px_rgba(2,6,23,0.55),inset_0_1px_0_rgba(255,255,255,0.10)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
          <CardHeader className="text-center pb-4 px-8">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-orange-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-slate-100 mb-2">
              Aguardando Aprovação
            </CardTitle>
            
            <div className="text-sky-300/80 text-center text-sm leading-relaxed">
              Sua conta está sendo analisada pela nossa equipe
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Análise em Andamento
              </h3>
              
              <p className="text-sm text-sky-300/80 mb-4 leading-relaxed">
                Nossa equipe está analisando suas petições autorais e informações profissionais. 
                Você receberá um email em até <strong>5 dias úteis</strong> com o resultado da análise.
              </p>
              
              <div className="bg-slate-900/45 border border-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0 mr-3">
                    <Mail className="h-5 w-5 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-sky-200/90 text-center">
                      <strong>Importante:</strong> Verifique sua caixa de entrada e spam. 
                      O email conterá instruções para acessar a plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={async () => {
                  await logout();
                  navigate('/auth/login');
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Voltar ao Login
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleBackToHome}
                className="w-full border-white/10 bg-slate-900/45 text-slate-100 hover:bg-slate-900/65 hover:text-white font-bold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
