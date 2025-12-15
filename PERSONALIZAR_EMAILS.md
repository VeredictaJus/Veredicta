# 🎨 Como Personalizar os Templates de Email

## ✅ Templates Melhorados Criados!

Criei templates totalmente personalizáveis em: `src/services/emailTemplates.ts`

---

## 🖼️ Como Adicionar seu Logo

### **Opção 1: Hospedar no Supabase Storage (Recomendado)**

#### Passo 1: Upload do Logo

1. Acesse: **https://dmsodonmkffyvbuxtxec.supabase.co** (Painel do Supabase)
2. Vá em **Storage** no menu lateral
3. Crie um bucket público (se não tiver):
   - Nome: `email-assets`
   - Public: ✅ SIM
4. Faça upload do logo da Veredicta:
   - Arquivo: `veredicta-logo.png`
5. Copie a **URL pública** do logo

#### Passo 2: Adicionar no Template

Abra `src/services/emailTemplates.ts` e edite a linha 11:

```typescript
// De:
const LOGO_URL = 'https://seu-dominio.com/logo.png';

// Para:
const LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/email-assets/veredicta-logo.png';
```

#### Passo 3: Adicionar no HTML

No arquivo `emailTemplates.ts`, adicione o logo no header. Procure por:

```typescript
<div class="header">
  <h1 class="header-title">🎉 Bem-vindo ao Veredicta!</h1>
</div>
```

E substitua por:

```typescript
<div class="header">
  <!-- Logo -->
  <img src="${LOGO_URL}" alt="Veredicta" class="logo" />
  <h1 class="header-title">🎉 Bem-vindo ao Veredicta!</h1>
</div>
```

---

### **Opção 2: Usar Logo em Base64** (Para pequenas imagens)

Se o logo for pequeno (< 50KB):

```typescript
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

// No HTML:
<img src="${LOGO_BASE64}" alt="Veredicta" class="logo" />
```

Para converter imagem para base64:
1. Use: https://www.base64-image.de/
2. Faça upload do logo
3. Copie o código base64

---

## 🎨 Personalizar Cores

Edite o objeto `COLORS` em `emailTemplates.ts`:

```typescript
const COLORS = {
  primary: '#ea580c',      // Laranja principal - mude aqui!
  primaryDark: '#c2410c',  // Laranja escuro
  secondary: '#f97316',    // Laranja secundário
  success: '#10b981',      // Verde (petição concluída)
  danger: '#ef4444',       // Vermelho (alertas)
  info: '#6366f1',         // Azul (reset senha)
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
};
```

**Exemplo:** Se quiser usar azul em vez de laranja:
```typescript
const COLORS = {
  primary: '#3b82f6',      // Azul
  primaryDark: '#2563eb',  // Azul escuro
  // ...
};
```

---

## ✏️ Personalizar Layout

### **Adicionar Seções Customizadas**

No arquivo `emailTemplates.ts`, você pode adicionar qualquer HTML:

```typescript
// Exemplo: Adicionar banner promocional
<div style="background: #fef3c7; padding: 20px; text-align: center; margin: 20px 0;">
  <h3 style="color: #ea580c; margin: 0 0 10px;">🎁 Oferta Especial!</h3>
  <p>Ganhe 20% de desconto no plano Pro este mês!</p>
  <a href="${appUrl}/plans" style="color: #ea580c; font-weight: bold;">Ver Planos →</a>
</div>
```

### **Modificar Footer**

Edite a seção do footer em `getBaseTemplate()`:

```typescript
<div class="footer">
  <!-- Seu logo em tamanho menor -->
  <img src="${LOGO_URL}" class="footer-logo" alt="Veredicta" />
  
  <p>Plataforma de Petições Jurídicas</p>
  
  <!-- Links sociais -->
  <div class="social-links">
    <a href="https://veredictajus.com">Website</a> •
    <a href="mailto:contato@veredictajus.com">Contato</a> •
    <a href="https://veredictajus.com/ajuda">Ajuda</a>
  </div>
  
  <!-- Adicione redes sociais se tiver -->
  <div style="margin: 15px 0;">
    <a href="https://instagram.com/veredicta">
      <img src="URL_DO_ICONE_INSTAGRAM" width="24" height="24" alt="Instagram" />
    </a>
    <a href="https://linkedin.com/company/veredicta">
      <img src="URL_DO_ICONE_LINKEDIN" width="24" height="24" alt="LinkedIn" />
    </a>
  </div>
  
  <p>© ${new Date().getFullYear()} Veredicta. Todos os direitos reservados.</p>
</div>
```

---

## 🆕 Criar Novos Templates

Adicione em `emailTemplates.ts`:

