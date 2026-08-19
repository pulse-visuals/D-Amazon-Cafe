export const ORDER_STATUSES = [
  "received",
  "paid",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Order Received",
  paid: "Payment Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** The customer-facing tracker step order (pickup path). `ready` swaps for
 * `out_for_delivery` automatically when the order is a delivery order. */
export function trackerSteps(orderType: "pickup" | "delivery"): OrderStatus[] {
  return ["received", "paid", "preparing", orderType === "delivery" ? "out_for_delivery" : "ready", "completed"];
}

export function whatsappLink(numberDigitsOnly: string, message: string): string {
  const clean = numberDigitsOnly.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
