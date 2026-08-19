// All monetary values move through the system as integer "sen" (RM cents) to avoid
// floating point rounding bugs. These helpers are the single place RM <-> sen conversion happens.

export function toSen(rm: number): number {
  return Math.round(rm * 100);
}

export function toRM(sen: number): number {
  return sen / 100;
}

export function formatRM(sen: number): string {
  return `RM${(sen / 100).toFixed(2)}`;
}
