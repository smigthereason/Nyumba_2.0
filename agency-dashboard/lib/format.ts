export function formatKes(n: number): string {
  return `KES ${Math.round(n).toLocaleString('en-KE')}`;
}

export function formatKesShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `KES ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `KES ${Math.round(n / 1_000)}k`;
  return formatKes(n);
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  });
}

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'agency';
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function kenyaPhoneDigits(phone?: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) digits = `254${digits.slice(1)}`;
  else if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) digits = `254${digits}`;
  return digits.length >= 9 ? digits : null;
}

export function waLink(phone?: string): string | null {
  const digits = kenyaPhoneDigits(phone);
  return digits ? `https://wa.me/${digits}` : null;
}

export function telLink(phone?: string): string | null {
  if (!phone) return null;
  return `tel:${phone.replace(/\s+/g, '')}`;
}

export function smsLink(phone?: string): string | null {
  if (!phone) return null;
  return `sms:${phone.replace(/\s+/g, '')}`;
}

export function labelType(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}
