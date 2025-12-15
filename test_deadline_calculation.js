// Script de teste para verificar o cálculo de prazo
// Execute este código no console do navegador para testar

// Feriados nacionais brasileiros (fixos e móveis)
const getBrazilianHolidays = (year) => {
  const holidays = [
    // Feriados fixos
    new Date(year, 0, 1),   // Confraternização Universal
    new Date(year, 3, 21),  // Tiradentes
    new Date(year, 4, 1),   // Dia do Trabalhador
    new Date(year, 8, 7),   // Independência do Brasil
    new Date(year, 9, 12),  // Nossa Senhora Aparecida
    new Date(year, 10, 2),  // Finados
    new Date(year, 10, 15), // Proclamação da República
    new Date(year, 11, 25), // Natal
  ];

  // Feriados móveis (aproximação)
  const easter = getEasterDate(year);
  holidays.push(
    new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000), // Sexta-feira Santa
    new Date(easter.getTime() - 47 * 24 * 60 * 60 * 1000), // Carnaval (aproximado)
    new Date(easter.getTime() + 60 * 24 * 60 * 60 * 1000)  // Corpus Christi (aproximado)
  );

  return holidays;
};

// Função para calcular a Páscoa (algoritmo de Gauss)
const getEasterDate = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  
  return new Date(year, n - 1, p + 1);
};

// Função para verificar se uma data é feriado
const isHoliday = (date) => {
  const year = date.getFullYear();
  const holidays = getBrazilianHolidays(year);
  
  return holidays.some(holiday => 
    holiday.getDate() === date.getDate() && 
    holiday.getMonth() === date.getMonth()
  );
};

// Função para verificar se uma data é fim de semana
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Domingo = 0, Sábado = 6
};

// Função para calcular prazo considerando feriados e fins de semana
const calculateDeadlineWithHolidays = (baseDays) => {
  const startDate = new Date();
  let currentDate = new Date(startDate);
  let businessDaysAdded = 0;
  
  console.log('📅 Calculando prazo com feriados:', { baseDays, startDate: startDate.toISOString() });
  
  while (businessDaysAdded < baseDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // Pular fins de semana e feriados
    if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
      businessDaysAdded++;
      console.log(`✅ Dia útil ${businessDaysAdded}/${baseDays}: ${currentDate.toLocaleDateString('pt-BR')}`);
    } else {
      const reason = isWeekend(currentDate) ? 'fim de semana' : 'feriado';
      console.log(`⏭️ Pulando ${reason}: ${currentDate.toLocaleDateString('pt-BR')}`);
    }
  }
  
  console.log('🎯 Prazo final:', { 
    deadline: currentDate.toISOString(),
    totalDays: Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  });
  
  return currentDate.toISOString();
};

// TESTE: Calcular prazo para 4 dias úteis
console.log('🧪 TESTE: Calculando prazo para 4 dias úteis');
const testDeadline = calculateDeadlineWithHolidays(4);
console.log('📊 Resultado do teste:', testDeadline);

// TESTE: Verificar feriados de 2025
console.log('📅 Feriados de 2025:');
const holidays2025 = getBrazilianHolidays(2025);
holidays2025.forEach(holiday => {
  console.log(`- ${holiday.toLocaleDateString('pt-BR')}`);
});
















