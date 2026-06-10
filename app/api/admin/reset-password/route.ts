import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/store";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentAdmin();
    if (!me) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { email, newPassword } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const targetAdmin = await store.getAdminByEmail(targetEmail);
    if (!targetAdmin) {
      return NextResponse.json({ success: false, message: "No account found with that email" }, { status: 404 });
    }

    if (me.email !== targetEmail && me.role !== "admin") {
      return NextResponse.json({ success: false, message: "You can only reset your own password" }, { status: 403 });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await store.updateAdmin(targetAdmin.id, { ...targetAdmin, password_hash });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
