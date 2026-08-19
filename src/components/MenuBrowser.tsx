"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ScrollReveal } from "./ScrollReveal";
import type { CategoryDTO, ProductDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "popular" | string; // string = category slug

export function MenuBrowser({
  products,
  categories,
  lockCategorySlug,
  subgroupLabels,
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
  lockCategorySlug?: string;
  subgroupLabels?: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(lockCategorySlug || "all");

  const filtered = useMemo(() => {
    let list = products;
    if (lockCategorySlug) {
      list = list.filter((p) => p.categorySlug === lockCategorySlug);
    } else if (filter === "popular") {
      list = list.filter((p) => p.isBestSeller || p.isFeatured);
    } else if (filter !== "all") {
      list = list.filter((p) => p.categorySlug === filter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, query, lockCategorySlug]);

  const grouped = useMemo(() => {
    const groups = new Map<string, ProductDTO[]>();
    const groupKeyFor = (p: ProductDTO) => (lockCategorySlug ? p.subgroup || "" : p.categorySlug);
    for (const p of filtered) {
      const key = groupKeyFor(p);
      const arr = groups.get(key) || [];
      arr.push(p);
      groups.set(key, arr);
    }
    return groups;
  }, [filtered, lockCategorySlug]);

  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.name || slug;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-jungle-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu — try “chicken”, “coffee”, “nasi”..."
            className="w-full rounded-full border-2 border-jungle-100 bg-white py-3 pl-11 pr-4 text-sm focus:border-jungle-400 focus:outline-none"
            aria-label="Search menu"
          />
        </div>

        {!lockCategorySlug && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterChip>
            <FilterChip active={filter === "popular"} onClick={() => setFilter("popular")}>
              🔥 Popular
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.slug} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
                {c.icon} {c.name}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-jungle-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">No items match your search.</p>
          <p className="text-sm mt-1">Try a different keyword or filter.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {[...grouped.entries()].map(([key, items]) => (
            <div key={key || "misc"}>
              {key && (
                <ScrollReveal>
                  <h2 className="font-display text-2xl font-extrabold text-jungle-950 mb-5">
                    {lockCategorySlug ? subgroupLabels?.[key] || key : categoryLabel(key)}
                  </h2>
                </ScrollReveal>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors",
        active ? "border-jungle-600 bg-jungle-600 text-white" : "border-jungle-100 bg-white text-jungle-600 hover:border-jungle-300"
      )}
    >
      {children}
    </button>
  );
}
