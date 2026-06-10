"use client";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

export function LicensesBulkActions({ activeAppId }: { activeAppId: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setSelectAll(false);
  }

  function toggleAll(ids: string[]) {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(ids));
      setSelectAll(true);
    }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} licenses?`)) return;
    setLoading(true);
    try {
      await fetch("/api/admin/licenses/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      setSelected(new Set());
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return {
    selected,
    selectAll,
    toggle,
    toggleAll,
    bulkDelete: bulkDelete,
    loading,
    renderBulkBar: selected.size > 0 ? (
      <div className="flex items-center gap-2 px-3 py-2 bg-danger/10 border border-danger/30 rounded-lg text-sm">
        <span className="text-danger font-medium">{selected.size} selected</span>
        <button
          onClick={bulkDelete}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-danger/20 hover:bg-danger/30 text-danger text-xs font-semibold transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete selected
        </button>
      </div>
    ) : null,
  };
}
