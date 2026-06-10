import { RegisterForm } from "@/components/RegisterForm";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import styles from "../login/auth.module.css";

export const metadata = { title: "Create Account — Guate Xiter" };

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.brandIcon}>
          <ShieldCheck strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Fill in the details to get started</p>
        <div className={styles.card}>
          <RegisterForm />
        </div>
        <p className={styles.footer}>
          Already have an account?<Link href="/login"> Login here</Link>
        </p>
      </div>
    </div>
  );
}
