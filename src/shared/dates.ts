export function daysSince(timestamp: string | number | Date | null | undefined, now = Date.now()): number {
  if (!timestamp) return 0;
  return Math.floor((now - new Date(timestamp).getTime()) / 86400000);
}

export function startOfLocalDay(date: string | number | Date = new Date()): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function dayDiffFromToday(date: string | number | Date | null | undefined, today = new Date()): number | null {
  if (!date) return null;
  return Math.round((startOfLocalDay(today).getTime() - startOfLocalDay(date).getTime()) / 86400000);
}