```typescript
/**
 * Template de Plano Expirado
 */
export function planExpiredEmailTemplate(
  userName: string,
  planName: string,
  expiryDate: string,
  appUrl: string
): string {
  const content = `
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      <h1 class="header-title">⚠️ Plano Expirado</h1>
    </div>
    
    <div class="content">
      <p>Olá <strong style="color: #ea580c">${userName}</strong>,</p>
      
      <p>Seu plano <strong>${planName}</strong> expirou em ${expiryDate}.</p>
      
      <div class="alert-box">
        <strong>❌ Acesso Limitado</strong>
        <p style="margin: 10px 0 0;">
          Você não poderá criar novas petições até renovar seu plano.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/#/client/plans" class="button">
          🔄 Renovar Plano
        </a>
      </div>
      
      <p>Atenciosamente,<br><strong style="color: #ea580c;">Equipe Veredicta</strong></p>
    </div>
  `;
  
  return getBaseTemplate(content);
}
```

E use assim:

```typescript
await EmailService.sendEmail({
  to: user.email,
  subject: '⚠️ Seu plano expirou',
  html: planExpiredEmailTemplate(user.name, 'Pro', '01/11/2025', appUrl)
});
```

---

## 🎯 Exemplos de Customizações

### **1. Mudar Fonte**

No CSS do `getBaseTemplate()`:

```css
body {
  font-family: 'Georgia', 'Times New Roman', serif; /* Fonte serifada */
  /* ou */
  font-family: 'Courier New', monospace; /* Fonte mono */
}
```

### **2. Adicionar Imagem de Header**

```html
<div class="header" style="background-image: url('URL_DA_IMAGEM'); background-size: cover;">
  <div style="background: rgba(234, 88, 12, 0.9); padding: 30px;">
    <img src="${LOGO_URL}" class="logo" />
    <h1 class="header-title">Título</h1>
  </div>
</div>
```

### **3. Card de Destaque**

```html
<div style="
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px 0;
">
  <h2 style="margin: 0 0 10px;">📢 Novidade!</h2>
  <p>Confira nossa nova funcionalidade de cálculos trabalhistas!</p>
  <a href="${appUrl}/calculator" style="
    background: white;
    color: #ea580c;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    display: inline-block;
    margin-top: 10px;
  ">
    Experimentar Agora
  </a>
</div>
```

### **4. Lista de Benefícios com Ícones**

```html
<div style="margin: 20px 0;">
  <div style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="color: #10b981; font-size: 24px; margin-right: 10px;">✓</span>
    <div>
      <strong>Redatores Especializados</strong>
      <p style="margin: 5px 0 0; color: #6b7280;">Profissionais qualificados na sua área</p>
    </div>
  </div>
  
  <div style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="color: #10b981; font-size: 24px; margin-right: 10px;">✓</span>
    <div>
      <strong>Chat em Tempo Real</strong>
      <p style="margin: 5px 0 0; color: #6b7280;">Comunicação direta com o redator</p>
    </div>
  </div>
</div>
```

---

## 📱 Responsividade

Os templates já são responsivos! No `@media` query:

```css
@media only screen and (max-width: 600px) {
  .email-wrapper {
    padding: 20px 10px;
  }
  .content {
    padding: 30px 20px;
  }
  .header-title {
    font-size: 24px;
  }
}
```

Adicione mais ajustes se necessário!

---

## 🧪 Testar Mudanças

Depois de personalizar:

1. Salve os arquivos
2. Reinicie o servidor (Ctrl+C → `npm run dev`)
3. Acesse: `http://localhost:5176/#/test-email`
4. Envie um email de teste
5. Veja o resultado no seu email!

---

## 📚 Recursos Úteis

### **Ferramentas de Email HTML:**
- [Can I Email](https://www.caniemail.com/) - Compatibilidade CSS
- [Email on Acid](https://www.emailonacid.com/) - Testar em vários clientes
- [Really Good Emails](https://reallygoodemails.com/) - Inspiração

### **Ícones/Imagens:**
- [Heroicons](https://heroicons.com/) - Ícones SVG
- [Unsplash](https://unsplash.com/) - Imagens gratuitas
- [Canva](https://www.canva.com/) - Criar banners

---

## 💡 Dicas Profissionais

1. **✅ Use tabelas** para layout (melhor compatibilidade com Outlook)
2. **✅ Inline CSS** sempre que possível
3. **✅ Teste em vários clientes** (Gmail, Outlook, Apple Mail)
4. **✅ Mantenha largura max de 600px**
5. **✅ Use cores da marca** para consistência
6. **✅ Adicione ALT text** nas imagens
7. **✅ Botões com padding generoso** (fácil de clicar no mobile)

---

## 🎯 Próximos Passos

1. Upload do logo no Supabase Storage
2. Copiar URL pública do logo
3. Adicionar no `LOGO_URL` em `emailTemplates.ts`
4. Testar os emails
5. Personalizar cores/textos conforme necessário

**Seus emails agora estão muito mais profissionais! 🎉**







