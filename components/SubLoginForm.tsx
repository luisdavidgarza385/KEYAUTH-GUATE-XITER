"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserCheck, Key } from "lucide-react";

export function SubLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login-sub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, api_key: apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#09090b",
    border: "1px solid #27272a",
    color: "#fafafa",
    padding: "11px 14px",
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#a1a1aa",
    marginBottom: 6,
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label style={labelStyle}>Email or Username</label>
        <input
          type="text"
          placeholder="Enter your email or username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Password</label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ ...inputStyle, paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>API Key</label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showApiKey ? "text" : "password"}
            placeholder="Paste your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            style={{ ...inputStyle, paddingRight: 40, fontFamily: "monospace", letterSpacing: showApiKey ? "normal" : 2 }}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#52525b", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 14, marginBottom: 22, fontSize: 12 }}>
        <Link href="/forgot-password" style={{ color: "#34d399", textDecoration: "none", fontWeight: 500 }}>
          Forgot password?
        </Link>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          color: "#ffffff",
          border: "none",
          padding: "12px 24px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</>
        ) : (
          <><UserCheck className="w-4 h-4 mr-2" /> Login as Sub-Reseller</>
        )}
      </button>
    </form>
  );
}
