import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FilePlus,
  FolderOpen,
  DollarSign,
  MessageSquare,
  Settings,
  Calculator,
  Lock
} from 'lucide-react';
import { useNewAuth } from '@/contexts/NewAuthContext';
import { useSuspensionCheck } from '@/hooks/useSuspensionCheck';
import { cn } from '@/lib/utils';
import Header from './Header';
import Logo from '@/components/ui/Logo';
import FloatingChatModal from '@/components/chat/FloatingChatModal';
import { toast } from 'sonner';

interface WriterLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { label: 'Dashboard', path: '/writer', icon: <Home className="w-4 h-4" />, feature: null },
  { label: 'Petições Disponíveis', path: '/writer/available', icon: <FilePlus className="w-4 h-4" />, feature: 'petitions' as const },
  { label: 'Minhas Petições', path: '/writer/my-petitions', icon: <FolderOpen className="w-4 h-4" />, feature: 'my-petitions' as const },
  { label: 'Calculadora', path: '/writer/calculator', icon: <Calculator className="w-4 h-4" />, feature: 'calculator' as const },
  { label: 'Cálculos Salvos', path: '/writer/calculator/saved', icon: <FolderOpen className="w-4 h-4" />, feature: 'calculator' as const },
  { label: 'Pagamentos', path: '/writer/payments', icon: <DollarSign className="w-4 h-4" />, feature: 'payments' as const },
  { label: 'Chat', path: '/writer/chat', icon: <MessageSquare className="w-4 h-4" />, feature: 'chat' as const },
  { label: 'Configurações', path: '/writer/settings', icon: <Settings className="w-4 h-4" />, feature: 'settings' as const },
];

export default function WriterLayout({ children }: WriterLayoutProps) {
  const { user } = useNewAuth();
  const location = useLocation();
  const { canAccess, getBlockMessage, isSuspendedOrBlocked } = useSuspensionCheck();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orbY, setOrbY] = useState(30);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Detectar se é a página de chat para aplicar layout especial
  const isChatPage = location.pathname.includes('/chat');

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updateOrbPosition = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const ratio = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
      setOrbY(22 + ratio * 62);
    };

    updateOrbPosition();
    el.addEventListener('scroll', updateOrbPosition, { passive: true });
    return () => el.removeEventListener('scroll', updateOrbPosition);
  }, [location.pathname, isChatPage]);

  const handleRestrictedClick = (e: React.MouseEvent, feature: string, itemLabel: string) => {
    e.preventDefault();
    const message = getBlockMessage(`acessar ${itemLabel}`);
    toast.error(message, {
      duration: 4000,
      action: {
        label: 'Suporte',
        onClick: () => window.location.href = '/#/writer/chat'
      }
    });
  };

  return (
    <div className={`relative flex ${isChatPage ? 'h-screen' : 'min-h-screen'} bg-background overflow-hidden`}>
      <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute -bottom-60 -left-60 h-[520px] w-[520px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute left-1/3 h-[420px] w-[420px] rounded-full opacity-15"
          style={{ top: '46%', background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute right-[-220px] h-[560px] w-[560px] rounded-full opacity-26 transition-[top] duration-300"
          style={{ top: `calc(${orbY}% - 280px)`, background: 'radial-gradient(circle, rgba(249,115,22,0.95) 0%, rgba(249,115,22,0.15) 42%, transparent 72%)', filter: 'blur(86px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Sidebar */}
      {/* overlay no mobile */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 border-r border-border shadow-sm flex flex-col text-sm z-50 transition-transform duration-200 lg:translate-x-0
        overflow-hidden
        bg-gradient-to-b from-background to-muted/30
        dark:from-slate-950 dark:to-slate-900/30
        before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:z-0
        before:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_55%)]
        dark:before:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_55%)]
        ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section - Separado com borda inferior */}
        <div className="p-6 border-b border-border relative z-10">
          {(() => {
            const role = (user?.role || '').toString().toLowerCase();
            const homePath =
              role === 'admin' ? '/admin' :
              role === 'client' ? '/client' :
              '/writer';

            return (
              <Link
                to={homePath}
                className="group flex items-center justify-center"
                title="Ir para o Dashboard"
              >
                <Logo size="md" textSize="xl" align="center" clickable={false} />
              </Link>
            );
          })()}
        </div>

        {/* Menu Section */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto relative z-10">
          {menuItems.map((item) => {
            const isRestricted = item.feature && !canAccess(item.feature);
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={isRestricted ? '#' : item.path}
                onClick={(e) => isRestricted ? handleRestrictedClick(e, item.feature!, item.label) : undefined}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isRestricted 
                    ? 'text-muted-foreground/50 cursor-not-allowed opacity-60'
                    : isActive
                      ? 'bg-primary/10 text-foreground border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:-translate-y-[1px] hover:shadow-sm hover:border-border/60 motion-reduce:transform-none'
                )}
                title={isRestricted ? 'Bloqueado durante suspensão' : undefined}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  )}
                />
                {item.icon}
                <span className={cn('flex-1 truncate', isActive ? 'font-semibold' : 'font-medium')}>{item.label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-sm shadow-primary/70" />}
                {isRestricted && <Lock className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 flex flex-col ml-0 lg:ml-64">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <div ref={contentRef} className={isChatPage ? "pt-20 px-6 flex-1 min-h-0 overflow-hidden" : "p-6 pt-24 flex-1 overflow-y-auto"}>
          {children}
        </div>
      </main>
      <FloatingChatModal />
    </div>
  );
}
