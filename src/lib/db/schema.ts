import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// All money values are stored as INTEGER sen (RM cents) to avoid floating point drift.
// e.g. RM14.90 => 1490

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("🍽️"),
  image: text("image").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  basePrice: integer("base_price").notNull(), // sen, used when no variants
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  isSoldOut: integer("is_sold_out", { mode: "boolean" }).notNull().default(false),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isBestSeller: integer("is_best_seller", { mode: "boolean" }).notNull().default(false),
  isNew: integer("is_new", { mode: "boolean" }).notNull().default(false),
  allowSpecialInstructions: integer("allow_special_instructions", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// e.g. Hot/Iced, Normal/Sparkling — absolute price per variant
export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(), // "Hot", "Iced", "Normal", "Sparkling"
  price: integer("price").notNull(), // sen
  sortOrder: integer("sort_order").notNull().default(0),
});

export const addOns = sqliteTable("add_ons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // sen
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const productAddOns = sqliteTable("product_add_ons", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  addOnId: text("add_on_id").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
});

export const deliveryZones = sqliteTable("delivery_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  areaDescription: text("area_description").notNull().default(""),
  fee: integer("fee").notNull(), // sen
  minOrder: integer("min_order").notNull().default(0), // sen
  freeDeliveryThreshold: integer("free_delivery_threshold"), // sen, nullable
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const discountCodes = sqliteTable("discount_codes", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'percentage' | 'fixed' | 'free_delivery'
  value: integer("value").notNull().default(0), // percentage (0-100) or sen for fixed
  minSpend: integer("min_spend").notNull().default(0), // sen
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  expiresAt: text("expires_at"),
  description: text("description").notNull().default(""),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("received"),
  // received -> paid -> preparing -> ready | out_for_delivery -> completed | cancelled
  orderType: text("order_type").notNull(), // 'pickup' | 'delivery'
  scheduleType: text("schedule_type").notNull().default("asap"), // 'asap' | 'scheduled'
  scheduledFor: text("scheduled_for"),

  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  orderNotes: text("order_notes").notNull().default(""),
  userId: text("user_id"),

  deliveryAddress1: text("delivery_address1").notNull().default(""),
  deliveryAddress2: text("delivery_address2").notNull().default(""),
  deliveryPostcode: text("delivery_postcode").notNull().default(""),
  deliveryCity: text("delivery_city").notNull().default(""),
  deliveryState: text("delivery_state").notNull().default(""),
  deliveryInstructions: text("delivery_instructions").notNull().default(""),
  deliveryZoneId: text("delivery_zone_id"),

  subtotal: integer("subtotal").notNull(), // sen
  discountCode: text("discount_code").notNull().default(""),
  discountAmount: integer("discount_amount").notNull().default(0), // sen
  deliveryFee: integer("delivery_fee").notNull().default(0), // sen
  taxAmount: integer("tax_amount").notNull().default(0), // sen
  total: integer("total").notNull(), // sen

  paymentMethod: text("payment_method").notNull().default(""),
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | paid | failed
  paymentMode: text("payment_mode").notNull().default("demo"), // demo | live

  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull().default(""),
  variantName: text("variant_name").notNull().default(""),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // sen, includes variant, excludes addons
  addOnsJson: text("add_ons_json").notNull().default("[]"), // [{name, price}]
  specialInstructions: text("special_instructions").notNull().default(""),
  lineTotal: integer("line_total").notNull(), // sen
});

export const orderStatusHistory = sqliteTable("order_status_history", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  status: text("status").notNull(),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  gateway: text("gateway").notNull().default("billplz"),
  gatewayBillId: text("gateway_bill_id").notNull().default(""),
  amount: integer("amount").notNull(), // sen
  status: text("status").notNull().default("pending"), // pending | paid | failed
  mode: text("mode").notNull().default("demo"), // demo | live
  rawPayload: text("raw_payload").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: text("product_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const businessSettings = sqliteTable("business_settings", {
  id: text("id").primaryKey().default("main"),
  cafeName: text("cafe_name").notNull().default("D'Amazon Cafe"),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  operatingHoursJson: text("operating_hours_json").notNull().default("{}"),
  holidaysJson: text("holidays_json").notNull().default("[]"),
  pickupEnabled: integer("pickup_enabled", { mode: "boolean" }).notNull().default(true),
  deliveryEnabled: integer("delivery_enabled", { mode: "boolean" }).notNull().default(true),
  taxPercent: real("tax_percent").notNull().default(0),
  serviceChargePercent: real("service_charge_percent").notNull().default(0),
  paymentMode: text("payment_mode").notNull().default("demo"), // demo | live
  mapEmbedUrl: text("map_embed_url").notNull().default(""),
  mapDirectionsUrl: text("map_directions_url").notNull().default(""),
});
