"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "./ProductImage";
import type { CategoryDTO } from "@/lib/types";

export function CategoryCard({ category, index = 0 }: { category: CategoryDTO; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={`/menu/${category.slug}`}
        className="group flex flex-col overflow-hidden rounded-3xl bg-white card-shadow border border-jungle-50 h-full"
      >
        <ProductImage category={category.slug} emoji={category.icon} alt={category.name} className="h-36" />
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-extrabold text-jungle-950">{category.name}</h3>
          <p className="mt-1.5 text-sm text-jungle-500 flex-1 line-clamp-2">{category.description}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-jungle-600 group-hover:text-gold-600 transition-colors">
            View Menu <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
