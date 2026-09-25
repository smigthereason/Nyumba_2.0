export function formatKes(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted =
      millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace(/\.0$/, '');
    return `KES ${formatted}M`;
  }
  if (amount >= 1_000) {
    return `KES ${Math.round(amount / 1_000)}K`;
  }
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function formatKesFull(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function formatPropertyType(type: string): string {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}
