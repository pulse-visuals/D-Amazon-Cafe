"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { ProductModal } from "./ProductModal";
import { StickyMobileBar } from "./StickyMobileBar";

// The admin dashboard has its own shell (AdminShell) and must not show the
// public storefront navigation, footer, cart drawer or product modal.
export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

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
