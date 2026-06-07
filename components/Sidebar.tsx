"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  AppWindow,
  Key,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield,
  UserCog,
  Activity,
  KeyRound,
  Webhook,
  User as UserIcon,
  Lock,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
      { href: "/dashboard/apps", label: "Applications", icon: AppWindow, adminOnly: false },
      { href: "/dashboard/users", label: "Users", icon: Users, adminOnly: false },
      { href: "/dashboard/licenses", label: "Licenses", icon: Key, adminOnly: false },
      { href: "/dashboard/sessions", label: "Sessions", icon: Activity, adminOnly: false },
      { href: "/dashboard/logs", label: "Logs", icon: FileText, adminOnly: true },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { href: "/dashboard/license-generator", label: "Licenses Generator", icon: KeyRound, adminOnly: false },
      { href: "/dashboard/api-keys", label: "API Keys", icon: Key, adminOnly: false },
      { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook, adminOnly: false },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings, adminOnly: false },
      { href: "/dashboard/profile", label: "Profile", icon: UserIcon, adminOnly: false },
      { href: "/dashboard/security", label: "Security", icon: Lock, adminOnly: false },
      { href: "/dashboard/managers", label: "Managers", icon: UserCog, adminOnly: true },
    ],
  },
];

export function Sidebar({ role, email }: { role: "admin" | "seller" | "developer"; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "admin" || role === "developer";
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gx-theme");
    if (stored === "light") {
      setDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("gx-theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("gx-theme", "light");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 border-r border-border bg-bg-secondary/40 backdrop-blur flex flex-col h-screen sticky top-0">
      <div className="p-5 flex items-center gap-2.5 border-b border-border">
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-accent/30">
          <img src="/logo.png" alt="Guate Xiter" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm tracking-tight">Guate Xiter</div>
          <div className="text-[10px] text-text-dim font-mono uppercase tracking-wider flex items-center gap-1">
            {role === "admin" ? "Admin Panel" : role === "developer" ? "Developer" : "Manager"}
            {role === "developer" && <Shield className="w-3 h-3 text-accent-glow" />}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {SECTIONS.map((section) => {
          const items = section.items.filter((i) => isAdmin || !i.adminOnly);
          if (items.length === 0) return null;
          return (
            <div key={section.label} className="mb-3">
              <div className="px-5 py-1.5 text-[10px] text-text-dim font-semibold uppercase tracking-widest">
                {section.label}
              </div>
              <div className="px-3 space-y-0.5">
                {items.map((n) => {
                  const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition",
                        active
                          ? "bg-gradient-to-r from-accent/20 to-accent/5 text-text border-l-2 border-accent-glow"
                          : "text-text-muted hover:bg-bg-hover hover:text-text border-l-2 border-transparent"
                      )}
                    >
                      <n.icon className={cn("w-4 h-4 shrink-0", active ? "text-accent-glow" : "")} />
                      <span className="truncate">{n.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            {dark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            Dark Mode
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              "relative w-9 h-5 rounded-full transition",
              dark ? "bg-accent" : "bg-bg-hover"
            )}
            aria-label="Toggle theme"
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow",
                dark ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>
        <div className="px-3 py-1.5 text-[10px] text-text-dim font-mono truncate" title={email}>
          {email}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-text-muted hover:bg-bg-hover hover:text-danger transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
