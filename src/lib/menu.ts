import { db } from "./db";
import { categories, products, productVariants } from "./db/schema";
import { eq, asc } from "drizzle-orm";
import type { ProductDTO, CategoryDTO } from "./types";
import { SEED_SUBGROUP_BY_SLUG } from "./db/subgroup-map";

export async function getCategories(): Promise<CategoryDTO[]> {
  const rows = await db.query.categories.findMany({ where: eq(categories.active, true), orderBy: asc(categories.sortOrder) });
  return rows.map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, icon: c.icon, image: c.image }));
}

export async function getAllProducts(): Promise<ProductDTO[]> {
  const [prodRows, catRows, variantRows, productAddOnRows, allAddOns] = await Promise.all([
    db.query.products.findMany({ orderBy: asc(products.sortOrder) }),
    db.query.categories.findMany(),
    db.query.productVariants.findMany({ orderBy: asc(productVariants.sortOrder) }),
    db.query.productAddOns.findMany(),
    db.query.addOns.findMany(),
  ]);

  const catById = new Map(catRows.map((c) => [c.id, c]));
  const variantsByProduct = new Map<string, typeof variantRows>();
  for (const v of variantRows) {
    const arr = variantsByProduct.get(v.productId) || [];
    arr.push(v);
    variantsByProduct.set(v.productId, arr);
  }
  const addOnById = new Map(allAddOns.map((a) => [a.id, a]));
  const addOnsByProduct = new Map<string, typeof allAddOns>();
  for (const link of productAddOnRows) {
    const addOn = addOnById.get(link.addOnId);
    if (!addOn) continue;
    const arr = addOnsByProduct.get(link.productId) || [];
    arr.push(addOn);
    addOnsByProduct.set(link.productId, arr);
  }

  return prodRows.map((p) => {
    const category = catById.get(p.categoryId);
    return {
      id: p.id,
      slug: p.slug,
      categoryId: p.categoryId,
      categorySlug: category?.slug || "",
      categoryName: category?.name || "",
      subgroup: SEED_SUBGROUP_BY_SLUG[p.slug],
      name: p.name,
      description: p.description,
      image: p.image,
      basePrice: p.basePrice,
      isAvailable: p.isAvailable,
      isSoldOut: p.isSoldOut,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNew: p.isNew,
      allowSpecialInstructions: p.allowSpecialInstructions,
      variants: (variantsByProduct.get(p.id) || []).map((v) => ({ id: v.id, name: v.name, price: v.price })),
      addOns: (addOnsByProduct.get(p.id) || []).map((a) => ({ id: a.id, name: a.name, price: a.price })),
    };
  });
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductDTO[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.categorySlug === categorySlug);
}
