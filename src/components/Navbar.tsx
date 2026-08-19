"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Logo } from "./Logo";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/menu/nasi-lemak", label: "Nasi Lemak" },
  { href: "/menu/coffee-drinks", label: "Coffee & Drinks" },
  { href: "/menu/appetizers", label: "Appetizers" },
  { href: "/menu/desserts", label: "Desserts" },
  { href: "/menu/combo-deals", label: "Combo Deals" },
  { href: "/about", label: "About Us" },
  { href: "/location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the route changes. Adjusting state during
  // render (rather than in an effect) avoids an extra post-navigation render.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 print:hidden",
        scrolled ? "bg-jungle-950/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-jungle-950/70 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-[68px] items-center justify-between">
          <Logo size={40} textClassName="text-white" />

          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-jungle-100">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-full transition-colors hover:bg-white/10 hover:text-gold-300",
                  pathname === link.href && "bg-white/10 text-gold-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className="hidden md:inline-flex items-center rounded-full bg-gold-400 px-4 py-2 text-sm font-bold text-jungle-950 shadow-md transition-transform hover:scale-105 hover:bg-gold-300 active:scale-95"
            >
              ORDER ONLINE
            </Link>

            <button
              onClick={toggleCart}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              className="relative inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-3.5 py-2.5 transition-colors"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline text-sm font-semibold">Cart</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato-500 px-1 text-[11px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white p-2.5"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-jungle-950 border-t border-white/10"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-3 py-2.5 rounded-lg text-jungle-100 font-semibold hover:bg-white/10",
                      pathname === link.href && "bg-white/10 text-gold-300"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/menu"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-gold-400 px-4 py-3 text-sm font-bold text-jungle-950 shadow-md"
              >
                ORDER ONLINE
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
