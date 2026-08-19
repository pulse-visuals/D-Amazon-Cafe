import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validators";
import { createOrder, OrderValidationError } from "@/lib/order-service";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limited = rateLimit(req, "orders", 12, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your order details.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await createOrder(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return NextResponse.json({ error: err.errors.join(" ") }, { status: 400 });
    }
    console.error("Order creation failed", err);
    return NextResponse.json({ error: "Something went wrong placing your order. Please try again." }, { status: 500 });
  }
}
