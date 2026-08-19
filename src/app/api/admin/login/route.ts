import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { adminLoginSchema } from "@/lib/validators";
import { signAdminSession, ADMIN_COOKIE } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Tight limit: this endpoint checks a password, so brute force must be slow.
  const limited = rateLimit(req, "admin-login", 8, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const admin = await db.query.admins.findFirst({ where: eq(admins.email, parsed.data.email.toLowerCase()) });
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await signAdminSession({ adminId: admin.id, email: admin.email, name: admin.name, role: admin.role });

  const res = NextResponse.json({ ok: true, admin: { name: admin.name, email: admin.email, role: admin.role } });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
