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
      style={{ background: "linear-gradient(145deg, #E8EDE8 0%, #EDF0EC 40%, #F0F3EF 100%)" }}
    >
      {/* Dashboard preview blur en el fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.07]">
        <div className="w-[900px] h-[600px] rounded-3xl bg-white border border-black/10 flex gap-0 overflow-hidden">
          <div className="w-[200px] h-full bg-white border-r border-black/10 flex flex-col gap-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-black/10" style={{width: `${60 + i * 8}%`}} />
            ))}
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-black/8 border border-black/5" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-black/8 border border-black/5" />
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
            <div className="h-10 w-10 rounded-2xl bg-[#2E90FA] flex items-center justify-center shadow-lg shadow-blue-200">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-[22px] font-semibold text-[#101828] tracking-tight">Sentinel OS</span>
          </div>
          <p className="text-[14px] text-[#475467] leading-relaxed">
            Una persona supervisando 50 agentes de IA.<br />
            Solo ves lo que importa.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] border border-[#E4E7EC] p-8" style={{boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)"}}>
          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { icon: Users, num: "50", label: "agentes" },
              { icon: Zap, num: "91%", label: "autopilot" },
              { icon: Shield, num: "4.2s", label: "decisión" },
            ].map(({ icon: Icon, num, label }) => (
              <div key={label} className="text-center bg-[#F8F9FC] rounded-xl py-3 px-2 border border-[#E4E7EC]/60">
                <p className="text-[18px] font-bold text-[#101828] font-mono leading-none mb-0.5">{num}</p>
                <p className="text-[10px] text-[#98A2B3] uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-[#475467] mb-1.5 uppercase tracking-wide">
                Nombre del operador
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-[#E4E7EC] bg-[#F8F9FC] px-4 py-3 text-[14px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#2E90FA] focus:bg-white focus:ring-2 focus:ring-[#2E90FA]/10 transition-all"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl bg-[#2E90FA] text-white font-semibold text-[14px] transition-all hover:bg-[#1a7ee8] hover:shadow-lg hover:shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Entrar al sistema →
            </button>
          </div>
        </div>

        {/* Firma del autor — elemento de diseño prominente */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#98A2B3] uppercase tracking-widest mb-1">Diseñado y construido por</p>
          <p className="text-[15px] font-semibold text-[#475467]">Leandro Balbián</p>
          <p className="text-[11px] text-[#98A2B3] mt-0.5">Product Designer · Portfolio 2025</p>
        </div>
      </div>
    </div>
  );
}
