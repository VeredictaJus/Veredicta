# 🎨 Componente Logo Padronizado

## 📋 Visão Geral

O componente `Logo` foi criado para padronizar o uso do logo da Veredicta em toda a plataforma, garantindo consistência visual e funcionalidade.

## 🔧 Funcionalidades

### ✅ **Características Principais:**
- **Tamanhos padronizados**: `sm`, `md`, `lg`, `xl`
- **Navegação inteligente**: Redireciona para a página correta baseada no role do usuário
- **Clicável por padrão**: Com hover effects e transições suaves
- **Texto opcional**: Pode mostrar ou ocultar o texto "Veredicta"
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### 🎯 **Tamanhos Disponíveis:**
- **`sm`**: `h-6` (24px) - Para headers pequenos
- **`md`**: `h-8` (32px) - Tamanho padrão
- **`lg`**: `h-10` (40px) - Para sidebars e layouts principais
- **`xl`**: `h-12` (48px) - Para páginas de autenticação e landing

## 📖 Como Usar

### **Uso Básico:**
```tsx
import Logo from '@/components/ui/Logo';

// Logo padrão (clicável, com texto, tamanho médio)
<Logo />

// Logo grande para sidebar
<Logo size="lg" />

// Logo sem texto
<Logo showText={false} />

// Logo não clicável (para páginas de autenticação)
<Logo clickable={false} />
```

### **Props Disponíveis:**
```tsx
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';  // Tamanho do logo
  showText?: boolean;                 // Mostrar texto "Veredicta"
  className?: string;                 // Classes CSS adicionais
  clickable?: boolean;               // Se deve ser clicável
}
```

## 🧭 **Navegação Inteligente**

O logo redireciona automaticamente para a página correta baseada no role do usuário:

- **Cliente**: `/client` (Dashboard do cliente)
- **Redator**: `/writer` (Dashboard do redator)
- **Admin**: `/admin` (Dashboard do admin)
- **Não logado**: `/` (Página inicial)

## 🎨 **Estilos e Animações**

### **Hover Effects:**
- Opacidade reduzida (80%) ao passar o mouse
- Transição suave de 200ms
- Mantém acessibilidade e usabilidade

### **Responsividade:**
- Adapta-se automaticamente a diferentes tamanhos
- Mantém proporções corretas
- Funciona bem em mobile e desktop

## 📁 **Arquivos Atualizados**

### **Componentes de Layout:**
- ✅ `Sidebar.tsx` - Logo grande e clicável
- ✅ `WriterLayout.tsx` - Logo grande e clicável  
- ✅ `AdminSidebar.tsx` - Logo grande e clicável

### **Páginas de Autenticação:**
- ✅ `NewLoginForm.tsx` - Logo extra grande, não clicável

### **Páginas Públicas:**
- ✅ `LandingPage.tsx` - Logo extra grande no header, logo grande no footer

## 🔄 **Migração de Código Antigo**

### **Antes:**
```tsx
import logoImage from '@/assets/images/veredicta-logo.png';

<img
  src={logoImage}
  alt="Veredicta Logo"
  className="h-8 w-auto"
/>
<span className="text-lg font-semibold text-gray-900">Veredicta</span>
```

### **Depois:**
```tsx
import Logo from '@/components/ui/Logo';

<Logo size="lg" />
```

## 🎯 **Benefícios**

### **Consistência Visual:**
- Tamanhos padronizados em toda a plataforma
- Espaçamento consistente entre logo e texto
- Cores e fontes uniformes

### **Manutenibilidade:**
- Um único componente para gerenciar
- Fácil atualização de estilos
- Redução de código duplicado

### **Experiência do Usuário:**
- Navegação intuitiva (logo sempre leva para home)
- Feedback visual consistente
- Acessibilidade melhorada

### **Desenvolvimento:**
- Código mais limpo e organizado
- Menos imports desnecessários
- Facilita futuras atualizações

## 🚀 **Próximos Passos**

1. **Atualizar páginas restantes** que ainda usam o logo antigo
2. **Adicionar animações** mais sofisticadas se necessário
3. **Implementar tema escuro** se aplicável
4. **Otimizar para mobile** se necessário

## 📝 **Notas Importantes**

- O componente usa `useNewAuth()` para determinar o role do usuário
- A navegação é baseada no contexto de autenticação atual
- O logo mantém acessibilidade com `alt` text apropriado
- Funciona com React Router para navegação SPA

## 🔧 **Manutenção**

Para atualizar o logo em toda a plataforma:
1. Substitua a imagem em `/src/assets/images/veredicta-logo.png`
2. O componente `Logo` automaticamente refletirá a mudança
3. Não é necessário alterar código em múltiplos arquivos
