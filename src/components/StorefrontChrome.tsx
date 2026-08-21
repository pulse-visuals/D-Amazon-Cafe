"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { ProductModal } from "./ProductModal";
import { StickyMobileBar } from "./StickyMobileBar";

// The admin dashboard has its own shell (AdminShell) and must not show the
// public storefront navigation, footer, cart drawer or product modal. The
// root "/" is the cinematic landing page (The Jungle Table) — it has its
// own nav, footer and cursor, and must not be wrapped in the shop chrome
// either. The actual shop (categories, featured products, cart) lives at
// "/order" and keeps the full StorefrontChrome.
export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isCinematicHome = pathname === "/";

  if (isAdmin || isCinematicHome) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ProductModal />
      <StickyMobileBar />
    </>
  );
}
