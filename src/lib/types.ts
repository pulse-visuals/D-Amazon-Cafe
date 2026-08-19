export type ProductVariantDTO = { id: string; name: string; price: number };
export type AddOnDTO = { id: string; name: string; price: number };

export type ProductDTO = {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  subgroup?: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  isAvailable: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  allowSpecialInstructions: boolean;
  variants: ProductVariantDTO[];
  addOns: AddOnDTO[];
};

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
};
