export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
