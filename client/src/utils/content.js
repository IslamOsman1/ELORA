export function localizedField(item, language, key) {
  if (!item) return '';
  if (language === 'ar' && item[`${key}Ar`]) return item[`${key}Ar`];
  return item[key] || item[`${key}Ar`] || '';
}

export function doctorImage(doctor) {
  return doctor?.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80';
}

export function serviceImage(service) {
  return service?.image || 'https://images.unsplash.com/photo-1588776814546-ec7e4c2f2f5b?auto=format&fit=crop&w=1200&q=80';
}
