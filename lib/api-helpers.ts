import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AdminSession } from "@/lib/auth";
import crypto from "crypto";

export type ApiJson = ReturnType<typeof NextResponse.json>;

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

const COOKIE_NAME = "ka_admin_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set. Add it to .env.local");
  }
  return secret;
}

function verifySession(signed: string): string | null {
  try {
    const secret = getSessionSecret();
    const lastDot = signed.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = signed.substring(0, lastDot);
    const signature = signed.substring(lastDot + 1);
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (signature !== expected) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const signed = cookieStore.get(COOKIE_NAME)?.value;
  if (!signed) return null;
  try {
    const payload = verifySession(signed);
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8")) as AdminSession;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function safeRoute(
  fn: () => Promise<{ status?: number; data: any } | NextResponse>
): Promise<NextResponse> {
  try {
    const result = await fn();
    if (result instanceof NextResponse) return result;
    return NextResponse.json(result.data, { status: result.status || 200 });
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_")) throw e;
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, message: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export { json };
