export function formatPriceInEgp(value, language = 'ar') {
  const locale = language === 'ar' ? 'ar-EG' : 'en-EG';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}
