// src/utils/date.ts
export function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}
