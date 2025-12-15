// Utilitário simples para feriados nacionais do Brasil
// Inclui móveis (Páscoa, Carnaval, Corpus Christi, Sexta-Feira Santa) e fixos

function calculateEasterDate(year: number): Date {
  // Algoritmo de Meeus/Jones/Butcher
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
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Mar, 4=Abr
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export interface Holiday {
  date: string; // ISO yyyy-mm-dd
  name: string;
}

export function getBrazilNationalHolidays(year: number): Holiday[] {
  const easter = calculateEasterDate(year);
  const carnival = addDays(easter, -47);
  const goodFriday = addDays(easter, -2);
  const corpusChristi = addDays(easter, 60);

  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  const fixed = [
    { date: `${year}-01-01`, name: 'Confraternização Universal' },
    { date: `${year}-04-21`, name: 'Tiradentes' },
    { date: `${year}-05-01`, name: 'Dia do Trabalhador' },
    { date: `${year}-09-07`, name: 'Independência do Brasil' },
    { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida' },
    { date: `${year}-11-02`, name: 'Finados' },
    { date: `${year}-11-15`, name: 'Proclamação da República' },
    { date: `${year}-12-25`, name: 'Natal' },
  ];

  const movable = [
    { date: toIso(carnival), name: 'Carnaval' },
    { date: toIso(goodFriday), name: 'Sexta-Feira Santa' },
    { date: toIso(easter), name: 'Páscoa' },
    { date: toIso(corpusChristi), name: 'Corpus Christi' },
  ];

  return [...fixed, ...movable];
}

export function getHolidaysInRange(startIso: string, endIso: string): Holiday[] {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const years: number[] = [];
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) years.push(y);
  const all: Holiday[] = years.flatMap(getBrazilNationalHolidays);
  return all.filter(h => {
    const d = new Date(h.date);
    return d >= start && d <= end;
  }).sort((a, b) => a.date.localeCompare(b.date));
}











