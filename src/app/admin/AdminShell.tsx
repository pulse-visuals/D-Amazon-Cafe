"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Percent, Truck, Settings, LogOut, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/promotions", label: "Promotions", icon: Percent },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-jungle-50 flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-jungle-950 text-white">
        <div className="p-5 border-b border-white/10">
          <Logo size={36} textClassName="text-white" />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-gold-400 text-jungle-950" : "text-jungle-200 hover:bg-white/10"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-jungle-200 hover:bg-white/10">
            <ExternalLink size={18} /> View Storefront
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-jungle-200 hover:bg-white/10">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between bg-jungle-950 text-white px-4 py-3">
          <Logo size={32} textClassName="text-white" />
          <button onClick={logout} className="text-xs font-bold underline">
            Logout
          </button>
        </header>
        <nav className="lg:hidden flex overflow-x-auto gap-1 bg-white border-b border-jungle-100 px-2 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                pathname === item.href ? "bg-jungle-600 text-white" : "text-jungle-500 bg-jungle-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-jungle-100">
          <p className="text-sm text-jungle-400">
            Signed in as <span className="font-bold text-jungle-700">{adminName}</span>
          </p>
        </div>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
