import { db } from "./db";
import { businessSettings } from "./db/schema";
import { eq } from "drizzle-orm";

export type OperatingHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  { open: string; close: string; closed: boolean }
>;

export type BusinessSettings = {
  id: string;
  cafeName: string;
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  operatingHours: OperatingHours;
  holidays: string[];
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  taxPercent: number;
  serviceChargePercent: number;
  paymentMode: "demo" | "live";
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
};

const DEFAULT_HOURS: OperatingHours = {
  mon: { open: "08:00", close: "22:00", closed: false },
  tue: { open: "08:00", close: "22:00", closed: false },
  wed: { open: "08:00", close: "22:00", closed: false },
  thu: { open: "08:00", close: "22:00", closed: false },
  fri: { open: "08:00", close: "23:00", closed: false },
  sat: { open: "08:00", close: "23:00", closed: false },
  sun: { open: "08:00", close: "22:00", closed: false },
};

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const row = await db.query.businessSettings.findFirst({ where: eq(businessSettings.id, "main") });
  if (!row) {
    return {
      id: "main",
      cafeName: "D'Amazon Cafe",
      address: "Shop No. R03, Lot.683, Monkeys Canopy Resort, Jalan Persiaran Bukit Enggang SG Long Hill, Sungai Long, Cheras, Selangor, Malaysia",
      phone: "",
      email: "",
      whatsappNumber: "",
      operatingHours: DEFAULT_HOURS,
      holidays: [],
      pickupEnabled: true,
      deliveryEnabled: true,
      taxPercent: 0,
      serviceChargePercent: 0,
      paymentMode: "demo",
      mapEmbedUrl: "",
      mapDirectionsUrl: "",
    };
  }
  let operatingHours = DEFAULT_HOURS;
  let holidays: string[] = [];
  try {
    operatingHours = JSON.parse(row.operatingHoursJson);
  } catch {}
  try {
    holidays = JSON.parse(row.holidaysJson);
  } catch {}
  return {
    id: row.id,
    cafeName: row.cafeName,
    address: row.address,
    phone: row.phone,
    email: row.email,
    whatsappNumber: row.whatsappNumber,
    operatingHours,
    holidays,
    pickupEnabled: row.pickupEnabled,
    deliveryEnabled: row.deliveryEnabled,
    taxPercent: row.taxPercent,
    serviceChargePercent: row.serviceChargePercent,
    paymentMode: (process.env.PAYMENT_MODE as "demo" | "live") || (row.paymentMode as "demo" | "live"),
    mapEmbedUrl: row.mapEmbedUrl,
    mapDirectionsUrl: row.mapDirectionsUrl,
  };
}

const DAY_KEYS: (keyof OperatingHours)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function isOpenNow(settings: BusinessSettings, at: Date = new Date()): boolean {
  const dateStr = at.toISOString().slice(0, 10);
  if (settings.holidays.includes(dateStr)) return false;
  const key = DAY_KEYS[at.getDay()];
  const today = settings.operatingHours[key];
  if (!today || today.closed) return false;
  const hhmm = `${String(at.getHours()).padStart(2, "0")}:${String(at.getMinutes()).padStart(2, "0")}`;
  return hhmm >= today.open && hhmm <= today.close;
}
