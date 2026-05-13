"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Shield, Zap, Users } from "lucide-react";

export function LoginScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (name.trim()) {
      localStorage.setItem("operatorName", name.trim());
      router.push("/");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #111414 0%, #1A1D1D 60%, #1F2323 100%)" }}
    >
      {/* Dashboard preview blur en el fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.05]">
        <div className="w-[900px] h-[600px] rounded-3xl bg-white/5 border border-white/10 flex gap-0 overflow-hidden">
          <div className="w-[200px] h-full bg-white/5 border-r border-white/10 flex flex-col gap-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-white/5" style={{width: `${60 + i * 8}%`}} />
            ))}
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/5" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div className="relative w-full max-w-[400px] mx-6">
        {/* Header del producto sobre la card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-[#F6F4D2] flex items-center justify-center shadow-lg shadow-[#F6F4D2]/20">
              <Shield className="h-5 w-5 text-[#1A1D1D]" />
            </div>
            <span className="text-[22px] font-semibold text-white tracking-tight">Sentinel OS</span>
          </div>
          <p className="text-[14px] text-[#A8AFAF] leading-relaxed">
            Una persona supervisando 50 agentes de IA.<br />
            Solo ves lo que importa.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#2B2E2E] rounded-[24px] border border-[#3D4141] p-8" style={{boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)"}}>
          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { icon: Users, num: "50", label: "agentes" },
              { icon: Zap, num: "91%", label: "autopilot" },
              { icon: Shield, num: "4.2s", label: "decisión" },
            ].map(({ icon: Icon, num, label }) => (
              <div key={label} className="text-center bg-[#1A1D1D] rounded-xl py-3 px-2 border border-[#3D4141]">
                <p className="text-[18px] font-bold text-white font-mono leading-none mb-0.5">{num}</p>
                <p className="text-[10px] text-[#6B7272] uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#A8AFAF] mb-1.5 uppercase tracking-wide">
                Nombre del operador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-[#3D4141] bg-[#1A1D1D] px-4 py-3 text-[14px] text-white placeholder:text-[#6B7272] outline-none focus:border-[#D7FEFA]/50 focus:ring-1 focus:ring-[#D7FEFA]/10 transition-all"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl bg-[#F6F4D2] text-[#1A1D1D] font-semibold text-[14px] transition-all hover:bg-[#EDEBBF] hover:shadow-[0_4px_20px_rgba(246,244,210,0.25)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Entrar al sistema →
            </button>
          </div>
        </div>

        {/* Firma del autor — elemento de diseño prominente */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#6B7272] uppercase tracking-widest mb-1">Diseñado y construido por</p>
          <p className="text-[15px] font-semibold text-[#A8AFAF]">Leandro Balbián</p>
          <p className="text-[11px] text-[#6B7272] mt-0.5">Product Designer · Portfolio 2025</p>
        </div>
      </div>
    </div>
  );
}
