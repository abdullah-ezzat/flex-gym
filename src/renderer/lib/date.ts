export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function calculateExpiry(startDate: string, durationDays: number) {
  const start = new Date(startDate);
  start.setDate(start.getDate() + durationDays);
  return start.toISOString();
}

export function isExpired(expiryDate: string) {
  return new Date(expiryDate) < new Date();
}

export function daysRemaining(expiryDate: string) {
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
