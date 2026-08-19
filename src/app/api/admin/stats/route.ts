import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sqlite } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  // created_at is stored via SQLite's CURRENT_TIMESTAMP ("YYYY-MM-DD HH:MM:SS", UTC),
  // so "today" is compared using SQLite's own date() function rather than a JS-built
  // ISO string — the two don't share a text format and a naive string comparison
  // would silently never match. Note this defines "today" in the server's/DB's
  // timezone (UTC by default); set TZ=Asia/Kuala_Lumpur in the hosting environment
  // if you want "today" to follow Malaysia time instead.
  const todayOrders = sqlite
    .prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total),0) as sales FROM orders WHERE date(created_at) = date('now') AND payment_status = 'paid'`)
    .get() as { count: number; sales: number };

  const pending = sqlite
    .prepare(`SELECT COUNT(*) as count FROM orders WHERE status IN ('received','paid','preparing') AND status != 'cancelled'`)
    .get() as { count: number };

  const completed = sqlite.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`).get() as { count: number };
  const cancelled = sqlite.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'`).get() as { count: number };

  const popular = sqlite
    .prepare(
      `SELECT product_name as name, SUM(quantity) as qty FROM order_items GROUP BY product_name ORDER BY qty DESC LIMIT 5`
    )
    .all() as { name: string; qty: number }[];

  const salesLast7Days = sqlite
    .prepare(
      `SELECT substr(created_at, 1, 10) as day, COALESCE(SUM(total),0) as sales, COUNT(*) as orders
       FROM orders WHERE payment_status = 'paid' AND created_at >= datetime('now', '-7 days')
       GROUP BY day ORDER BY day ASC`
    )
    .all() as { day: string; sales: number; orders: number }[];

  const totalOrders = sqlite.prepare(`SELECT COUNT(*) as count FROM orders`).get() as { count: number };
  const totalSales = sqlite.prepare(`SELECT COALESCE(SUM(total),0) as sales FROM orders WHERE payment_status = 'paid'`).get() as { sales: number };

  return NextResponse.json({
    todayOrders: todayOrders.count,
    todaySales: todayOrders.sales,
    pendingOrders: pending.count,
    completedOrders: completed.count,
    cancelledOrders: cancelled.count,
    totalOrders: totalOrders.count,
    totalSales: totalSales.sales,
    popularProducts: popular,
    salesLast7Days,
  });
}
