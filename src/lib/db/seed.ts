/**
 * Seed the local SQLite database with categories, products, add-ons,
 * delivery zones, discount codes, business settings and a default admin account.
 *
 * Run with: npm run db:seed
 */
import bcrypt from "bcryptjs";
import { db, sqlite } from "./index";
import {
  categories,
  products,
  productVariants,
  addOns,
  productAddOns,
  deliveryZones,
  discountCodes,
  businessSettings,
  admins,
} from "./schema";
import { CATEGORIES, STANDARD_ADDONS } from "./seed-data";
import { toSen } from "../money";
import { newId } from "../id";

function slugToId(prefix: string, slug: string) {
  return `${prefix}_${slug}`;
}

async function main() {
  console.log("Clearing existing data...");
  for (const table of [
    "order_status_history",
    "payments",
    "order_items",
    "orders",
    "favorites",
    "product_add_ons",
    "product_variants",
    "products",
    "categories",
    "add_ons",
    "delivery_zones",
    "discount_codes",
    "admins",
    "business_settings",
  ]) {
    sqlite.exec(`DELETE FROM ${table};`);
  }

  console.log("Seeding add-ons...");
  const addOnIdBySlug: Record<string, string> = {};
  for (const a of STANDARD_ADDONS) {
    const id = slugToId("addon", a.slug);
    addOnIdBySlug[a.slug] = id;
    await db.insert(addOns).values({ id, name: a.name, price: toSen(a.price), active: true });
  }

  console.log("Seeding categories & products...");
  let categorySort = 0;
  for (const cat of CATEGORIES) {
    const categoryId = slugToId("cat", cat.slug);
    await db.insert(categories).values({
      id: categoryId,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      sortOrder: categorySort++,
      active: true,
    });

    let productSort = 0;
    const flatProducts = cat.subgroups
      ? cat.subgroups.flatMap((g) => g.products.map((p) => ({ ...p, subgroup: g.key })))
      : (cat.products || []).map((p) => ({ ...p, subgroup: "" }));

    for (const p of flatProducts) {
      const productId = slugToId("prod", p.slug);
      const basePrice = p.price !== undefined ? toSen(p.price) : p.variants ? toSen(p.variants[0].price) : 0;
      await db.insert(products).values({
        id: productId,
        slug: p.slug,
        categoryId,
        name: p.name,
        description: p.description,
        image: p.image || "",
        basePrice,
        isAvailable: !p.soldOut,
        isSoldOut: !!p.soldOut,
        isFeatured: !!p.featured,
        isBestSeller: !!p.bestSeller,
        isNew: !!p.isNew,
        allowSpecialInstructions: true,
        sortOrder: productSort++,
      });

      if (p.variants) {
        let vSort = 0;
        for (const v of p.variants) {
          await db.insert(productVariants).values({
            id: newId("var"),
            productId,
            name: v.name,
            price: toSen(v.price),
            sortOrder: vSort++,
          });
        }
      }

      if (p.addOns) {
        for (const slug of Object.keys(addOnIdBySlug)) {
          await db.insert(productAddOns).values({
            id: newId("pao"),
            productId,
            addOnId: addOnIdBySlug[slug],
          });
        }
      }
    }
  }

  console.log("Seeding delivery zones...");
  await db.insert(deliveryZones).values([
    { id: newId("zone"), name: "Zone A", areaDescription: "Sungai Long & Bandar Sungai Long (within 3km)", fee: toSen(5), minOrder: toSen(15), freeDeliveryThreshold: toSen(80), active: true, sortOrder: 0 },
    { id: newId("zone"), name: "Zone B", areaDescription: "Kajang, Balakong & surrounding areas (3-7km)", fee: toSen(8), minOrder: toSen(20), freeDeliveryThreshold: toSen(100), active: true, sortOrder: 1 },
    { id: newId("zone"), name: "Zone C", areaDescription: "Cheras, Bandar Sungai Long outskirts (7-12km)", fee: toSen(10), minOrder: toSen(25), freeDeliveryThreshold: toSen(120), active: true, sortOrder: 2 },
  ]);

  console.log("Seeding discount codes...");
  await db.insert(discountCodes).values([
    { id: newId("disc"), code: "WELCOME10", type: "percentage", value: 10, minSpend: toSen(30), usageLimit: null, usedCount: 0, active: true, expiresAt: null, description: "10% off your first order (min spend RM30)" },
    { id: newId("disc"), code: "FREESHIP", type: "free_delivery", value: 0, minSpend: toSen(50), usageLimit: null, usedCount: 0, active: true, expiresAt: null, description: "Free delivery on orders above RM50" },
    { id: newId("disc"), code: "SAVE5", type: "fixed", value: toSen(5), minSpend: toSen(40), usageLimit: 200, usedCount: 0, active: true, expiresAt: null, description: "RM5 off orders above RM40" },
  ]);

  console.log("Seeding business settings...");
  await db.insert(businessSettings).values({
    id: "main",
    cafeName: "D'Amazon Cafe",
    address: "Shop No. R03, Lot.683, Monkeys Canopy Resort, Jalan Persiaran Bukit Enggang SG Long Hill, Sungai Long, Cheras, Selangor, Malaysia",
    phone: "+60 12-345 6789",
    email: "hello@damazoncafe.my",
    whatsappNumber: "60123456789",
    operatingHoursJson: JSON.stringify({
      mon: { open: "08:00", close: "22:00", closed: false },
      tue: { open: "08:00", close: "22:00", closed: false },
      wed: { open: "08:00", close: "22:00", closed: false },
      thu: { open: "08:00", close: "22:00", closed: false },
      fri: { open: "08:00", close: "23:00", closed: false },
      sat: { open: "08:00", close: "23:00", closed: false },
      sun: { open: "08:00", close: "22:00", closed: false },
    }),
    holidaysJson: JSON.stringify([]),
    pickupEnabled: true,
    deliveryEnabled: true,
    taxPercent: 0,
    serviceChargePercent: 0,
    paymentMode: "demo",
    mapEmbedUrl: "https://www.google.com/maps?q=Monkeys+Canopy+Resort+Sungai+Long&output=embed",
    mapDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Monkeys+Canopy+Resort+Sungai+Long+Cheras+Selangor",
  });

  console.log("Seeding default admin account...");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "DAmazon@2026";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await db.insert(admins).values({
    id: newId("admin"),
    email: "admin@damazoncafe.my",
    passwordHash,
    name: "D'Amazon Cafe Admin",
    role: "owner",
  });
  console.log(`Admin login -> email: admin@damazoncafe.my | password: ${adminPassword}`);

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
