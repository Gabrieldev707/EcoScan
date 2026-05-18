export function formatKg(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} kg`;
}

export function formatCO2(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} kg CO₂`;
}

export function formatLiters(value: number): string {
  return `${Math.round(value)} L`;
}

export function formatPoints(value: number): string {
  return value.toLocaleString('pt-BR') + ' pts';
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}
