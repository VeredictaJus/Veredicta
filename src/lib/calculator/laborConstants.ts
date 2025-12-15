// Constantes legais atualizadas para 2024
export const LABOR_CONSTANTS = {
  // Valores básicos
  MINIMUM_WAGE: 1412.00, // Salário mínimo 2024
  
  // Percentuais legais
  PERCENTAGES: {
    VACATION_BONUS: 1/3, // 1/3 constitucional
    FGTS_RATE: 0.08, // 8% FGTS
    FGTS_PENALTY: 0.40, // 40% multa rescisória
    INSALUBRITY: {
      LOW: 0.10, // 10%
      MEDIUM: 0.20, // 20%
      HIGH: 0.40, // 40%
    },
    DANGEROUSNESS: 0.30, // 30%
    NIGHT_SHIFT: 0.20, // 20%
    OVERTIME: {
      WEEKDAY: 0.50, // 50%
      WEEKEND_HOLIDAY: 1.00, // 100%
    },
  },
  
  // Limites e prazos
  LIMITS: {
    DAILY_HOURS: 8,
    WEEKLY_HOURS: 44,
    LUNCH_BREAK_MIN: 60, // 1 hora mínima
    BETWEEN_SHIFTS_MIN: 660, // 11 horas em minutos
    NIGHT_SHIFT_HOUR_MINUTES: 52.5, // Hora noturna reduzida
  },
  
  // Prazos prescricionais
  PRESCRIPTION: {
    LABOR_CLAIMS: 5, // 5 anos (até o limite de 2 anos após extinção)
    POST_TERMINATION: 2, // 2 anos após término do contrato
  },
  
  // Horários noturnos
  NIGHT_SHIFT: {
    START: '22:00',
    END: '05:00',
  },
  
  // Bases de cálculo
  CALCULATION_BASIS: {
    INSALUBRITY_MIN_WAGE: 'MINIMUM_WAGE',
    INSALUBRITY_BASE_SALARY: 'BASE_SALARY',
    DANGEROUSNESS_BASE_SALARY: 'BASE_SALARY',
  },
};

export const LEGAL_BASIS = {
  SEVERANCE: [
    'Art. 477, CLT - Homologação rescisória',
    'Art. 487, CLT - Aviso prévio',
    'Art. 142, CLT - Férias proporcionais',
    'Lei nº 8.036/90 - FGTS e multa de 40%',
  ],
  OVERTIME: [
    'Art. 7º, XVI, CF/88 - Horas extras mínimo 50%',
    'Art. 59, CLT - Compensação de jornada',
    'Súmula 85, TST - Compensação de jornada',
  ],
  INTERVALS: [
    'Art. 71, CLT - Intervalo intrajornada',
    'Art. 66, CLT - Intervalo interjornada',
    'Súmula 437, TST - Intervalo para refeição',
  ],
  ADDITIONALS: [
    'Art. 192, CLT - Insalubridade',
    'Art. 193, CLT - Periculosidade',
    'Art. 73, CLT - Adicional noturno',
  ],
  FUNCTION_DEVIATION: [
    'Súmula 378, TST - Desvio de função',
    'Art. 468, CLT - Alteração contratual',
  ],
};