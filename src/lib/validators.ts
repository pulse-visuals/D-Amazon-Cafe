import { z } from "zod";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  variantName: z.string().optional(),
  addOnIds: z.array(z.string()).optional(),
  quantity: z.number().int().min(1).max(50),
  specialInstructions: z.string().max(300).optional(),
});

export const createOrderSchema = z
  .object({
    items: z.array(cartLineSchema).min(1),
    orderType: z.enum(["pickup", "delivery"]),
    scheduleType: z.enum(["asap", "scheduled"]).default("asap"),
    scheduledFor: z.string().optional(),

    customerName: z.string().min(2).max(100),
    customerPhone: z.string().min(7).max(20),
    customerEmail: z.string().email().optional().or(z.literal("")),
    orderNotes: z.string().max(500).optional(),

    deliveryZoneId: z.string().optional(),
    deliveryAddress1: z.string().max(200).optional(),
    deliveryAddress2: z.string().max(200).optional(),
    deliveryPostcode: z.string().max(10).optional(),
    deliveryCity: z.string().max(100).optional(),
    deliveryState: z.string().max(100).optional(),
    deliveryInstructions: z.string().max(300).optional(),

    discountCode: z.string().max(30).optional(),
  })
  .refine((data) => data.orderType === "pickup" || !!data.deliveryZoneId, {
    message: "Please select a delivery zone.",
    path: ["deliveryZoneId"],
  })
  .refine((data) => data.orderType === "pickup" || !!data.deliveryAddress1, {
    message: "Delivery address is required.",
    path: ["deliveryAddress1"],
  });

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const discountCodeSchema = z.object({
  code: z.string().min(2).max(30),
  type: z.enum(["percentage", "fixed", "free_delivery"]),
  value: z.number().min(0),
  minSpend: z.number().min(0).default(0),
  usageLimit: z.number().int().min(1).nullable().optional(),
  active: z.boolean().default(true),
  expiresAt: z.string().nullable().optional(),
  description: z.string().max(200).optional(),
});

export const deliveryZoneSchema = z.object({
  name: z.string().min(1).max(60),
  areaDescription: z.string().max(200).optional(),
  fee: z.number().min(0),
  minOrder: z.number().min(0).default(0),
  freeDeliveryThreshold: z.number().min(0).nullable().optional(),
  active: z.boolean().default(true),
});

export const productSchema = z.object({
  slug: z.string().min(1).max(80),
  categoryId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  image: z.string().max(300).optional(),
  basePrice: z.number().min(0),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  variants: z.array(z.object({ name: z.string().min(1), price: z.number().min(0) })).optional(),
  addOnIds: z.array(z.string()).optional(),
});
