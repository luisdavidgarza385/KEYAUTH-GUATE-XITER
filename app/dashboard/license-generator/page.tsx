import { KeyRound, ArrowRight } from "lucide-react";
import { CreateLicenseInlineButton } from "@/components/CreateMenu";
import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LicenseGeneratorPage() {
  const me = await requireAdmin();
  const apps = await store.listApps();
  const myApps = me.role === "seller" ? apps.filter((a) => a.seller_id === me.id) : apps;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><KeyRound className="w-6 h-6 text-accent-glow" /> Licenses Generator</h1>
        <p className="text-sm text-text-muted mt-1">Bulk-generate license keys for your applications.</p>
      </div>

      {myApps.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-text-muted mb-3">You need an application first.</p>
          <Link href="/dashboard/apps" className="btn-primary text-sm inline-flex items-center gap-1">Create Application <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      ) : (
        <div className="card">
          <h3 className="font-semibold mb-3">Choose an app to generate licenses for</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myApps.map((a) => (
              <div key={a.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{a.name}</div>
                  <div className="text-[10px] text-text-dim font-mono">v{a.version}</div>
                </div>
                <CreateLicenseInlineButton apps={myApps} defaultAppId={a.id} label="Generate" className="btn-primary text-xs" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
