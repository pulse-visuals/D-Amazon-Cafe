import { db } from "./db";
import { products, productVariants, productAddOns } from "./db/schema";
import { eq } from "drizzle-orm";
import { newId } from "./id";
import type { z } from "zod";
import type { productSchema } from "./validators";

type ProductInput = z.infer<typeof productSchema>;

export async function createProduct(input: ProductInput) {
  const id = newId("prod");
  await db.insert(products).values({
    id,
    slug: input.slug,
    categoryId: input.categoryId,
    name: input.name,
    description: input.description || "",
    image: input.image || "",
    basePrice: Math.round(input.basePrice),
    isAvailable: input.isAvailable,
    isSoldOut: input.isSoldOut,
    isFeatured: input.isFeatured,
    isBestSeller: input.isBestSeller,
    isNew: input.isNew,
  });

  if (input.variants?.length) {
    for (let i = 0; i < input.variants.length; i++) {
      const v = input.variants[i];
      await db.insert(productVariants).values({ id: newId("var"), productId: id, name: v.name, price: Math.round(v.price), sortOrder: i });
    }
  }
  if (input.addOnIds?.length) {
    for (const addOnId of input.addOnIds) {
      await db.insert(productAddOns).values({ id: newId("pao"), productId: id, addOnId });
    }
  }
  return id;
}

export async function updateProduct(id: string, input: ProductInput) {
  await db
    .update(products)
    .set({
      slug: input.slug,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description || "",
      image: input.image || "",
      basePrice: Math.round(input.basePrice),
      isAvailable: input.isAvailable,
      isSoldOut: input.isSoldOut,
      isFeatured: input.isFeatured,
      isBestSeller: input.isBestSeller,
      isNew: input.isNew,
    })
    .where(eq(products.id, id));

  await db.delete(productVariants).where(eq(productVariants.productId, id));
  if (input.variants?.length) {
    for (let i = 0; i < input.variants.length; i++) {
      const v = input.variants[i];
      await db.insert(productVariants).values({ id: newId("var"), productId: id, name: v.name, price: Math.round(v.price), sortOrder: i });
    }
  }

  await db.delete(productAddOns).where(eq(productAddOns.productId, id));
  if (input.addOnIds?.length) {
    for (const addOnId of input.addOnIds) {
      await db.insert(productAddOns).values({ id: newId("pao"), productId: id, addOnId });
    }
  }
}

export async function deleteProduct(id: string) {
  await db.delete(productVariants).where(eq(productVariants.productId, id));
  await db.delete(productAddOns).where(eq(productAddOns.productId, id));
  await db.delete(products).where(eq(products.id, id));
}

export async function setProductAvailability(id: string, patch: Partial<{ isAvailable: boolean; isSoldOut: boolean }>) {
  await db.update(products).set(patch).where(eq(products.id, id));
}
