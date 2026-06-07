"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit, Ban, Pause, RotateCcw, Trash2, Check } from "lucide-react";

export function UserCardMenu({ user }: { user: { id: string; banned: boolean; paused?: boolean; username: string } }) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [showReset, setShowShowReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function patch(body: any) {
    setBusy(true);
    const res = await fetch(`/api/admin/app-users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Error");
      return;
    }
    setOpen(false);
    setShowEdit(false);
    setShowBan(false);
    setShowShowReset(false);
    setPassword("");
    setReason("");
    router.refresh();
  }

  async function deleteUser() {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/app-users/${user.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.message || "Error");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[180px] rounded-md border border-border bg-bg-card shadow-xl overflow-hidden">
          <button onClick={() => { setOpen(false); setShowEdit(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover">
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => { setOpen(false); setShowBan(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover border-t border-border">
            <Ban className="w-4 h-4" /> {user.banned ? "Unban" : "Ban"}
          </button>
          <button onClick={() => patch({ paused: !user.paused })} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover border-t border-border">
            <Pause className="w-4 h-4" /> {user.paused ? "Resume" : "Pause"}
          </button>
          <button onClick={() => patch({ resetHwid: true })} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-bg-hover border-t border-border">
            <RotateCcw className="w-4 h-4" /> Reset HWID
          </button>
          <button onClick={deleteUser} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-danger/10 text-danger border-t border-border">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setShowEdit(false)}>
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Edit user — {user.username}</h3>
            <div className="space-y-3">
              <div>
                <label className="label">New password (leave empty to keep)</label>
                <input className="input" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => patch({ password: password || undefined })}
                className="btn-primary"
                disabled={busy}
              >
                {busy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showBan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setShowBan(false)}>
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">{user.banned ? "Unban" : "Ban"} user</h3>
            {!user.banned && (
              <div>
                <label className="label">Reason</label>
                <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional" />
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowBan(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => patch({ banned: !user.banned, banReason: user.banned ? undefined : reason })}
                className={user.banned ? "btn-primary" : "btn-danger"}
                disabled={busy}
              >
                {user.banned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
