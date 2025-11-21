import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Building, Users, Shield } from 'lucide-react';
import logoImage from '@/assets/images/veredicta-logo.png';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine user type based on email for admin
      let userType: 'client' | 'writer' | 'admin' = 'client';
      if (email === 'contato@veredictajus.com' || email === 'admin@veredicta.com') {
        userType = 'admin';
      } else if (email === 'redator@juridico.com') {
        userType = 'writer';
      }

      console.log('Login attempt:', { email, userType, password: password.length + ' chars' });
      const success = await login(email, password, userType);
      if (success) {
        toast.success('Login realizado com sucesso!');
        // Redirect will be handled by the AuthContext
      } else {
        toast.error('Email ou senha incorretos. Tente novamente.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (userType: 'client' | 'writer' | 'admin') => {
    const demoCredentials = {
      client: { email: 'cliente@escritorio.com', password: '123456' },
      writer: { email: 'redator@juridico.com', password: '123456' },
      admin: { email: 'contato@veredictajus.com', password: 'admin123' }
    };

    const credentials = demoCredentials[userType];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <img 
            src={logoImage} 
            alt="Veredicta" 
            className="h-12 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          />
          <h1 className="text-2xl font-bold text-foreground mt-2">Veredicta</h1>
          <p className="text-gray-600 text-sm">Faça login para acessar a plataforma</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Entrar na Plataforma
            </CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link 
                  to="/auth/register" 
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                >
                  Registre-se
                </Link>
              </p>
            </div>

            {/* Demo Accounts Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">Contas de demonstração:</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin('client')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  <span className="flex-1">Cliente (Escritório)</span>
                  <Badge variant="secondary" className="ml-2">Demo</Badge>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin('writer')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="flex-1">Redator Jurídico</span>
                  <Badge variant="secondary" className="ml-2">Demo</Badge>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin('admin')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="flex-1">Administrador</span>
                  <Badge variant="secondary" className="ml-2">Demo</Badge>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}