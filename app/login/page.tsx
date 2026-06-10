import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styles from "./auth.module.css";

export const metadata = { title: "Login — Guate Xiter" };

const ERR_MESSAGES: Record<string, string> = {
  discord_not_configured: "Discord login is not configured.",
  google_not_configured: "Google login is not configured.",
  apple_not_configured: "Apple login is not configured.",
  no_account: "No account found for this email.",
  invalid_state: "OAuth state mismatch. Please try again.",
  missing_code: "OAuth provider did not return a code.",
  token_exchange: "Failed to exchange OAuth code.",
  fetch_profile: "Failed to fetch your profile from the OAuth provider.",
  telegram_invalid: "Telegram login data is invalid or expired.",
  access_denied: "You declined the OAuth authorization.",
};

export default function LoginPage({ searchParams }: { searchParams: { err?: string } }) {
  const errMsg = searchParams.err ? ERR_MESSAGES[searchParams.err] || `OAuth error: ${searchParams.err}` : null;
  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.brandIcon}>
          <ShieldCheck strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.subtitle}>Login to your account</p>
        <div className={styles.card}>
          {errMsg && <div className={styles.error}>{errMsg}</div>}
          <LoginForm />
        </div>
        <p className={styles.footer}>
          Don&apos;t have an account?<Link href="/register"> Register here</Link>
        </p>
        <p className={styles.footer}>
          Sub-Reseller?<Link href="/login-sub"> Login here</Link>
        </p>
      </div>
    </div>
  );
}
