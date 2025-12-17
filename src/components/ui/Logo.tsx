import React from 'react';
import { Link } from 'react-router-dom';
import { useNewAuth } from '@/contexts/NewAuthContext';
// Usar logo da pasta public para garantir que funcione no deploy
const logoImage = '/veredicta-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  clickable?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'; // controla tamanho do texto
  align?: 'left' | 'center'; // alinhamento horizontal do grupo logo + texto
  textColor?: 'default' | 'dark' | 'light'; // controla cor do texto
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  clickable = true,
  textSize,
  align = 'left',
  textColor = 'default'
}: LogoProps) {
  const { user } = useNewAuth();

  // Define tamanhos padronizados
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto', 
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto'
  };

  // Define tamanhos do texto
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  } as const;

  // Define tamanhos do círculo laranja baseado no tamanho do texto
  const dotSizeClasses = {
    sm: 'w-0.5 h-0.5',
    md: 'w-0.5 h-0.5',
    lg: 'w-1 h-1', 
    xl: 'w-1 h-1',
    '2xl': 'w-1.5 h-1.5',
    '3xl': 'w-2.5 h-2.5'
  } as const;

  // Define cores do texto
  const textColorClasses = {
    default: 'text-foreground', // Usa a cor padrão do tema
    dark: 'text-gray-900',      // Texto escuro para fundos claros
    light: 'text-white'         // Texto claro para fundos escuros
  };

  // Determina para onde o logo deve redirecionar baseado no role do usuário
  const getHomeHref = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'client':
        return '/client';
      case 'writer':
        return '/writer';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const containerAlign = align === 'center' ? 'justify-center' : '';

  const logoElement = (
    <div className={`flex items-center gap-2 ${containerAlign} ${className}`}>
      <img
        src={logoImage}
        alt="Veredicta Logo"
        className={sizeClasses[size]}
      />
      {showText && (
        <span className={`font-medium ${textColorClasses[textColor]} ${textSizeClasses[textSize || size]} tracking-wide`}>
          Vered
          <span className="relative inline-block">
            <span style={{ textDecoration: 'none', fontFeatureSettings: '"cv01" 1' }}>i</span>
            <span className={`absolute top-1.5 left-1/2 transform -translate-x-1/2 ${dotSizeClasses[textSize || size]} bg-orange-500 rounded-full`}></span>
          </span>
          cta
        </span>
      )}
    </div>
  );

  // Se não deve ser clicável, retorna apenas o elemento
  if (!clickable) {
    return logoElement;
  }

  // Se deve ser clicável, envolve com Link
  return (
    <Link 
      to={getHomeHref()}
      className="hover:opacity-80 transition-opacity duration-200"
    >
      {logoElement}
    </Link>
  );
}
