const DEADLINE_CUTOFF_HOUR = 18;
const DEADLINE_CUTOFF_MINUTE = 0;
const DEADLINE_GRACE_MINUTES = 60;

const getEasterDate = (year: number): Date => {
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

export const getBrazilianHolidays = (year: number): Date[] => {
  const holidays = [
    new Date(year, 0, 1),
    new Date(year, 3, 21),
    new Date(year, 4, 1),
    new Date(year, 8, 7),
    new Date(year, 9, 12),
    new Date(year, 10, 2),
    new Date(year, 10, 15),
    new Date(year, 11, 25),
  ];

  const easter = getEasterDate(year);
  holidays.push(
    new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000),
    new Date(easter.getTime() - 47 * 24 * 60 * 60 * 1000),
    new Date(easter.getTime() + 60 * 24 * 60 * 60 * 1000),
  );

  return holidays;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isHoliday = (date: Date): boolean => {
  const holidays = getBrazilianHolidays(date.getFullYear());
  return holidays.some(
    (holiday) =>
      holiday.getDate() === date.getDate() && holiday.getMonth() === date.getMonth(),
  );
};

const cloneDate = (date: Date) => new Date(date.getTime());

export const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  const result = cloneDate(startDate);
  let added = 0;

  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result) && !isHoliday(result)) {
      added++;
    }
  }

  return result;
};

export const setDeadlineCutoff = (date: Date): Date => {
  const adjusted = cloneDate(date);
  adjusted.setHours(DEADLINE_CUTOFF_HOUR, DEADLINE_CUTOFF_MINUTE, 0, 0);
  return adjusted;
};

export const addGracePeriod = (deadline: Date, minutes: number = DEADLINE_GRACE_MINUTES): Date => {
  const graceDate = cloneDate(deadline);
  graceDate.setMinutes(graceDate.getMinutes() + minutes);
  return graceDate;
};

export const calculateBusinessDeadlineFromToday = (businessDays: number): Date => {
  const dueDate = addBusinessDays(new Date(), businessDays);
  return setDeadlineCutoff(dueDate);
};

export const DEADLINE_RULES = {
  cutoffHour: DEADLINE_CUTOFF_HOUR,
  toleranceMinutes: DEADLINE_GRACE_MINUTES,
};


