// ============================================
// FILTRO DE INFORMAÇÕES SENSÍVEIS NO CHAT
// ============================================
// Detecta e mascara informações pessoais em mensagens

/**
 * Detecta e mascara informações sensíveis em uma mensagem
 * @param message - Mensagem original
 * @returns Mensagem filtrada com informações sensíveis mascaradas
 */
const BLOCKED_PLACEHOLDER = '[conteúdo bloqueado]';

const explicitContentPatterns = [
  () => /\b(nude(?:s|z)?|nudz?|nudez)\b/gi,
  () => /\b(porn(?:o|ô|ografia|ográfico|ográfica)?|p0rn|pr0n)\b/gi,
  () => /\b(sex(?:o|ual|ualidade|ualmente|y)?|s[e3]xo)\b/gi,
  () => /\b(er[óo]tico|sensual|obsceno|nsfw|hotwife|onlyfans)\b/gi,
  () => /\b(pelad[oa]s?|sem\s+roupa|nu[ao]s?|nudismo|nudez)\b/gi,
  () => /(foto|vid[ée]o|video|imagem)(?:s)?\s+(?:de\s+)?(nudez|nude|pelad[oa]s?|sem\s+roupa|conte[uú]do\s+adulto|nsfw)/gi,
  () => /\b(masturba(?:[çc][ãa]o)?|boquete|oral|punheta|gozar|orgasm[oa]?|ejacula(?:[çc][ãa]o)?|ejaculando|ejaculador|69|tes[ãa]o|tesud[oa])\b/gi,
  () => /\b(xvideos|xnxx|pornhub|redtube|xhamster|chaturbate|camgirl)\b/gi,
  () => /\b(conte[uú]do\s+adulto|conteudo\s+adulto)\b/gi,
  () => /n[\s\.\-_*]*u[\s\.\-_*]*d[\s\.\-_*]*e[\s\.\-_*]*s?/gi,
  () => /p[\s\.\-_*]*[o0][\s\.\-_*]*r[\s\.\-_*]*n/gi,
];

const profanityPatterns = [
  () => /\b(merda|bosta|caralh[oa]|porra|puta|puto|putaria|putinha|safad[ao]|cacete|piroca|pica|buceta|xoxota|xana|vadia|vadio|fdp|filha?\s*da\s*puta|desgr[aá]ça|cuz[ãa]o|arrombado|arrombada|desgraçado|desgraçada|viado|viad[oa]|foda-se|fodase|foder|fodendo|fodid[oa]|corno|corna|cabr[oã]o|cabr[aã]o|chupa\s*meu\s*c[uú])\b/gi,
  () => /\b(fuck|shit|bitch|asshole|motherfucker|dick|cock|pussy|cum|slut|whore|bastard|bollocks|wanker|jerk(?:off)?)\b/gi,
];

function applyPatternGroup(value: string, factories: Array<() => RegExp>): string {
  let result = value;
  factories.forEach(createRegex => {
    const regex = createRegex();
    result = result.replace(regex, BLOCKED_PLACEHOLDER);
  });
  return result;
}

