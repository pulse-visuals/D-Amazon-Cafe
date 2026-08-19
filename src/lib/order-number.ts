import { sqlite } from "./db/index";

/**
 * Generates the next sequential order number for the current year, e.g. DAM-2026-0001.
 * Uses a small dedicated counter table + a synchronous better-sqlite3 transaction so
 * concurrent checkouts never collide on the same number.
 */
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS order_number_counters (
    year INTEGER PRIMARY KEY,
    seq INTEGER NOT NULL DEFAULT 0
  );
`);

export function nextOrderNumber(): string {
  const year = new Date().getFullYear();
  const tx = sqlite.transaction((y: number) => {
    sqlite.prepare(`INSERT INTO order_number_counters (year, seq) VALUES (?, 0) ON CONFLICT(year) DO NOTHING`).run(y);
    sqlite.prepare(`UPDATE order_number_counters SET seq = seq + 1 WHERE year = ?`).run(y);
    const row = sqlite.prepare(`SELECT seq FROM order_number_counters WHERE year = ?`).get(y) as { seq: number };
    return row.seq;
  });
  const seq = tx(year);
  return `DAM-${year}-${String(seq).padStart(4, "0")}`;
}
