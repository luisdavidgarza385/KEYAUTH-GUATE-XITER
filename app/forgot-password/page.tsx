"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import styles from "../login/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!email) { setErr("Email is required"); return; }
    if (!newPassword || newPassword.length < 6) { setErr("New password must be at least 6 characters"); return; }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Error"); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.brandIcon}>
          <ShieldCheck strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>Enter your email and a new password</p>
        <div className={styles.card}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: 16 }}>
                <Check className="w-6 h-6" style={{ color: "#34d399" }} />
              </div>
              <p style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 20 }}>Password updated. You can now log in.</p>
              <Link href="/login" className={styles.premiumBtn} style={{ textDecoration: "none", display: "block", textAlign: "center" }}>Go to login</Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 4 }}>
                <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#71717a", textDecoration: "none", marginBottom: 12 }}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className={styles.inputLabel}>Email</label>
                <input
                  className={styles.premiumInput}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ paddingRight: 14 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className={styles.inputLabel}>New password</label>
                <input
                  className={styles.premiumInput}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{ paddingRight: 14 }}
                />
              </div>
              {err && <div className={styles.error}>{err}</div>}
              <button onClick={submit} disabled={loading} className={styles.premiumBtn}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Reset password"}
              </button>
            </>
          )}
        </div>
        <p className={styles.footer}>
          Already have an account?<Link href="/login"> Login here</Link>
        </p>
      </div>
    </div>
  );
}