export function filterSensitiveInfo(message: string): string {
  if (!message || typeof message !== 'string') return message;

  let filtered = message;

  // 🚨 ANTI-BURLA 1: Detectar números separados em LINHAS (tentativa de burlar filtro)
  // Exemplo: "4\n4\n9\n9\n8\n7\n6\n5\n4\n3\n2\n1" = telefone
  const linesWithSingleDigits = filtered.split('\n').filter(line => /^\d$/.test(line.trim()));
  
  if (linesWithSingleDigits.length >= 8) {
    // Se há 8 ou mais linhas com dígitos únicos, é suspeito
    const digitsSequence = linesWithSingleDigits.join('');
    
    // Verificar se essa sequência forma um número de telefone/CPF/CNPJ
    const isSuspiciousNumber = 
      digitsSequence.length >= 8 && // Pelo menos 8 dígitos
      digitsSequence.length <= 14; // No máximo 14 dígitos
    
    if (isSuspiciousNumber) {
      // Substituir todas as linhas de dígitos únicos por ***
      filtered = filtered.split('\n').map(line => {
        if (/^\d$/.test(line.trim())) {
          return '***';
        }
        return line;
      }).join('\n');
    }
  }

  // 🚨 ANTI-BURLA 2: Detectar números separados por ESPAÇOS/PONTOS/VÍRGULAS
  // Exemplo: "4 4 9 9 8 7 6 5 4 3 2 1" ou "4.4.9.9.8.7.6.5"
  const spacedDigitsPattern = /(\d\s+){7,}\d/g; // 8+ dígitos separados por espaços
  const punctuatedDigitsPattern = /(\d[.,;:\-_]){7,}\d/g; // 8+ dígitos separados por pontuação
  
  filtered = filtered.replace(spacedDigitsPattern, '***');
  filtered = filtered.replace(punctuatedDigitsPattern, '***');

  // 🚨 ANTI-BURLA 3: Detectar números escritos por extenso
  // Exemplo: "quatro quatro nove nove oito sete" = telefone
  const numberWords: { [key: string]: string } = {
    'zero': '0', 'um': '1', 'dois': '2', 'três': '3', 'tres': '3',
    'quatro': '4', 'cinco': '5', 'seis': '6', 'sete': '7',
    'oito': '8', 'nove': '9', 'meia': '6'
  };
  
  const words = filtered.toLowerCase().split(/\s+/);
  let consecutiveNumbers = 0;
  let numberSequence = '';
  
  words.forEach(word => {
    if (numberWords[word]) {
      consecutiveNumbers++;
      numberSequence += numberWords[word];
    } else {
      consecutiveNumbers = 0;
      numberSequence = '';
    }
    
    // Se detectou 8+ números consecutivos, é suspeito
    if (consecutiveNumbers >= 8) {
      // Substituir a sequência de números por extenso por ***
      const wordsPattern = Object.keys(numberWords).join('|');
      const extensoPattern = new RegExp(`(\\b(${wordsPattern})\\s*){8,}`, 'gi');
      filtered = filtered.replace(extensoPattern, '***');
    }
  });

  // 1️⃣ TELEFONES (vários formatos)
  // (11) 98765-4321, 11987654321, +5511987654321, etc.
  const phonePatterns = [
    /\+?\d{2,3}?\s?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/g, // (11) 98765-4321
    /\b\d{10,11}\b/g, // 11987654321
    /\b\d{2}[-\s]?\d{4,5}[-\s]?\d{4}\b/g, // 11-98765-4321
  ];
  phonePatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '***');
  });

  // 2️⃣ EMAIL
  // exemplo@dominio.com
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  filtered = filtered.replace(emailPattern, '***');

  // 3️⃣ CPF (vários formatos)
  // 123.456.789-00, 12345678900
  const cpfPatterns = [
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, // Com ou sem pontos e hífen
  ];
  cpfPatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '***');
  });

  // 4️⃣ CNPJ (vários formatos)
  // 12.345.678/0001-00, 12345678000100
  const cnpjPatterns = [
    /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, // Com ou sem pontos, barra e hífen
  ];
  cnpjPatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '***');
  });

  // 5️⃣ WHATSAPP (menções explícitas)
  // "whatsapp", "zap", "wpp", etc.
  const whatsappPatterns = [
    /\b(whatsapp|whats|wpp|zap)\b/gi,
  ];
  whatsappPatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '***');
  });

  // 6️⃣ LINKS (URLs)
  // http://exemplo.com, www.exemplo.com
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/g;
  filtered = filtered.replace(urlPattern, '***');

  // 7️⃣ NÚMEROS DE CONTA BANCÁRIA (sequências longas de dígitos)
  // 12345-6, 123456
  const accountPattern = /\b\d{4,6}-?\d{1}\b/g;
  filtered = filtered.replace(accountPattern, '***');

  // 8️⃣ PIX (chaves que parecem CPF, CNPJ, email, telefone já foram filtradas)
  // Detectar palavras-chave
  const pixKeywords = /\b(pix|chave\s+pix)\b/gi;
  filtered = filtered.replace(pixKeywords, '***');

  // 9️⃣ LINGUAGEM EXPLÍCITA / IMPRÓPRIA
  filtered = applyPatternGroup(filtered, explicitContentPatterns);
  filtered = applyPatternGroup(filtered, profanityPatterns);

  return filtered;
}

/**
 * Verifica se a mensagem contém informações sensíveis
 * @param message - Mensagem a verificar
 * @returns true se contém informações sensíveis, false caso contrário
 */
export function containsSensitiveInfo(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  
  const filtered = filterSensitiveInfo(message);
  return filtered !== message; // Se mudou, contém info sensível
}

export function containsExplicitLanguage(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const original = message;
  const sanitized = applyPatternGroup(applyPatternGroup(original, explicitContentPatterns), profanityPatterns);
  return sanitized !== original;
}

/**
 * Retorna lista de tipos de informações sensíveis detectadas
 * @param message - Mensagem a analisar
 * @returns Array de tipos detectados
 */
export function detectSensitiveTypes(message: string): string[] {
  const detected: string[] = [];

  if (/\+?\d{2,3}?\s?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/.test(message) || /\b\d{10,11}\b/.test(message)) {
    detected.push('telefone');
  }

  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message)) {
    detected.push('email');
  }

  if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(message)) {
    detected.push('CPF');
  }

  if (/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/.test(message)) {
    detected.push('CNPJ');
  }

  if (/\b(whatsapp|whats|wpp|zap)\b/gi.test(message)) {
    detected.push('WhatsApp');
  }

  if (/https?:\/\/[^\s]+|www\.[^\s]+/.test(message)) {
    detected.push('link');
  }

  if (containsExplicitLanguage(message)) {
    detected.push('conteúdo explícito ou linguagem ofensiva');
  }

  return detected;
}

