import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { Users, Search, Filter, LayoutGrid, Clock, RotateCcw, FileText, Trash2 } from "lucide-react";
import { UserCardMenu } from "@/components/UserCardMenu";
import { CreateUserInlineButton } from "@/components/CreateMenu";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { app?: string; banned?: string; perPage?: string; page?: string };
}) {
  const me = await requireAdmin();
  const scopedIds = await getScopedAppIds(me);
  const allApps = await store.listApps();
  const apps = scopedIds === null ? allApps : allApps.filter((a) => scopedIds.includes(a.id));
  const cookieStore = await cookies();
  const cookieApp = cookieStore.get("ka_current_app")?.value;

  let activeAppId = searchParams.app || cookieApp || "";
  if (!activeAppId && apps.length > 0) activeAppId = apps[0].id;
  if (activeAppId && !apps.find((a) => a.id === activeAppId)) activeAppId = apps[0]?.id || "";

  const filterAppId = searchParams.app || activeAppId || undefined;
  const users = await store.listAppUsers({
    appId: filterAppId,
    banned: searchParams.banned === "1" ? true : undefined,
    limit: 200,
  });
  const filteredUsers = scopedIds === null ? users : users.filter((u) => scopedIds.includes(u.app_id));

  const perPage = parseInt(searchParams.perPage || "10");
  const page = parseInt(searchParams.page || "1");
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pagedUsers = filteredUsers.slice(startIndex, startIndex + perPage);

  return (
    <div>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-text-muted mt-1">
            After someone registers for your app with a license, they will appear here.{" "}
            <a href="#" className="text-accent-glow hover:text-accent">Learn More.</a>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="text"
              placeholder="Search Users..."
              className="w-full rounded-md bg-bg-secondary border border-border pl-9 pr-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-accent"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ActionIcon Icon={Filter} title="Filter" />
            <ActionIcon Icon={LayoutGrid} title="Grid view" active />
            <CreateUserInlineButton apps={apps} defaultAppId={activeAppId} className="w-9 h-9 rounded-md flex items-center justify-center border border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/20 transition" />
            <ActionIcon Icon={Clock} title="By date" />
            <ActionIcon Icon={RotateCcw} title="Reset" />
            <ActionIcon Icon={FileText} title="Export" />
            <ActionIcon Icon={Trash2} title="Delete selected" danger />
          </div>
        </div>

        {apps.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <FilterLink href={activeAppId ? `/dashboard/users?app=${activeAppId}` : "/dashboard/users"} label="All" active={!searchParams.banned && !searchParams.app} />
            <FilterLink href={`/dashboard/users?app=${activeAppId}&banned=1`} label="Banned" active={searchParams.banned === "1"} />
            {apps.map((a) => (
              <FilterLink
                key={a.id}
                href={`/dashboard/users?app=${a.id}`}
                label={a.name}
                active={activeAppId === a.id}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" className="accent-accent" />
          <span>Select All</span>
          <span className="text-text-dim ml-3">Mostrar:</span>
          {["10", "100", "300"].map((n) => (
            <Link
              key={n}
              href={`/dashboard/users?app=${activeAppId || ""}&banned=${searchParams.banned || ""}&perPage=${n}&page=1`}
              className={`px-2 py-0.5 rounded border text-xs transition ${perPage === parseInt(n) ? "bg-accent/10 border-accent/40 text-accent-glow" : "border-border text-text-muted hover:text-text"}`}
            >
              {n}
            </Link>
          ))}
          <span className="ml-auto text-text-dim">{filteredUsers.length} total</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="card text-center py-16">
            <Users className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-text-muted mb-1">No users yet</p>
            <p className="text-xs text-text-dim">Click the <span className="text-text">Key</span> button above to create a user.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pagedUsers.map((u) => {
              const isPaused = u.hwid === "PAUSED";
              const status = u.banned ? "banned" : isPaused ? "paused" : "active";
              return (
                <div key={u.id} className="card relative hover:border-border-light transition group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input type="checkbox" className="accent-accent mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{u.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <StatusBadge status={status} />
                      <UserCardMenu user={{ id: u.id, banned: u.banned, paused: isPaused, username: u.username, balance: u.balance }} />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <Field label="Created" value={formatDate(u.created_at)} />
                    <Field label="Last Login" value={u.last_login ? formatDate(u.last_login) : "Never"} />
                    <Field label="IP" value={u.ip || "—"} mono />
                    <Field label="2FA" value={u.hwid && u.hwid !== "PAUSED" ? "Yes" : "No"} />
                    <Field label="Saldo / Saldo" value={u.balance !== undefined ? `$${u.balance.toFixed(2)}` : "$0.00"} />
                    <Field label="HWID Affected" value={u.hwid && u.hwid !== "PAUSED" ? "Yes" : "No"} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PaginationFooter count={filteredUsers.length} perPage={perPage} page={currentPage} totalPages={totalPages} activeAppId={activeAppId || ""} banned={searchParams.banned || ""} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "bg-success/15 text-success border-success/30"
      : status === "banned"
      ? "bg-danger/15 text-danger border-danger/30"
      : "bg-warning/15 text-warning border-warning/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${cls}`}>
      Status: {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-text-dim">{label}: </span>
      <span className={mono ? "font-mono text-text-muted" : "text-text-muted"}>{value}</span>
    </div>
  );
}

function ActionIcon({ Icon, title, active, danger }: { Icon: any; title: string; active?: boolean; danger?: boolean }) {
  return (
    <button
      title={title}
      className={
        "w-9 h-9 rounded-md flex items-center justify-center border transition " +
        (danger
          ? "border-danger/40 bg-danger/10 text-danger hover:bg-danger/20"
          : active
          ? "border-accent/40 bg-accent/10 text-accent-glow"
          : "border-border bg-bg-secondary text-text-muted hover:bg-bg-hover hover:text-text")
      }
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        "rounded-md px-3 py-1.5 border text-sm transition " +
        (active
          ? "bg-accent/10 border-accent/40 text-accent-glow"
          : "border-border text-text-muted hover:text-text hover:border-border-light")
      }
    >
      {label}
    </Link>
  );
}

function PaginationFooter({ count, perPage, page, totalPages, activeAppId, banned }: { count: number; perPage: number; page: number; totalPages: number; activeAppId: string; banned: string }) {
  const base = `/dashboard/users?app=${activeAppId}&banned=${banned}&perPage=${perPage}`;
  return (
    <div className="flex items-center justify-between text-sm text-text-muted pt-2">
      <Link
        href={page > 1 ? `${base}&page=${page - 1}` : "#"}
        className={`px-3 py-1.5 rounded-md border transition ${page <= 1 ? "border-border opacity-40 pointer-events-none" : "border-border hover:border-border-light"}`}
      >
        Previous
      </Link>
      <span>Page {page} of {totalPages}</span>
      <Link
        href={page < totalPages ? `${base}&page=${page + 1}` : "#"}
        className={`px-3 py-1.5 rounded-md border transition ${page >= totalPages ? "border-border opacity-40 pointer-events-none" : "border-border hover:border-border-light"}`}
      >
        Next
      </Link>
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}
