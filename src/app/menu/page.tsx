import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MenuBrowser } from "@/components/MenuBrowser";
import { getAllProducts, getCategories } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Full Menu",
  description: "Browse the full D'Amazon Cafe menu — Nasi Lemak, coffee, refreshing drinks, desserts, appetizers and combo deals. Order online for pickup or delivery.",
};

export default async function MenuPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  return (
    <>
      <PageHeader eyebrow="Order Online" title="Our Full Menu" subtitle="Freshly made Malaysian and Western favourites, coffee and desserts — ready for pickup or delivery." compact />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <MenuBrowser products={products} categories={categories} />
      </section>
    </>
  );
}
