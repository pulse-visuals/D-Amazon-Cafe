import { db, sqlite } from "./db";
import { orders, orderItems, orderStatusHistory, payments, businessSettings } from "./db/schema";
import { eq } from "drizzle-orm";
import { newId } from "./id";
import { nextOrderNumber } from "./order-number";
import { priceCartItems, computeDeliveryFee, applyDiscountCode, type CartLineInput } from "./pricing";
import { createBill, getPaymentMode } from "./billplz";
import type { OrderStatus } from "./order-status";

export type CreateOrderInput = {
  items: CartLineInput[];
  orderType: "pickup" | "delivery";
  scheduleType: "asap" | "scheduled";
  scheduledFor?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderNotes?: string;
  deliveryZoneId?: string;
  deliveryAddress1?: string;
  deliveryAddress2?: string;
  deliveryPostcode?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryInstructions?: string;
  discountCode?: string;
};

export class OrderValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(" "));
  }
}

export async function createOrder(input: CreateOrderInput) {
  const priced = await priceCartItems(input.items);
  if (!priced.ok) throw new OrderValidationError(priced.errors);

  let deliveryFee = 0;
  let deliveryZoneId: string | undefined;
  if (input.orderType === "delivery") {
    const zoneResult = await computeDeliveryFee(input.deliveryZoneId, priced.subtotal);
    if (!zoneResult.ok) throw new OrderValidationError([zoneResult.error || "Invalid delivery zone."]);
    deliveryFee = zoneResult.fee;
    deliveryZoneId = zoneResult.zoneId;
  }

  const discountResult = await applyDiscountCode(input.discountCode, priced.subtotal);
  if (!discountResult.ok) throw new OrderValidationError([discountResult.error || "Invalid discount code."]);
  if (discountResult.freeDelivery) deliveryFee = 0;

  const settingsRow = await db.query.businessSettings.findFirst({ where: eq(businessSettings.id, "main") });
  const taxPercent = settingsRow?.taxPercent || 0;
  const serviceChargePercent = settingsRow?.serviceChargePercent || 0;
  const taxableBase = priced.subtotal - discountResult.discountAmount;
  const taxAmount = Math.round((taxableBase * (taxPercent + serviceChargePercent)) / 100);

  const total = Math.max(0, priced.subtotal - discountResult.discountAmount + deliveryFee + taxAmount);

  const orderId = newId("order");
  const orderNumber = nextOrderNumber();
  const paymentMode = getPaymentMode();

  const insertTx = sqlite.transaction(() => {
    db.insert(orders)
      .values({
        id: orderId,
        orderNumber,
        status: "received",
        orderType: input.orderType,
        scheduleType: input.scheduleType,
        scheduledFor: input.scheduledFor || null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || "",
        orderNotes: input.orderNotes || "",
        deliveryAddress1: input.deliveryAddress1 || "",
        deliveryAddress2: input.deliveryAddress2 || "",
        deliveryPostcode: input.deliveryPostcode || "",
        deliveryCity: input.deliveryCity || "",
        deliveryState: input.deliveryState || "",
        deliveryInstructions: input.deliveryInstructions || "",
        deliveryZoneId: deliveryZoneId || null,
        subtotal: priced.subtotal,
        discountCode: discountResult.discountId ? (input.discountCode || "").toUpperCase() : "",
        discountAmount: discountResult.discountAmount,
        deliveryFee,
        taxAmount,
        total,
        paymentMethod: "billplz",
        paymentStatus: "unpaid",
        paymentMode,
      })
      .run();

    for (const line of priced.lines) {
      db.insert(orderItems)
        .values({
          id: newId("item"),
          orderId,
          productId: line.productId,
          productName: line.productName,
          productImage: line.productImage,
          variantName: line.variantName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          addOnsJson: JSON.stringify(line.addOns),
          specialInstructions: line.specialInstructions,
          lineTotal: line.lineTotal,
        })
        .run();
    }

    db.insert(orderStatusHistory)
      .values({ id: newId("hist"), orderId, status: "received", note: "Order placed by customer." })
      .run();

    if (discountResult.discountId) {
      const row = sqlite.prepare(`SELECT used_count FROM discount_codes WHERE id = ?`).get(discountResult.discountId) as { used_count: number } | undefined;
      if (row) sqlite.prepare(`UPDATE discount_codes SET used_count = ? WHERE id = ?`).run(row.used_count + 1, discountResult.discountId);
    }
  });
  insertTx();

  const bill = await createBill({
    orderId,
    orderNumber,
    amountSen: total,
    name: input.customerName,
    email: input.customerEmail || "",
    mobile: input.customerPhone,
    description: `D'Amazon Cafe order ${orderNumber}`,
  });

  await db.insert(payments).values({
    id: newId("pay"),
    orderId,
    gateway: "billplz",
    gatewayBillId: bill.billId,
    amount: total,
    status: "pending",
    mode: paymentMode,
  });

  return { orderId, orderNumber, total, paymentUrl: bill.paymentUrl };
}

