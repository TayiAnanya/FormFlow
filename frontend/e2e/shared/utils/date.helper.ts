/** Date helpers for age boundary DOBs (Sprint 01+ forms). */
export function isoDateYearsAgo(years: number, from = new Date()): string {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}
