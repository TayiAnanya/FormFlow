/** Random / unique value generators for parallel-safe test data (Sprint 01+). */
export function uniqueEmail(prefix = 'ff'): string {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 1_000_000);
  return `${prefix}.${stamp}.${rand}@example.test`;
}

/** Indian mobile matching app pattern ^[6-9]\d{9}$ */
export function uniqueMobile(): string {
  const first = String(6 + Math.floor(Math.random() * 4));
  const rest = String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');
  return `${first}${rest}`;
}