export async function markOrderPaid(params: { orderId?: string; orderNumber?: string; gatewayBillId?: string; rawPayload?: unknown }) {
  const order = await findOrder(params);
  if (!order) return null;
  if (order.paymentStatus === "paid") return order; // idempotent

  await db
    .update(orders)
    .set({ paymentStatus: "paid", status: "paid", updatedAt: new Date().toISOString() })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({ id: newId("hist"), orderId: order.id, status: "paid", note: "Payment confirmed." });

  if (params.gatewayBillId) {
    await db
      .update(payments)
      .set({ status: "paid", rawPayload: JSON.stringify(params.rawPayload || {}) })
      .where(eq(payments.gatewayBillId, params.gatewayBillId));
  } else {
    await db
      .update(payments)
      .set({ status: "paid", rawPayload: JSON.stringify(params.rawPayload || {}) })
      .where(eq(payments.orderId, order.id));
  }

  return { ...order, status: "paid", paymentStatus: "paid" };
}

export async function markOrderPaymentFailed(params: { orderId?: string; orderNumber?: string; gatewayBillId?: string; rawPayload?: unknown }) {
  const order = await findOrder(params);
  if (!order) return null;

  await db.update(orders).set({ paymentStatus: "failed", updatedAt: new Date().toISOString() }).where(eq(orders.id, order.id));

  if (params.gatewayBillId) {
    await db
      .update(payments)
      .set({ status: "failed", rawPayload: JSON.stringify(params.rawPayload || {}) })
      .where(eq(payments.gatewayBillId, params.gatewayBillId));
  } else {
    await db
      .update(payments)
      .set({ status: "failed", rawPayload: JSON.stringify(params.rawPayload || {}) })
      .where(eq(payments.orderId, order.id));
  }

  return order;
}

async function findOrder(params: { orderId?: string; orderNumber?: string; gatewayBillId?: string }) {
  if (params.orderId) {
    return db.query.orders.findFirst({ where: eq(orders.id, params.orderId) });
  }
  if (params.orderNumber) {
    return db.query.orders.findFirst({ where: eq(orders.orderNumber, params.orderNumber) });
  }
  if (params.gatewayBillId) {
    const payment = await db.query.payments.findFirst({ where: eq(payments.gatewayBillId, params.gatewayBillId) });
    if (!payment) return null;
    return db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) });
  }
  return null;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note = "") {
  await db.update(orders).set({ status, updatedAt: new Date().toISOString() }).where(eq(orders.id, orderId));
  await db.insert(orderStatusHistory).values({ id: newId("hist"), orderId, status, note });
}

export async function retryPayment(orderId: string) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) throw new Error("Order not found");
  if (order.paymentStatus === "paid") throw new Error("Order already paid");

  const bill = await createBill({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountSen: order.total,
    name: order.customerName,
    email: order.customerEmail,
    mobile: order.customerPhone,
    description: `D'Amazon Cafe order ${order.orderNumber} (retry)`,
  });

  await db.insert(payments).values({
    id: newId("pay"),
    orderId: order.id,
    gateway: "billplz",
    gatewayBillId: bill.billId,
    amount: order.total,
    status: "pending",
    mode: getPaymentMode(),
  });

  return bill;
}
