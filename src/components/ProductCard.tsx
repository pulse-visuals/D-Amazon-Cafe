"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { BestSellerBadge, NewBadge, SoldOutBadge } from "./Badges";
import { formatRM } from "@/lib/money";
import { useProductModalStore } from "@/lib/product-modal-store";
import { useCartStore } from "@/lib/cart-store";
import type { ProductDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductDTO }) {
  const open = useProductModalStore((s) => s.open);
  const addItem = useCartStore((s) => s.addItem);
  const soldOut = product.isSoldOut || !product.isAvailable;
  const hasOptions = product.variants.length > 0 || product.addOns.length > 0;
  const priceLabel = product.variants.length > 0 ? `from ${formatRM(Math.min(...product.variants.map((v) => v.price)))}` : formatRM(product.basePrice);

  function quickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (soldOut) return;
    if (hasOptions) {
      open(product.id);
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      categorySlug: product.categorySlug,
      variantName: "",
      unitPrice: product.basePrice,
      addOns: [],
      quantity: 1,
      specialInstructions: "",
    });
  }

  return (
    <motion.button
      onClick={() => open(product.id)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group flex flex-col text-left rounded-2xl bg-white overflow-hidden card-shadow border border-jungle-50 h-full"
    >
      <ProductImage
        category={product.categorySlug}
        image={product.image}
        alt={product.name}
        className="h-40 w-full"
        badge={
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 items-start">
            {product.isBestSeller && <BestSellerBadge />}
            {product.isNew && <NewBadge />}
            {soldOut && <SoldOutBadge />}
          </div>
        }
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-bold text-jungle-950 text-[15px] leading-snug line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-xs text-jungle-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-jungle-700">{priceLabel}</span>
          <span
            onClick={quickAdd}
            role="button"
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex items-center justify-center rounded-full p-2 transition-colors shadow-sm",
              soldOut ? "bg-jungle-100 text-jungle-300 cursor-not-allowed" : "bg-jungle-600 text-white hover:bg-jungle-700 active:scale-90"
            )}
          >
            <Plus size={16} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
