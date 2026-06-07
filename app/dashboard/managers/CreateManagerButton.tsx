"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCog, FolderTree } from "lucide-react";

export function CreateManagerButton({ apps }: { apps: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"create" | "assign">("create");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const router = useRouter();

  function reset() {
    setOpen(false);
    setEmail("");
    setPassword("");
    setSelected([]);
    setErr(null);
    setStep("create");
    setCreatedId(null);
  }

  function toggleApp(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function createManager() {
    setErr(null);
    if (!email || !email.includes("@")) { setErr("Valid email required"); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    const r = await fetch("/api/admin/managers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    setCreatedId(d.data.id);
    setStep("assign");
  }

  async function saveAssign() {
    if (!createdId) return;
    setLoading(true);
    const r = await fetch(`/api/admin/managers/${createdId}/apps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appIds: selected }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) { setErr(d.message || "Error"); return; }
    router.refresh();
    reset();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        <Plus className="w-4 h-4" /> Create Manager
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={reset}>
      <div className="relative bg-bg-card border border-border rounded-lg shadow-2xl w-full max-w-md my-auto" style={{ maxHeight: "calc(100vh - 2rem)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <UserCog className="w-4 h-4 text-accent-glow" />
            {step === "create" ? "Create manager" : "Assign apps"}
          </h3>
          <button onClick={reset} className="text-text-dim hover:text-text p-1 -mr-1">×</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
          {step === "create" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Email *</label>
                <input type="email" className="input" placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1.5 block">Password *</label>
                <input type="password" className="input" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-[10px] text-text-dim mt-1">Share this with the manager. They can change it later.</p>
              </div>
              {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={reset} className="btn-secondary text-sm">Cancel</button>
                <button onClick={createManager} disabled={loading} className="btn-primary text-sm">
                  {loading ? "..." : "Next: assign apps"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Select which applications <span className="font-mono text-text">{email}</span> can manage. They can create licenses and users for these apps only.
              </p>
              {apps.length === 0 ? (
                <p className="text-sm text-text-dim">No applications yet — create some first.</p>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {apps.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-bg-secondary hover:border-accent/30 cursor-pointer text-sm">
                      <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleApp(a.id)} className="accent-accent" />
                      <FolderTree className="w-3.5 h-3.5 text-text-dim" />
                      <span className="flex-1 truncate">{a.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-text-dim">Skip for now and assign later from the manager card.</p>
              {err && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">{err}</div>}
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={saveAssign} disabled={loading} className="btn-primary text-sm">
                  {loading ? "..." : "Done"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
