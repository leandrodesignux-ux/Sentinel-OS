"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

export function LoginScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (name.trim()) {
      localStorage.setItem("operatorName", name.trim());
      router.push("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F0F4F0 0%, #F4F5F7 100%)" }}>
      <div className="w-full max-w-[420px] mx-4">
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--bg-border)] p-12">
          <div className="flex flex-col items-center mb-6">
            <div className="h-8 w-8 flex items-center justify-center mb-3">
              <Bot className="h-8 w-8" style={{ color: "var(--status-accent)" }} />
            </div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Sentinel OS</h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-2">Supervisión de flota IA · 50 agentes · 1 operador</p>
          </div>

          <div className="w-full h-px bg-[var(--bg-border)] mb-6" />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Nombre del operador</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-[var(--bg-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--status-accent)] focus:ring-2 focus:ring-[var(--status-accent)]/10"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={!name.trim()}
              className="w-full h-11 rounded-xl bg-[var(--status-accent)] text-white font-medium text-sm transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Entrar al sistema
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[12px] text-[var(--text-muted)]">
              Diseñado y construido por <span className="font-medium text-[var(--text-secondary)]">Leandro Balbián</span> · Product Designer
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-[11px] text-[var(--text-muted)]">Proyecto de portfolio · No almacena datos reales</p>
        </div>
      </div>
    </div>
  );
}
