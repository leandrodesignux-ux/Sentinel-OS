"use client";

import { useState } from "react";
import { Building2, Check, Home, Shield, Users, Wrench, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import type { AgentType } from "@/types/agent";

const steps = [
  { id: 1, title: "Configuración de Escudo", subtitle: "Establece tu identidad de operador" },
  { id: 2, title: "Despliegue del Primer Agente", subtitle: "Selecciona y bautiza tu agente" },
  { id: 3, title: "Protocolos de Autonomía", subtitle: "Define el umbral de confianza" },
];

const agentTypes: { id: AgentType; label: string; icon: typeof Building2; desc: string; color: string; bg: string }[] = [
  { id: "sales", label: "Ventas", icon: Building2, desc: "Califica leads y cierra tratos", color: "#6366F1", bg: "#EEF2FF" },
  { id: "asset_mgmt", label: "Activos", icon: Home, desc: "Gestiona propiedades", color: "#10B981", bg: "#ECFDF5" },
  { id: "maintenance", label: "Mantenimiento", icon: Wrench, desc: "Coordinación de órdenes", color: "#F59E0B", bg: "#FFFBEB" },
  { id: "screening", label: "Evaluación", icon: Users, desc: "Screening de inquilinos", color: "#8B5CF6", bg: "#F5F3FF" },
];

function VerticalStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-6">
      {steps.map((s, i) => {
        const isActive = s.id === currentStep;
        const isCompleted = s.id < currentStep;
        return (
          <div key={s.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm"
                animate={{
                  background: isActive ? "#6366F1" : isCompleted ? "#10B981" : "#F1F5F9",
                  color: isActive || isCompleted ? "#FFFFFF" : "#94A3B8",
                }}
                transition={{ duration: 0.3 }}>
                {isCompleted ? <Check className="h-5 w-5" /> : s.id}
              </motion.div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-12 mt-2 rounded-full"
                  style={{ background: isCompleted ? "#10B981" : "#E2E8F0" }} />
              )}
            </div>
            <div className="pt-1.5">
              <p className={`text-sm font-semibold ${isActive ? "text-[#0F172A]" : isCompleted ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
                {s.title}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">{s.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [operatorName, setOperatorName] = useState("");
  const [signature, setSignature] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);
  const [agentName, setAgentName] = useState("");
  const [threshold, setThreshold] = useState(75);

  const updateAgent = useAgentStore((s) => s.updateAgent);
  const agents = useAgentStore((s) => s.agents);

  const handleDeployAgent = () => {
    if (!selectedAgentType || !agentName) return;
    // Actualizar el primer agente del tipo seleccionado
    const targetAgent = agents.find((a) => a.type === selectedAgentType);
    if (targetAgent) {
      updateAgent(targetAgent.id, { name: agentName });
    }
    setStep(3);
  };

  const handleComplete = () => {
    // Actualizar el threshold global
    useAgentStore.setState({ threshold });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* ── PANEL IZQUIERDO (40%) ── */}
      <div className="w-[40%] relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #E2E8F0 100%)",
        }}>
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 50%)",
          }} />
        <div className="relative h-full flex flex-col p-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl bg-[#6366F1] flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Sentinel OS</p>
              <p className="text-[11px] text-[#64748B]">Portfolio · Leandro Balbián</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex-1 flex items-center justify-center">
            <VerticalStepper currentStep={step} />
          </div>

          {/* Footer */}
          <div className="text-[11px] text-[#94A3B8]">
            Paso {step} de 3
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (60%) ── */}
      <div className="w-[60%] bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-10">
          <AnimatePresence mode="wait">
            {/* PASO 1: Configuración de Escudo */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6366F1] mb-2">
                  Paso 1 de 3
                </p>
                <h2 className="text-[28px] font-semibold text-[#0F172A] mb-2">
                  Configuración de Escudo
                </h2>
                <p className="text-[14px] text-[#64748B] mb-8">
                  Establece tu identidad de operador para el sistema de seguridad.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-[#0F172A] mb-2">
                      Nombre del Operador
                    </label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="Ej: Operador Vega"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#0F172A] mb-2">
                      Firma de Seguridad
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Tu código de autorización"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!operatorName || !signature}
                  className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* PASO 2: Despliegue del Primer Agente */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6366F1] mb-2">
                  Paso 2 de 3
                </p>
                <h2 className="text-[28px] font-semibold text-[#0F172A] mb-2">
                  Despliegue del Primer Agente
                </h2>
                <p className="text-[14px] text-[#64748B] mb-6">
                  Selecciona el tipo de agente y asígnale un nombre.
                </p>

                {/* Selector de tipo de agente */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {agentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedAgentType === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => setSelectedAgentType(type.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? "border-[#6366F1] bg-[#EEF2FF]"
                            : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                        }`}
                        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.02)" }}
                      >
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center mb-2"
                          style={{ background: type.bg }}
                        >
                          <Icon className="h-4 w-4" style={{ color: type.color }} />
                        </div>
                        <p className="text-[13px] font-semibold text-[#0F172A]">{type.label}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{type.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Nombre del agente */}
                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-2">
                    Nombre del Agente
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Ej: Marco el de Ventas"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                  />
                </div>

                <button
                  onClick={handleDeployAgent}
                  disabled={!selectedAgentType || !agentName}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Desplegar Agente <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* PASO 3: Protocolos de Autonomía */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6366F1] mb-2">
                  Paso 3 de 3
                </p>
                <h2 className="text-[28px] font-semibold text-[#0F172A] mb-2">
                  Protocolos de Autonomía
                </h2>
                <p className="text-[14px] text-[#64748B] mb-8">
                  Define el umbral de confianza mínimo para que los agentes actúen sin supervisión.
                </p>

                {/* Slider */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-6"
                  style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.02)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-medium text-[#0F172A]">Umbral de Confianza</span>
                    <span className="text-[24px] font-bold font-mono text-[#6366F1]">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#6366F1]"
                    style={{
                      background: `linear-gradient(to right, #6366F1 ${((threshold - 50) / 45) * 100}%, #E2E8F0 ${((threshold - 50) / 45) * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-3 text-[11px] text-[#94A3B8]">
                    <span>50% — Más supervisión</span>
                    <span>95% — Más autonomía</span>
                  </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-[#ECFDF5] rounded-xl p-3 border border-[#A7F3D0]">
                    <p className="text-[11px] font-medium text-[#059669] uppercase tracking-wide mb-1">
                      Por encima de {threshold}%
                    </p>
                    <p className="text-[12px] text-[#0F172A]">El agente actúa automáticamente</p>
                  </div>
                  <div className="bg-[#FEF3C7] rounded-xl p-3 border border-[#FDE68A]">
                    <p className="text-[11px] font-medium text-[#D97706] uppercase tracking-wide mb-1">
                      Por debajo de {threshold}%
                    </p>
                    <p className="text-[12px] text-[#0F172A]">Requiere aprobación humana</p>
                  </div>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#4F46E5]"
                >
                  Iniciar Sentinel OS <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
