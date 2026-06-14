export function truncateMetaDescription(text: string, maxLength = 155): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const boundary = normalized.lastIndexOf(' ', maxLength - 1);
  const truncated = normalized.slice(0, boundary > 90 ? boundary : maxLength - 1).trim();
  return `${truncated.replace(/[,:;.\-–—]+$/u, '')}…`;
}

export function truncateTitle(text: string, maxLength = 60): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const boundary = normalized.lastIndexOf(' ', maxLength);
  const truncated = normalized.slice(0, boundary > 0 ? boundary : maxLength).trim();
  return truncated.replace(/[,:;.\-–—]+$/u, '');
}

