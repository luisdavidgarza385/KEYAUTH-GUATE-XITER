import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "admin") {
      return { status: 403, data: { success: false, message: "Only admins can list managers" } };
    }
    const admins = await store.listAdmins();
    const apps = await store.listApps();
    const appsBySeller = new Map<string, number>();
    for (const a of apps) {
      if (a.seller_id) appsBySeller.set(a.seller_id, (appsBySeller.get(a.seller_id) || 0) + 1);
    }
    const managers = admins.map((a) => ({
      id: a.id,
      email: a.email,
      role: a.role,
      app_count: a.role === "seller" ? appsBySeller.get(a.id) || 0 : null,
      created_at: a.created_at,
    }));
    return { data: { success: true, data: managers } };
  });
}

export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const me = await requireAdmin();
    if (me.role !== "admin") {
      return { status: 403, data: { success: false, message: "Only admins can create managers" } };
    }
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    if (!email || !email.includes("@")) {
      return { status: 400, data: { success: false, message: "Valid email required" } };
    }
    if (password.length < 6) {
      return { status: 400, data: { success: false, message: "Password must be at least 6 characters" } };
    }
    const existing = await store.getAdminByEmail(email);
    if (existing) {
      return { status: 409, data: { success: false, message: "Email already registered" } };
    }
    const password_hash = await bcrypt.hash(password, 10);
    const manager = await store.createAdmin({ email, password_hash, role: "seller" });
    return { data: { success: true, data: { id: manager.id, email: manager.email, role: manager.role } } };
  });
}
