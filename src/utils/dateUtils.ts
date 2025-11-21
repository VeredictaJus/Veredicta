export const getCurrentYear = () => new Date().getFullYear();

export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getFormattedDate = (monthDay: string) => {
  const currentYear = getCurrentYear();
  return `${currentYear}-${monthDay}`;
};

export const getYearRange = (count: number = 3) => {
  const currentYear = getCurrentYear();
  return Array.from({ length: count }, (_, i) => currentYear - i);
};