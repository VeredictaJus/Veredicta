import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Mail, ArrowLeft } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { useNewAuth } from '@/contexts/NewAuthContext';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout } = useNewAuth();

  const handleBackToHome = async () => {
    await logout();
    // O logout já faz navigate('/'), não precisa chamar novamente
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <AnimatedBackground />

      {/* Overlays: mantém os caracteres, mas padroniza o fundo dark + halo laranja */}
      <div aria-hidden className="fixed inset-0 z-[1] bg-slate-950/55" />
      <div
        aria-hidden
        className="fixed inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.26),transparent_55%)]"
      />
      <div
        aria-hidden
        className="fixed inset-0 z-[3] bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_55%)]"
      />
      
      <div className="w-full max-w-4xl relative z-10">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="text-center pb-4 px-8">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-orange-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Aguardando Aprovação
            </CardTitle>
            
            <div className="text-gray-600 text-center text-sm leading-relaxed">
              Sua conta está sendo analisada pela nossa equipe
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Análise em Andamento
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Nossa equipe está analisando suas petições autorais e informações profissionais. 
                Você receberá um email em até <strong>5 dias úteis</strong> com o resultado da análise.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center">
                  <div className="flex-shrink-0 mr-3">
                    <Mail className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-800 text-center">
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
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 focus:bg-blue-50 focus:border-blue-700 focus:text-blue-700 active:bg-blue-100 active:border-blue-700 active:text-blue-700 font-bold"
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
