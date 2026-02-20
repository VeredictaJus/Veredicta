import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { getCurrentYear } from '@/utils/dateUtils';

export default function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center shrink-0">
              <Link
                to="/"
                aria-label="Voltar para a página inicial"
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <Logo size="xl" clickable={false} textColor="light" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 ml-auto justify-end">
              <Button
                variant="outline"
                className="bg-white/5 text-white border-white/15 hover:border-white/25 hover:bg-white/10 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/login')}
              >
                Entrar
              </Button>
              <Button
                variant="outline"
                className="hidden sm:inline-flex bg-white/5 text-white border-white/15 hover:border-white/25 hover:bg-white/10 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.18)] text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/register')}
              >
                Cadastrar-se
              </Button>
            </div>

            <div className="w-full sm:hidden">
              <Button
                variant="outline"
                className="w-full bg-white/5 text-white border-white/15 hover:border-white/25 hover:bg-white/10 text-sm"
                onClick={() => navigate('/solicitar-demonstracao')}
              >
                Solicitar demonstração
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-950 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Logo size="lg" clickable={false} textColor="light" />
              </div>
              <p className="text-slate-400 max-w-xs">Inteligência humana aplicada à rotina jurídica.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-3">Produto</h4>
              <ul className="space-y-2 text-slate-400 flex flex-col items-center">
                <li>
                  <button
                    onClick={() => navigate('/funcionalidades')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/precos')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Preços
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/calculadora')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Calculadora
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-3">Suporte</h4>
              <ul className="space-y-2 text-slate-400 flex flex-col items-center">
                <li>
                  <button
                    onClick={() => navigate('/central-ajuda')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Central de Ajuda
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/contato')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Contato
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/status')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Status
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center text-center">
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-slate-400 flex flex-col items-center">
                <li>
                  <button
                    onClick={() => navigate('/termos')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Termos de Serviço
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/privacidade')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Política de Privacidade
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10">
          <div className="container mx-auto px-4 py-6 text-center text-slate-400">
            <p>&copy; {getCurrentYear()} Veredicta. Todos os direitos reservados.</p>
            <p className="mt-1 text-xs text-slate-500">CNPJ: 61.992.118/0001-38</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

