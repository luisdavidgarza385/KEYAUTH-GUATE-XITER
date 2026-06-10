"use client";
import { useState, useEffect } from "react";
import { Coins, Plus, Loader2, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, ShoppingCart, History } from "lucide-react";

interface CreditTransaction {
  id: string;
  type: "purchase" | "usage" | "bonus" | "refund";
  amount: number;
  description: string;
  created_at: string;
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [role, setRole] = useState<string>("");
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpModal, setTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(10);
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/me");
      const data = await res.json();
      if (res.ok && data.success) {
        setCredits(data.data?.credits ?? 0);
        setRole(data.data?.role || "");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const isUnlimited = role === "developer" || role === "admin";

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span>Cargando créditos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800/60 pb-5">
        <h1 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
          <Coins className="w-5 h-5 text-emerald-400" />
          Créditos
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Gestiona tus créditos para generar licencias y usuarios.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800/80 p-5 border-l-4 border-l-blue-500 bg-blue-500/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Saldo Disponible</div>
            <div className="text-3xl font-black mt-1 font-mono text-blue-400">
              {isUnlimited ? "∞" : credits?.toFixed(1) ?? "0.0"}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              {isUnlimited ? "Plan ilimitado" : "Créditos restantes"}
            </div>
          </div>
          <Wallet className="w-8 h-8 opacity-40 text-blue-400" />
        </div>

        <div className="rounded-lg border border-zinc-800/80 p-5 border-l-4 border-l-orange-500 bg-orange-500/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Costo Por Licencia</div>
            <div className="text-3xl font-black mt-1 font-mono text-orange-400">1.0</div>
            <div className="text-[10px] text-zinc-500 mt-1">Créditos por generación</div>
          </div>
          <TrendingUp className="w-8 h-8 opacity-40 text-orange-400" />
        </div>

        <div className="rounded-lg border border-zinc-800/80 p-5 border-l-4 border-l-emerald-500 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Licencias Generadas</div>
            <div className="text-3xl font-black mt-1 font-mono text-emerald-400">—</div>
            <div className="text-[10px] text-zinc-500 mt-1">Total de licencias creadas</div>
          </div>
          <ShoppingCart className="w-8 h-8 opacity-40 text-emerald-400" />
        </div>
      </div>

      {/* Top Up Section (for non-unlimited users) */}
      {!isUnlimited && (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Comprar Créditos
            </h2>
            <button
              onClick={() => setTopUpModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" /> Agregar créditos
            </button>
          </div>
          <p className="text-xs text-zinc-500">Cada licencia generada cuesta 1.0 crédito. Compra más créditos para seguir creando licencias.</p>
        </div>
      )}

      {/* Unlimited Banner */}
      {isUnlimited && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-300">Plan Ilimitado Activo</h2>
          </div>
          <p className="text-xs text-emerald-400/70">Tu cuenta tiene acceso ilimitado. No necesitas créditos para generar licencias.</p>
        </div>
      )}

      {/* Transaction History */}
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-100">Historial de Transacciones</h3>
        </div>
        <div className="py-16 text-center">
          <Coins className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400">No hay transacciones aún</p>
          <p className="text-xs text-zinc-500 mt-1">Las transacciones de créditos aparecerán aquí.</p>
        </div>
      </div>

      {/* Top Up Modal */}
      {topUpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/20">
              <h3 className="font-bold text-sm text-zinc-100">Agregar Créditos</h3>
              <button onClick={() => setTopUpModal(false)} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-900 transition text-xs">
                Cerrar
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">Cantidad de créditos</label>
                <input
                  type="number"
                  min={1}
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-emerald-500/50 transition font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">1 crédito = 1 licencia generada</p>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-900">
                <button
                  onClick={() => setTopUpModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 transition"
                >
                  Cancelar
                </button>
                <button
                  disabled={topUpLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {topUpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Comprar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
