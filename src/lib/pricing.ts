import { db } from "./db";
import { products, productVariants, addOns, productAddOns, deliveryZones, discountCodes } from "./db/schema";
import { eq, and, inArray } from "drizzle-orm";

export type CartLineInput = {
  productId: string;
  variantName?: string;
  addOnIds?: string[];
  quantity: number;
  specialInstructions?: string;
};

export type PricedLine = {
  productId: string;
  productName: string;
  productImage: string;
  variantName: string;
  unitPrice: number; // sen
  addOns: { id: string; name: string; price: number }[];
  quantity: number;
  specialInstructions: string;
  lineTotal: number; // sen
};

export type PricingResult = {
  ok: boolean;
  errors: string[];
  lines: PricedLine[];
  subtotal: number;
};

/**
 * Server-side authoritative pricing. The client only ever sends product/variant/add-on
 * IDENTIFIERS and quantities — never prices. Every price in the resulting order is
 * looked up fresh from the database here, so a tampered frontend request cannot
 * change what a customer is charged.
 */
export async function priceCartItems(items: CartLineInput[]): Promise<PricingResult> {
  const errors: string[] = [];
  const lines: PricedLine[] = [];

  if (!items || items.length === 0) {
    return { ok: false, errors: ["Cart is empty."], lines: [], subtotal: 0 };
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const dbProducts = await db.query.products.findMany({ where: inArray(products.id, productIds) });
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  const variantRows = await db.query.productVariants.findMany({ where: inArray(productVariants.productId, productIds) });
  const variantsByProduct = new Map<string, typeof variantRows>();
  for (const v of variantRows) {
    const arr = variantsByProduct.get(v.productId) || [];
    arr.push(v);
    variantsByProduct.set(v.productId, arr);
  }

  const allowedAddOnRows = await db.query.productAddOns.findMany({ where: inArray(productAddOns.productId, productIds) });
  const allowedAddOnIdsByProduct = new Map<string, Set<string>>();
  for (const row of allowedAddOnRows) {
    const set = allowedAddOnIdsByProduct.get(row.productId) || new Set<string>();
    set.add(row.addOnId);
    allowedAddOnIdsByProduct.set(row.productId, set);
  }

  const addOnIds = [...new Set(items.flatMap((i) => i.addOnIds || []))];
  const addOnRows = addOnIds.length ? await db.query.addOns.findMany({ where: inArray(addOns.id, addOnIds) }) : [];
  const addOnMap = new Map(addOnRows.map((a) => [a.id, a]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      errors.push(`A product in your cart is no longer available.`);
      continue;
    }
    if (!product.isAvailable || product.isSoldOut) {
      errors.push(`${product.name} is currently sold out.`);
      continue;
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
      errors.push(`Invalid quantity for ${product.name}.`);
      continue;
    }

    let unitPrice = product.basePrice;
    let variantName = "";
    const productVariantsList = variantsByProduct.get(product.id) || [];
    if (productVariantsList.length > 0) {
      const match = productVariantsList.find((v) => v.name === item.variantName);
      if (!match) {
        errors.push(`Please choose a valid option for ${product.name}.`);
        continue;
      }
      unitPrice = match.price;
      variantName = match.name;
    }

    const chosenAddOns: { id: string; name: string; price: number }[] = [];
    const allowedSet = allowedAddOnIdsByProduct.get(product.id) || new Set();
    for (const addOnId of item.addOnIds || []) {
      const addOn = addOnMap.get(addOnId);
      if (!addOn || !addOn.active) {
        errors.push(`An add-on for ${product.name} is no longer available.`);
        continue;
      }
      if (!allowedSet.has(addOnId)) {
        errors.push(`${addOn.name} is not available for ${product.name}.`);
        continue;
      }
      chosenAddOns.push({ id: addOn.id, name: addOn.name, price: addOn.price });
    }

    const addOnsTotal = chosenAddOns.reduce((s, a) => s + a.price, 0);
    const lineTotal = (unitPrice + addOnsTotal) * item.quantity;

    lines.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      variantName,
      unitPrice,
      addOns: chosenAddOns,
      quantity: item.quantity,
      specialInstructions: (item.specialInstructions || "").slice(0, 300),
      lineTotal,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return { ok: errors.length === 0 && lines.length > 0, errors, lines, subtotal };
}

export type DeliveryFeeResult = {
  ok: boolean;
  error?: string;
  zoneId?: string;
  zoneName?: string;
  fee: number;
  freeApplied?: boolean;
};

export async function computeDeliveryFee(zoneId: string | undefined, subtotal: number): Promise<DeliveryFeeResult> {
  if (!zoneId) return { ok: false, error: "Please select a delivery zone.", fee: 0 };
  const zone = await db.query.deliveryZones.findFirst({ where: and(eq(deliveryZones.id, zoneId), eq(deliveryZones.active, true)) });
  if (!zone) return { ok: false, error: "Selected delivery zone is not available.", fee: 0 };
  if (subtotal < zone.minOrder) {
    return { ok: false, error: `Minimum order for ${zone.name} is RM${(zone.minOrder / 100).toFixed(2)}.`, fee: 0 };
  }
  const freeApplied = zone.freeDeliveryThreshold != null && subtotal >= zone.freeDeliveryThreshold;
  return { ok: true, zoneId: zone.id, zoneName: zone.name, fee: freeApplied ? 0 : zone.fee, freeApplied };
}

export type DiscountResult = {
  ok: boolean;
  error?: string;
  discountId?: string;
  discountAmount: number; // sen
  freeDelivery: boolean;
};

export async function applyDiscountCode(code: string | undefined, subtotal: number): Promise<DiscountResult> {
  if (!code) return { ok: true, discountAmount: 0, freeDelivery: false };
  const normalized = code.trim().toUpperCase();
  const discount = await db.query.discountCodes.findFirst({ where: eq(discountCodes.code, normalized) });
  if (!discount || !discount.active) return { ok: false, error: "Invalid discount code.", discountAmount: 0, freeDelivery: false };
  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return { ok: false, error: "This discount code has expired.", discountAmount: 0, freeDelivery: false };
  }
  if (discount.usageLimit != null && discount.usedCount >= discount.usageLimit) {
    return { ok: false, error: "This discount code has reached its usage limit.", discountAmount: 0, freeDelivery: false };
  }
  if (subtotal < discount.minSpend) {
    return { ok: false, error: `Spend at least RM${(discount.minSpend / 100).toFixed(2)} to use this code.`, discountAmount: 0, freeDelivery: false };
  }

  if (discount.type === "percentage") {
    return { ok: true, discountId: discount.id, discountAmount: Math.round((subtotal * discount.value) / 100), freeDelivery: false };
  }
  if (discount.type === "fixed") {
    return { ok: true, discountId: discount.id, discountAmount: Math.min(discount.value, subtotal), freeDelivery: false };
  }
  if (discount.type === "free_delivery") {
    return { ok: true, discountId: discount.id, discountAmount: 0, freeDelivery: true };
  }
  return { ok: false, error: "Unsupported discount type.", discountAmount: 0, freeDelivery: false };
}
