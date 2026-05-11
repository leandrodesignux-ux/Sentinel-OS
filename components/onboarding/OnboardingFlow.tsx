"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Map, Shield, Zap, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const agentGroups = [
  { label: "20 Agentes de Ventas", sub: "Calificando leads en tiempo real", color: "#2E90FA", bg: "#EBF8FF", count: 20 },
  { label: "15 Agentes de Activos", sub: "Monitoreando portafolio", color: "#12B76A", bg: "#ECFDF3", count: 15 },
  { label: "10 Agentes de Mantenimiento", sub: "Coordinando órdenes de trabajo", color: "#F79009", bg: "#FFF7ED", count: 10 },
  { label: "5 Agentes de Evaluación", sub: "Revisando solicitudes de inquilinos", color: "#8B5CF6", bg: "#F5F3FF", count: 5 },
];

const features = [
  { icon: Zap, title: "Piloto automático", desc: "91% de las tareas sin interrumpirte", color: "#2E90FA", bg: "#EBF8FF" },
  { icon: Map, title: "Flota en vivo", desc: "50 agentes visibles de un vistazo", color: "#12B76A", bg: "#ECFDF3" },
  { icon: Bell, title: "Solo lo urgente", desc: "Alertas ordenadas por impacto económico", color: "#F79009", bg: "#FFF7ED" },
  { icon: Shield, title: "Control total", desc: "Pausa o detén agentes al instante", color: "#8B5CF6", bg: "#F5F3FF" },
];

function Dots({ active }: { active: number }) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 rounded-full transition-all duration-400"
          style={{ width: active === i ? 28 : 6, background: active === i ? "#2E90FA" : "#D0D5DD" }} />
      ))}
    </div>
  );
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([]);
  const [counter, setCounter] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 2800);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      // Aparece cada agente con delay
      agentGroups.forEach((_, i) => {
        setTimeout(() => setLoaded((prev) => [...prev, i]), i * 500 + 200);
      });
      // Counter sube de 0 a 50
      let n = 0;
      intervalRef.current = setInterval(() => {
        n += 2;
        setCounter(Math.min(n, 50));
        if (n >= 50) clearInterval(intervalRef.current!);
      }, 60);
      const t = setTimeout(() => setStep(2), 3200);
      return () => { clearTimeout(t); clearInterval(intervalRef.current!); };
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(236,240,234,0.92)", backdropFilter: "blur(12px)" }}>
      <AnimatePresence mode="wait">

        {/* PASO 0 — Bienvenida */}
        {step === 0 && (
          <motion.div key="s0"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-lg">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="h-16 w-16 rounded-[20px] bg-[#2E90FA] flex items-center justify-center mb-6 shadow-xl"
              style={{ boxShadow: "0 8px 32px rgba(46,144,250,0.35)" }}>
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#98A2B3] mb-2">Portfolio · Leandro Balbián</p>
            <h1 className="text-[32px] font-semibold text-[#101828] leading-tight tracking-tight mb-3">
              Bienvenido a<br />Sentinel OS
            </h1>
            <p className="text-[15px] text-[#475467] leading-relaxed">
              Una persona. Cincuenta agentes de IA trabajando en paralelo.<br />
              Solo ves las decisiones que importan.
            </p>
            <Dots active={0} />
          </motion.div>
        )}

        {/* PASO 1 — Carga de agentes */}
        {step === 1 && (
          <motion.div key="s1"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center w-full max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#98A2B3] mb-2">Iniciando flota</p>
            <h2 className="text-[24px] font-semibold text-[#101828] mb-6 text-center">
              Conectando tus agentes de IA
            </h2>
            <div className="w-full space-y-3 mb-6">
              {agentGroups.map((g, i) => (
                <AnimatePresence key={g.label}>
                  {loaded.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: -16, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-[#E4E7EC]"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: g.bg }}>
                        <Check className="h-4 w-4" style={{ color: g.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#101828]">{g.label}</p>
                        <p className="text-[11px] text-[#98A2B3]">{g.sub}</p>
                      </div>
                      <span className="text-[11px] font-mono font-bold" style={{ color: g.color }}>{g.count}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>
            {/* Barra + contador */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[12px] text-[#98A2B3]">Agentes activos</p>
                <p className="text-[13px] font-mono font-bold text-[#2E90FA]">{counter} / 50</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E4E7EC] overflow-hidden">
                <motion.div className="h-full rounded-full bg-[#2E90FA]"
                  animate={{ width: `${(counter / 50) * 100}%` }}
                  transition={{ duration: 0.1 }} />
              </div>
            </div>
            <Dots active={1} />
          </motion.div>
        )}

        {/* PASO 2 — Panel listo con feature grid */}
        {step === 2 && (
          <motion.div key="s2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-xl w-full">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              className="h-12 w-12 rounded-2xl bg-[#ECFDF3] flex items-center justify-center mb-5"
              style={{ border: "1.5px solid #D1FADF" }}>
              <Check className="h-6 w-6 text-[#12B76A]" />
            </motion.div>
            <h2 className="text-[26px] font-semibold text-[#101828] mb-2">Tu panel está listo</h2>
            <p className="text-[14px] text-[#475467] mb-7">
              50 agentes activos · solo ves lo que requiere tu criterio
            </p>
            <div className="grid grid-cols-2 gap-3 w-full mb-7 text-left">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="rounded-2xl bg-white border border-[#E4E7EC] p-4"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: f.bg }}>
                      <Icon className="h-4 w-4" style={{ color: f.color }} />
                    </div>
                    <p className="text-[13px] font-semibold text-[#101828] mb-0.5">{f.title}</p>
                    <p className="text-[12px] text-[#98A2B3] leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
            <button onClick={onComplete}
              className="flex items-center gap-2 rounded-xl bg-[#2E90FA] px-7 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#1a7ee8] mb-3"
              style={{ boxShadow: "0 4px 16px rgba(46,144,250,0.3)" }}>
              Explorar el dashboard <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onComplete} className="text-[12px] text-[#98A2B3] hover:text-[#475467] transition-colors">
              Saltar intro
            </button>
            <Dots active={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
