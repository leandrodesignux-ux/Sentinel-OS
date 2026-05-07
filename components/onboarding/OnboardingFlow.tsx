"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Command, LayoutDashboard, Map, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const agentItems = [
  "20 agentes de ventas — calificando leads",
  "15 agentes de activos — monitoreando portafolio",
  "10 agentes de mantenimiento — coordinando órdenes",
  "5 agentes de evaluación — revisando solicitudes",
];

const features = [
  {
    icon: LayoutDashboard,
    title: "Resumen en tiempo real",
    description: "Ve cuántos agentes trabajan y cuánto dinero protegen",
    color: "var(--status-accent)",
    bg: "rgba(46, 144, 250, 0.1)",
  },
  {
    icon: Map,
    title: "Mapa de tu flota",
    description: "Monitorea 50 agentes de un vistazo",
    color: "var(--status-nominal)",
    bg: "rgba(18, 183, 106, 0.1)",
  },
  {
    icon: Bell,
    title: "Alertas que importan",
    description: "Solo ves lo que necesita tu decisión — nada más",
    color: "var(--status-warning)",
    bg: "rgba(247, 144, 9, 0.12)",
  },
  {
    icon: Shield,
    title: "Control total",
    description: "Pausa, ajusta o detén agentes con un click",
    color: "var(--status-accent)",
    bg: "rgba(46, 144, 250, 0.1)",
  },
];

function ProgressDots({ activeStep }: { activeStep: number }) {
  return (
    <div className="mt-6 flex justify-center gap-2">
      {[0, 1, 2].map((step) => (
        <span
          key={step}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            activeStep === step ? "w-7 bg-[var(--status-accent)]" : "w-2 bg-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0) {
      const timeout = setTimeout(() => setStep(1), 3000);
      return () => clearTimeout(timeout);
    }

    if (step === 1) {
      const timeout = setTimeout(() => setStep(2), 2500);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 px-6 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--status-accent)] text-white shadow-card"
            >
              <Command className="h-7 w-7" />
            </motion.div>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">Bienvenido a Sentinel OS</h1>
            <p className="mt-2 max-w-md text-center text-gray-500">
              La plataforma que permite a una sola persona supervisar 50 asistentes de IA trabajando en paralelo para tu empresa inmobiliaria.
            </p>
            <ProgressDots activeStep={0} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            <p className="text-sm uppercase tracking-widest text-gray-400">Conectando agentes de IA</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Iniciando tu flota de trabajo</h2>
            <div className="mt-7 space-y-3 text-left">
              {agentItems.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.4, duration: 0.35 }}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.4 + 0.15, type: "spring", bounce: 0.4 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--status-nominal)] text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.span>
                  <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 h-1.5 w-64 rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[var(--status-accent)]"
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 2 }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">50 / 50 agentes activos</p>
            <ProgressDots activeStep={1} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="flex max-w-2xl flex-col items-center text-center"
          >
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Tu panel de control está listo</h2>
            <p className="mt-2 max-w-xl text-gray-500">
              Aquí puedes supervisar todo lo que hacen tus agentes sin revisar cada tarea — solo las que necesitan tu criterio.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4 text-left">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="rounded-2xl border border-[var(--bg-border)] bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: feature.bg }}>
                      <Icon className="h-5 w-5" style={{ color: feature.color }} />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{feature.description}</p>
                  </div>
                );
              })}
            </div>
            <button onClick={onComplete} className="mt-8 rounded-xl bg-[var(--status-accent)] px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:shadow-card-hover">
              Explorar el dashboard →
            </button>
            <button onClick={onComplete} className="mt-3 text-xs text-gray-400 transition hover:text-gray-600">
              Saltar onboarding
            </button>
            <ProgressDots activeStep={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
