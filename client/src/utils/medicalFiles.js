export function isPdfFile(file) {
  return String(file?.mimeType || '').includes('pdf') || /\.pdf$/i.test(String(file?.originalName || file?.url || ''));
}

export function resolveMedicalFileUrl(file) {
  const url = String(file?.url || '');
  if (!url) return '';

  if (isPdfFile(file)) {
    return url.replace('/image/upload/', '/raw/upload/');
  }

  return url;
}
