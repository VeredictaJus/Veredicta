/**
 * Configurações de Email
 */

// Logo da Veredicta hospedado no Supabase (URL pública)
// Logo geométrico laranja com quadrados sobrepostos e checkmark
export const EMAIL_LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Design%20sem%20nome%20(15).png';

// Texto "Veredicta" com ponto laranja no "i" (imagem)
export const EMAIL_TEXT_LOGO_URL = 'https://dmsodonmkffyvbuxtxec.supabase.co/storage/v1/object/public/assets/Black%20Brown%20Modern%20Creative%20Portfolio%20Presentation%20(3).png';

// Cores da marca Veredicta
export const EMAIL_COLORS = {
  primary: '#ea580c',      // Laranja principal
  primaryDark: '#c2410c',  // Laranja escuro
  secondary: '#f97316',    // Laranja secundário
  success: '#10b981',      // Verde
  danger: '#ef4444',       // Vermelho
  info: '#6366f1',         // Azul/Roxo
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
};

/**
 * Texto "Veredicta" estilizado com ponto laranja no "i"
 * Para usar em templates HTML de email
 * Usa imagem hospedada no Supabase para compatibilidade máxima
 */
export function getVeredictaText(color: string = '#000000'): string {
  // Retorna a imagem do texto (funciona em 100% dos clientes de email)
  return `<img src="${EMAIL_TEXT_LOGO_URL}" alt="Veredicta" style="display: inline-block; height: 100px; width: auto; vertical-align: middle; margin: 0; padding: 0; border: 0;" />`;
}

