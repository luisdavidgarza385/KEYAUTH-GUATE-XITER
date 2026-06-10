import { SubLoginForm } from "@/components/SubLoginForm";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styles from "../login/auth.module.css";

export const metadata = { title: "Sub-Reseller Login — Guate Xiter" };

export default function SubLoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.brandIcon} style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)", borderColor: "rgba(16,185,129,0.25)" }}>
          <ShieldCheck strokeWidth={1.5} style={{ color: "#34d399" }} />
        </div>
        <h1 className={styles.title}>Sub-Reseller Panel</h1>
        <p className={styles.subtitle}>Login to your reseller account</p>
        <div className={styles.card}>
          <SubLoginForm />
        </div>
        <p className={styles.footer}>
          Admin? <Link href="/login"> Admin login</Link>
        </p>
      </div>
    </div>
  );
}
