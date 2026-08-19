import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { MenuBrowser } from "@/components/MenuBrowser";
import { ComboBadge } from "@/components/Badges";
import { getAllProducts, getCategories } from "@/lib/menu";
import { SEED_SUBGROUP_LABELS } from "@/lib/db/subgroup-map";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `${cat.description} Order ${cat.name} online from D'Amazon Cafe, Sungai Long, Cheras.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const isCombo = category === "combo-deals";

  return (
    <>
      <PageHeader eyebrow="Order Online" title={`${cat.icon} ${cat.name}`} subtitle={cat.description} compact />

      {isCombo && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div className="rounded-3xl bg-gradient-to-br from-tomato-500 to-gold-400 p-1 shadow-2xl">
            <div className="rounded-[1.35rem] bg-white p-6 sm:p-8 text-center">
              <ComboBadge className="mb-3" />
              <h2 className="font-display text-2xl font-extrabold text-jungle-950">French Fries + Lemonade Drink</h2>
              <p className="mt-1 text-jungle-500 font-medium">Crispy • Refreshing • Perfect Combo</p>
              <p className="mt-3 text-3xl font-extrabold text-tomato-600">RM12.90</p>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 text-sm text-jungle-400">
          <Link href="/menu" className="hover:text-jungle-600 font-semibold">
            Full Menu
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-jungle-600 font-semibold">{cat.name}</span>
        </div>
        <MenuBrowser products={products} categories={categories} lockCategorySlug={category} subgroupLabels={SEED_SUBGROUP_LABELS} />
      </section>
    </>
  );
}
