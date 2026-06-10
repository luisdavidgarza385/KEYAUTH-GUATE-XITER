"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import styles from "@/app/login/auth.module.css";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={styles.inputLabel}>Email or Username</label>
        <div className={styles.fieldWrapper}>
          <input
            type="text"
            className={styles.premiumInput}
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
      </div>

      <div>
        <label className={styles.inputLabel}>Password</label>
        <div className={styles.fieldWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            className={styles.premiumInput}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeBtn}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.remember}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Remember me</span>
        </label>
        <Link href="/forgot-password" className={styles.forgot}>
          Forgot password?
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.premiumBtn} disabled={loading}>
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
}
