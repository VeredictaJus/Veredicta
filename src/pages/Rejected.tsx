import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Mail, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function Rejected() {
  const navigate = useNavigate();

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
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Aplicação Não Aprovada
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              Infelizmente, sua aplicação não foi aprovada desta vez
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Motivos Possíveis
              </h3>
              
              <ul className="text-sm text-gray-600 mb-4 space-y-2 text-left">
                <li>• Petições não atendem aos padrões de qualidade</li>
                <li>• Informações profissionais incompletas</li>
                <li>• Documentos não legíveis ou corrompidos</li>
                <li>• Especialização não alinhada com nossa demanda</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Feedback:</strong> Você receberá um email com detalhes 
                      sobre os motivos da não aprovação e sugestões para melhorias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Atenção:</strong> Você poderá enviar uma nova solicitação de cadastro 
                      após <strong>30 dias</strong> da data desta rejeição.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth/register')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
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
