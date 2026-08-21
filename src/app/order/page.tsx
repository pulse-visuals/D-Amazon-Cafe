import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Truck, Leaf, Clock, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCategories, getAllProducts } from "@/lib/menu";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Online",
  description:
    "Browse categories and order Nasi Lemak, coffee, drinks, pastries, desserts and Western favourites online from D'Amazon Cafe, Sungai Long.",
};

export default async function OrderPage() {
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);
  const featured = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 8);
  const heroProduct = products.find((p) => p.slug === "nasi-lemak-ayam-rendang") || products[0];

  return (
    <>
      <Hero featuredPrice={heroProduct?.basePrice || 1490} />

      {/* Quick order categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* Featured / best sellers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
        <ScrollReveal className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-gold-600">Customer Favourites</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-jungle-950 mt-1">Popular Right Now</h2>
          </div>
          <Link href="/menu" className="hidden sm:inline-flex items-center gap-1.5 font-bold text-jungle-600 hover:text-gold-600">
            View Full Menu <ArrowRight size={16} />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Why D'Amazon */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Leaf, title: "Freshly Made", desc: "Cooked fresh to order, every single day." },
            { icon: Truck, title: "Pickup & Delivery", desc: "Grab it yourself or have it delivered to you." },
            { icon: Clock, title: "Fast Ordering", desc: "Order online in under 2 minutes." },
            { icon: ShieldCheck, title: "Secure Payment", desc: "Your payment is processed securely." },
          ].map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.06}>
              <div className="rounded-2xl bg-jungle-50 border border-jungle-100 p-6 h-full">
                <f.icon className="text-jungle-600" size={28} />
                <h3 className="mt-3 font-display font-bold text-jungle-950">{f.title}</h3>
                <p className="mt-1 text-sm text-jungle-500">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-jungle-950 text-white px-6 py-14 sm:px-16 sm:py-20 text-center">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%)]" />
            <p className="relative text-sm font-bold uppercase tracking-widest text-gold-300">A Tropical Escape</p>
            <h2 className="relative font-display text-3xl sm:text-4xl font-extrabold mt-3 max-w-2xl mx-auto">
              For Great Food &amp; Great Coffee
            </h2>
            <p className="relative mt-4 text-jungle-200 max-w-xl mx-auto">
              D&apos;Amazon Cafe combines Malaysian favourites, comforting Western dishes, freshly prepared beverages
              and indulgent desserts in a relaxing tropical environment.
            </p>
            <Link
              href="/about"
              className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-bold text-jungle-950 hover:bg-gold-300 transition-colors"
            >
              Our Story <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
