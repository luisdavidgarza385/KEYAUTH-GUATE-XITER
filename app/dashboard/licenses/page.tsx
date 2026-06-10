import { store } from "@/lib/store";
import { requireAdmin, getScopedAppIds } from "@/lib/auth";
import { Key, Search, Filter, LayoutGrid, Copy, Clock, RotateCcw, FileText, Trash2, Shield } from "lucide-react";
import { LicenseCardMenu } from "@/components/LicenseCardMenu";
import { LicensesPageActions } from "@/components/LicensesPageActions";
import { CopyKeyButton } from "@/components/CopyKeyButton";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: { app?: string; status?: string; perPage?: string; page?: string };
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
  const licenses = await store.listLicenses({
    appId: filterAppId,
    status: searchParams.status || undefined,
    limit: 200,
  });
  const filteredLicenses = scopedIds === null ? licenses : licenses.filter((l) => scopedIds.includes(l.app_id));

  const perPage = parseInt(searchParams.perPage || "10");
  const page = parseInt(searchParams.page || "1");
  const totalPages = Math.max(1, Math.ceil(filteredLicenses.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pagedLicenses = filteredLicenses.slice(startIndex, startIndex + perPage);

  const admins = await store.listAdmins();
  const adminsById = new Map(admins.map((a) => [a.id, a.email.split("@")[0]]));
  const currentApp = apps.find((a) => a.id === activeAppId);
  const fullAdmin = await store.getAdminById(me.id);

  return (
    <div>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Licenses</h1>
          <p className="text-sm text-text-muted mt-1">
            Licenses allow your users to register on your application.{" "}
            <a href="#" className="text-accent-glow hover:text-accent">Learn More.</a>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <form method="GET" action={`/dashboard/licenses`} className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search licenses..."
              className="w-full rounded-md bg-bg-secondary border border-border pl-9 pr-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-accent"
            />
            <button type="submit" hidden />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <ActionIcon Icon={Filter} title="Filter" active />
            <ActionIcon Icon={LayoutGrid} title="Grid view" />
            <ActionIcon Icon={Clock} title="By date" />
            <ActionIcon Icon={FileText} title="Export" />
            <LicensesPageActions apps={apps} filteredAppId={searchParams.app} role={me.role} subscriptionEnd={fullAdmin?.subscription_end || null} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-sm">
          <FilterLink href={activeAppId ? `/dashboard/licenses?app=${activeAppId}` : "/dashboard/licenses"} label="All" active={!searchParams.status && !searchParams.app} />
          <FilterLink href={`/dashboard/licenses?app=${activeAppId}&status=unused`} label="Unused" active={searchParams.status === "unused"} />
          <FilterLink href={`/dashboard/licenses?app=${activeAppId}&status=used`} label="Used" active={searchParams.status === "used"} />
          <FilterLink href={`/dashboard/licenses?app=${activeAppId}&status=banned`} label="Banned" active={searchParams.status === "banned"} />
          {apps.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-text-dim text-xs">App:</span>
              {apps.map((a) => (
                <FilterLink
                  key={a.id}
                  href={`/dashboard/licenses?app=${a.id}`}
                  label={a.name}
                  active={activeAppId === a.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" className="accent-accent" />
          <span>Select All</span>
          <span className="text-text-dim ml-3">Mostrar:</span>
          {["10", "100", "300"].map((n) => (
            <Link
              key={n}
              href={`/dashboard/licenses?app=${activeAppId || ""}&status=${searchParams.status || ""}&perPage=${n}&page=1`}
              className={`px-2 py-0.5 rounded border text-xs transition ${perPage === parseInt(n) ? "bg-accent/10 border-accent/40 text-accent-glow" : "border-border text-text-muted hover:text-text"}`}
            >
              {n}
            </Link>
          ))}
          <span className="ml-auto text-text-dim">{filteredLicenses.length} total</span>
        </div>

        {filteredLicenses.length === 0 ? (
          <div className="card text-center py-16">
            <Key className="w-10 h-10 text-text-dim mx-auto mb-3" />
            <p className="text-text-muted mb-1">No licenses yet</p>
            <p className="text-xs text-text-dim">Use the <span className="text-text">Create</span> button at the top right to generate licenses.</p>
          </div>
        ) : (
          <div className="card !p-0 !overflow-visible pb-12">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary/60 text-text-dim text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 text-left w-8"><input type="checkbox" className="accent-accent" /></th>
                  <th className="px-3 py-2.5 text-left">Key</th>
                  <th className="px-3 py-2.5 text-left">Paquete</th>
                  <th className="px-3 py-2.5 text-left">Creador</th>
                  <th className="px-3 py-2.5 text-left">Días</th>
                  <th className="px-3 py-2.5 text-left">HWID</th>
                  <th className="px-3 py-2.5 text-left">Estado</th>
                  <th className="px-3 py-2.5 text-left">Fecha</th>
                  <th className="px-3 py-2.5 text-right overflow-visible">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagedLicenses.map((l) => (
                  <tr key={l.id} className="border-t border-border/60 hover:bg-bg-secondary/30 transition">
                    <td className="px-3 py-2.5"><input type="checkbox" className="accent-accent" /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs font-semibold">{l.key.length > 24 ? l.key.slice(0, 24) + "…" : l.key}</code>
                        <CopyKeyButton value={l.key} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-text-muted">{l.package_name || "Bypass"}</td>
                    <td className="px-3 py-2.5 text-text-muted">{l.created_by ? adminsById.get(l.created_by) || "—" : "—"}</td>
                    <td className="px-3 py-2.5 text-text-muted">{l.duration_days >= 36500 ? "∞" : l.duration_days + "d"}</td>
                    <td className="px-3 py-2.5">
                      {l.hwid_lock ? (
                        <code className="font-mono text-xs text-text-dim">{l.used_by ? "HWID-…2a4b" : "—"}</code>
                      ) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={l.status} /></td>
                    <td className="px-3 py-2.5 text-text-dim text-xs">{formatDate(l.created_at)}</td>
                    <td className="px-3 py-2.5 text-right overflow-visible">
                      <LicenseCardMenu license={{ id: l.id, status: l.status, key: l.key }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        <PaginationFooter count={filteredLicenses.length} perPage={perPage} page={currentPage} totalPages={totalPages} activeAppId={activeAppId || ""} status={searchParams.status || ""} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    status === "used" ? "Used" : status === "banned" ? "Banned" : status === "paused" ? "Paused" : "Not Used";
  const cls =
    status === "used"
      ? "bg-success/15 text-success border-success/30"
      : status === "banned"
      ? "bg-danger/15 text-danger border-danger/30"
      : status === "paused"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-text-dim/15 text-text-muted border-text-dim/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-text-dim">{label}: </span>
      <span className="text-text-muted">{value}</span>
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

function PaginationFooter({ count, perPage, page, totalPages, activeAppId, status }: { count: number; perPage: number; page: number; totalPages: number; activeAppId: string; status: string }) {
  const base = `/dashboard/licenses?app=${activeAppId}&status=${status}&perPage=${perPage}`;
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
