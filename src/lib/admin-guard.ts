import { NextResponse } from "next/server";
import { getAdminSession, type AdminSessionPayload } from "./auth";

export async function requireAdmin(): Promise<{ session: AdminSessionPayload } | { error: NextResponse }> {
  const session = await getAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { session };
}
