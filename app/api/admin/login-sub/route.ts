import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/store";
import { signSessionValue } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ success: false, message: "Invalid JSON" }, 400);
    }

    const email: string = String(body?.email || "").trim().toLowerCase();
    const password: string = String(body?.password || "");
    if (!email || !password) {
      return json({ success: false, message: "email and password required" }, 400);
    }

    const admin = await store.getAdminByEmail(email);
    if (!admin) {
      return json({ success: false, message: "Invalid credentials" }, 401);
    }

    if (admin.role !== "seller") {
      return json({ success: false, message: "This account is not a sub-reseller" }, 403);
    }

    if (admin.status === "banned") {
      return json({ success: false, message: "Account banned" }, 403);
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return json({ success: false, message: "Invalid credentials" }, 401);
    }

    const cookieValue = signSessionValue({ id: admin.id, email: admin.email, role: admin.role as "seller" });

    const res = json({ success: true, data: { id: admin.id, email: admin.email, role: admin.role } });
    res.cookies.set("ka_admin_session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return json({ success: false, message: "Server error" }, 500);
  }
}
