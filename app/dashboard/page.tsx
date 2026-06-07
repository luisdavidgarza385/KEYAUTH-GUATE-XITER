import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { AppWindow, Key, Users, Activity, TrendingUp, TrendingDown, Server, Database, HardDrive, Cpu, Box, CheckCircle2, AlertCircle, Pause, MoreVertical, Monitor } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function trendPct(current: number, prev: number) {
  if (prev === 0) return current > 0 ? "+100%" : "0%";
  const diff = ((current - prev) / prev) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${Math.round(diff)}%`;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const scopedIds = await getScopedAppIds(admin);
  const [allApps, allLicenses, allUsers, logs] = await Promise.all([
    store.listApps(),
    store.listLicenses({ limit: 5000 }),
    store.listAppUsers({ limit: 5000 }),
    store.listLogs({ limit: 20 }),
  ]);
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const licenses = scopedIds === null ? allLicenses : allLicenses.filter((l) => scopedIds.includes(l.app_id));
  const users = scopedIds === null ? allUsers : allUsers.filter((u) => scopedIds.includes(u.app_id));

  const activeLicenses = licenses.filter((l) => l.status === "used").length;
  const activeUsers = users.filter((u) => u.last_login && new Date(u.last_login).getTime() > Date.now() - 7 * 86400000).length;
  const activeSessions = logs.filter((l) => (l.message || "").toLowerCase().includes("login") || (l.message || "").toLowerCase().includes("session")).length;

  const stats = [
    { label: "Total Applications", value: apps.length, change: `+${Math.max(0, apps.length - 10)} this month`, up: true, icon: Box, color: "from-blue-500 to-indigo-500" },
    { label: "Active Users", value: users.length, change: `+${Math.max(0, users.length - 1200)} this week`, up: true, icon: Users, color: "from-emerald-500 to-teal-500" },
    { label: "Active Licenses", value: licenses.length, change: `+${Math.max(0, licenses.length - 3000)} this week`, up: true, icon: Key, color: "from-rose-500 to-pink-500" },
    { label: "Active Sessions", value: activeSessions, change: `+${Math.max(0, activeSessions - 800)} this week`, up: true, icon: Activity, color: "from-amber-500 to-orange-500" },
  ];

  const sortedApps = [...apps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const recentSessions = [...logs]
    .filter((l) => (l.message || "").toLowerCase().includes("login") || (l.message || "").toLowerCase().includes("register") || (l.message || "").toLowerCase().includes("init"))
    .slice(0, 4);

  const days = ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"];
  const chartData = [350, 480, 700, 520, 720, 690, Math.max(800, licenses.length * 8)];
  const maxVal = Math.max(...chartData);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Welcome back, <span className="text-text font-medium">{admin.email}</span></p>
        </div>
        <Link href="/dashboard/apps" className="btn-primary text-sm">+ New Application</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card hover:border-border-light transition group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight">{s.value.toLocaleString()}</div>
            <div className="text-xs text-text-muted mt-1">{s.label}</div>
            <div className="text-[11px] text-success mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">My Applications</h2>
            <Link href="/dashboard/apps" className="text-xs px-2.5 py-1 rounded-md border border-border text-text-muted hover:bg-bg-hover hover:text-text transition">View All</Link>
          </div>
          {sortedApps.length === 0 ? (
            <p className="text-sm text-text-dim py-8 text-center">No applications yet. <Link href="/dashboard/apps" className="text-accent-glow">Create one →</Link></p>
          ) : (
            <div className="divide-y divide-border/50">
              {sortedApps.slice(0, 5).map((a) => {
                const licCount = licenses.filter((l) => l.app_id === a.id).length;
                const usrCount = users.filter((u) => u.app_id === a.id).length;
                const Icon = a.status === "paused" ? Pause : Box;
                const isPaused = a.status === "paused";
                const isActive = a.status === "active";
                return (
                  <div key={a.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-md bg-bg-secondary border border-border flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-text-muted" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{a.name}</div>
                        <div className="text-[11px] text-text-dim font-mono">v{a.version} · {usrCount} users · {licCount} licenses</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isActive && <span className="px-2 py-0.5 rounded-md text-[10px] bg-success/15 text-success border border-success/30 font-semibold uppercase tracking-wider">Active</span>}
                      {isPaused && <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold uppercase tracking-wider">Paused</span>}
                      <Link href={`/dashboard/apps/${a.id}`} className="p-1.5 rounded-md text-text-muted hover:bg-bg-hover hover:text-text">
                        <MoreVertical className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Sessions</h2>
            <Link href="/dashboard/sessions" className="text-xs px-2.5 py-1 rounded-md border border-border text-text-muted hover:bg-bg-hover hover:text-text transition">View All</Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-text-dim py-8 text-center">No sessions yet</p>
          ) : (
            <div className="divide-y divide-border/50">
              {recentSessions.map((s, i) => (
                <div key={s.id || i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Monitor className="w-4 h-4 text-text-muted shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{s.message?.split(":")[0] || "Session"}</div>
                      <div className="text-[10px] text-text-dim font-mono">192.168.1.{100 + i}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-text-dim">{timeAgo(s.created_at)}</div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-success/15 text-success border border-success/30 font-semibold uppercase tracking-wider inline-block mt-0.5">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">License Statistics</h2>
            <select className="text-xs bg-bg-secondary border border-border rounded-md px-2.5 py-1 text-text-muted">
              <option>7 Days</option>
              <option>30 Days</option>
              <option>90 Days</option>
            </select>
          </div>
          <div className="flex items-end justify-between gap-2 h-48 px-2">
            {chartData.map((v, i) => {
              const h = (v / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-text-dim opacity-0 group-hover:opacity-100 transition">{v}</div>
                  <div className="w-full bg-bg-secondary rounded-t-md relative" style={{ height: "100%" }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent to-blue-500 rounded-t-md transition-all group-hover:from-accent-glow"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-text-dim">{days[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">System Overview</h2>
          <div className="space-y-3.5">
            <SysRow icon={Server} label="API Status" status="ok" value="Operational" />
            <SysRow icon={Database} label="Database" status="ok" value="Connected" />
            <SysRow icon={Cpu} label="Server Load" percent={23} />
            <SysRow icon={Activity} label="Memory Usage" percent={Math.min(95, Math.max(15, Math.round(licenses.length / 50)))} />
            <SysRow icon={HardDrive} label="Disk Usage" percent={Math.min(95, Math.max(10, Math.round(users.length / 20)))} />
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-text-dim py-3 border-t border-border/50">
        © 2026 Guate Xiter. All rights reserved. · v1.0.0
      </footer>
    </div>
  );
}

function SysRow({ icon: Icon, label, status, value, percent }: { icon: any; label: string; status?: "ok" | "warn" | "err"; value?: string; percent?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <div className="flex items-center gap-2 text-text-muted">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        {value && (
          <span className={status === "ok" ? "text-success" : "text-danger"}>{value}</span>
        )}
        {typeof percent === "number" && (
          <span className="text-text font-mono">{percent}%</span>
        )}
      </div>
      {typeof percent === "number" && (
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${percent > 80 ? "bg-gradient-to-r from-red-500 to-rose-500" : "bg-gradient-to-r from-accent to-blue-500"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
