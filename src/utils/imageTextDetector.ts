// ============================================
// DETECÇÃO DE TEXTO EM IMAGENS (OCR)
// ============================================
// Usa Tesseract.js para ler texto em imagens e detectar informações sensíveis

import Tesseract from 'tesseract.js';
import { containsSensitiveInfo } from './messageFilter';

/**
 * Extrai texto de uma imagem usando OCR
 * @param imageFile - Arquivo de imagem
 * @returns Texto extraído da imagem
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageFile,
      'por', // Português
      {
        logger: (m) => {
          // Log do progresso (opcional)
          if (m.status === 'recognizing text') {
            console.log(`🔍 OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    return text.trim();
  } catch (error) {
    console.error('Erro ao extrair texto da imagem:', error);
    return '';
  }
}

/**
 * Verifica se uma imagem contém informações sensíveis
 * @param imageFile - Arquivo de imagem
 * @returns Objeto com resultado da verificação
 */
export async function checkImageForSensitiveInfo(imageFile: File): Promise<{
  hasSensitiveInfo: boolean;
  detectedText: string;
  reason?: string;
}> {
  // Apenas processar imagens
  if (!imageFile.type.startsWith('image/')) {
    return { hasSensitiveInfo: false, detectedText: '' };
  }

  // Extrair texto da imagem
  const extractedText = await extractTextFromImage(imageFile);
  
  if (!extractedText) {
    // Sem texto detectado, permitir envio
    return { hasSensitiveInfo: false, detectedText: '' };
  }

  console.log('📄 Texto extraído da imagem:', extractedText);

  // Verificar se o texto contém informações sensíveis
  const hasSensitive = containsSensitiveInfo(extractedText);

  if (hasSensitive) {
    return {
      hasSensitiveInfo: true,
      detectedText: extractedText,
      reason: 'A imagem contém informações pessoais (telefone, email, CPF, etc.)'
    };
  }

  return { hasSensitiveInfo: false, detectedText: extractedText };
}

/**
 * Validação rápida de imagem antes do OCR completo
 * (Verifica tamanho, tipo, etc.)
 */
export function shouldProcessImage(file: File): boolean {
  // Apenas imagens
  if (!file.type.startsWith('image/')) return false;
  
  // Imagens muito grandes podem demorar (limite: 5MB)
  if (file.size > 5 * 1024 * 1024) {
    console.warn('⚠️ Imagem muito grande, pulando OCR');
    return false;
  }
  
  // Tipos suportados
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    console.warn('⚠️ Tipo de imagem não suportado para OCR:', file.type);
    return false;
  }
  
  return true;
}







