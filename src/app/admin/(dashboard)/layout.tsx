import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "../AdminShell";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // The proxy (middleware) already blocks unauthenticated requests to /admin/*,
  // but we re-check here too — defense in depth, and it gives us the admin's
  // name/email to render in the shell without another round trip.
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell adminName={session.name}>{children}</AdminShell>;
}
