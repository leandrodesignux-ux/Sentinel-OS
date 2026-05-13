"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, Check, Home, Shield, Users, Wrench, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import type { AgentType } from "@/types/agent";

// Custom hook for typewriter effect
function useTypewriter(
  value: string,
  onComplete: () => void,
  delay: number = 800,
  charInterval: number = 45
) {
  const [displayValue, setDisplayValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const userInteracted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (userInteracted.current) return;
    
    timeoutRef.current = setTimeout(() => {
      if (userInteracted.current) return;
      
      setIsTyping(true);
      let currentIndex = 0;
      
      intervalRef.current = setInterval(() => {
        if (userInteracted.current) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsTyping(false);
          return;
        }
        
        if (currentIndex <= value.length) {
          setDisplayValue(value.slice(0, currentIndex));
          currentIndex++;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsTyping(false);
          onComplete();
        }
      }, charInterval);
    }, delay);
  }, [value, delay, charInterval, onComplete]);

  const cancelTyping = useCallback(() => {
    userInteracted.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { displayValue, isTyping, startTyping, cancelTyping, userInteracted };
}

const steps = [
  { id: 1, title: "Configuración de Escudo", subtitle: "Establece tu identidad de operador" },
  { id: 2, title: "Despliegue del Primer Agente", subtitle: "Selecciona y bautiza tu agente" },
  { id: 3, title: "Protocolos de Autonomía", subtitle: "Define el umbral de confianza" },
];

const agentTypes: { id: AgentType; label: string; icon: typeof Building2; desc: string; color: string; bg: string }[] = [
  { id: "sales", label: "Ventas", icon: Building2, desc: "Califica leads y cierra tratos", color: "var(--accent-teal)", bg: "rgba(215, 254, 250, 0.1)" },
  { id: "asset_mgmt", label: "Activos", icon: Home, desc: "Gestiona propiedades", color: "var(--status-nominal)", bg: "rgba(52, 211, 153, 0.1)" },
  { id: "maintenance", label: "Mantenimiento", icon: Wrench, desc: "Coordinación de órdenes", color: "var(--status-warning)", bg: "rgba(251, 191, 36, 0.1)" },
  { id: "screening", label: "Evaluación", icon: Users, desc: "Screening de inquilinos", color: "var(--accent-teal)", bg: "rgba(215, 254, 250, 0.08)" },
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
                  background: isActive ? "var(--brand)" : isCompleted ? "var(--status-nominal)" : "var(--bg-elevated)",
                  color: isActive ? "var(--brand-text)" : isCompleted ? "#FFFFFF" : "var(--text-muted)",
                }}
                transition={{ duration: 0.3 }}>
                {isCompleted ? <Check className="h-5 w-5" /> : s.id}
              </motion.div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-12 mt-2 rounded-full"
                  style={{ background: isCompleted ? "var(--status-nominal)" : "var(--bg-border)" }} />
              )}
            </div>
            <div className="pt-1.5">
              <p className={`text-sm font-semibold ${isActive ? "text-[var(--text-primary)]" : isCompleted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                {s.title}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{s.subtitle}</p>
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
  const [threshold, setThreshold] = useState(50);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [ctaReady, setCtaReady] = useState(false);

  const updateAgent = useAgentStore((s) => s.updateAgent);
  const agents = useAgentStore((s) => s.agents);

  // Typewriter for Step 1 - Operator Name
  const {
    displayValue: operatorNameTyped,
    isTyping: isTypingOperator,
    startTyping: startOperatorTyping,
    cancelTyping: cancelOperatorTyping,
    userInteracted: operatorInteracted,
  } = useTypewriter("Operador Vega", () => {
    // Start signature typing 300ms after operator name completes
    setTimeout(() => startSignatureTyping(), 300);
  }, 800, 45);

  // Typewriter for Step 1 - Signature
  const {
    displayValue: signatureTyped,
    isTyping: isTypingSignature,
    startTyping: startSignatureTyping,
    cancelTyping: cancelSignatureTyping,
    userInteracted: signatureInteracted,
  } = useTypewriter("SOS-7734-ALPHA", () => {
    // CTA animation ready
    setCtaReady(true);
  }, 0, 45);

  // Typewriter for Step 2 - Agent Name
  const {
    displayValue: agentNameTyped,
    isTyping: isTypingAgent,
    startTyping: startAgentTyping,
    cancelTyping: cancelAgentTyping,
    userInteracted: agentInteracted,
  } = useTypewriter("Marco el de Ventas", () => {
    setCtaReady(true);
  }, 800, 45);

  // Effect for Step 1 typing
  useEffect(() => {
    if (step === 1) {
      setCtaReady(false);
      const timer = setTimeout(() => {
        startOperatorTyping();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, startOperatorTyping]);

  // Effect for Step 2 - auto select sales card then type
  useEffect(() => {
    if (step === 2) {
      setCtaReady(false);
      // Flash highlight on sales card after 600ms
      const highlightTimer = setTimeout(() => {
        setHighlightedCard("sales");
        setSelectedAgentType("sales");
        // Remove highlight after flash
        setTimeout(() => setHighlightedCard(null), 400);
        // Start typing after selection
        setTimeout(() => startAgentTyping(), 400);
      }, 600);
      return () => clearTimeout(highlightTimer);
    }
  }, [step, startAgentTyping]);

  // Effect for Step 3 - animate slider from 50 to 75
  useEffect(() => {
    if (step === 3) {
      setCtaReady(false);
      setThreshold(50);
      const startTime = performance.now();
      const duration = 1200;
      const startValue = 50;
      const endValue = 75;

      const animateSlider = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);
        setThreshold(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateSlider);
        } else {
          setCtaReady(true);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(animateSlider);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Update actual state with typed values
  useEffect(() => {
    if (step === 1 && !operatorInteracted.current) {
      setOperatorName(operatorNameTyped);
    }
  }, [operatorNameTyped, step]);

  useEffect(() => {
    if (step === 1 && !signatureInteracted.current) {
      setSignature(signatureTyped);
    }
  }, [signatureTyped, step]);

  useEffect(() => {
    if (step === 2 && !agentInteracted.current) {
      setAgentName(agentNameTyped);
    }
  }, [agentNameTyped, step]);

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
    <div className="fixed inset-0 z-50 flex" style={{ background: "var(--bg-canvas)" }}>
      {/* ── PANEL IZQUIERDO (40%) ── */}
      <div className="w-[40%] relative overflow-hidden"
        style={{
          background: "var(--bg-void)",
        }}>
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at top left, rgba(215, 254, 250, 0.08) 0%, transparent 50%)",
          }} />
        <div className="relative h-full flex flex-col p-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <Shield className="h-5 w-5" style={{ color: "var(--brand-text)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sentinel OS</p>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Portfolio · Leandro Balbián</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex-1 flex items-center justify-center">
            <VerticalStepper currentStep={step} />
          </div>

          {/* Footer */}
          <div className="text-[11px]" style={{ color: "var(--accent-teal)" }}>
            Paso {step} de 3
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (60%) ── */}
      <div className="w-[60%] flex flex-col" style={{ background: "var(--bg-canvas)" }}>
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
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-teal)" }}>
                  Paso 1 de 3
                </p>
                <h2 className="text-[28px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Configuración de Escudo
                </h2>
                <p className="text-[14px] mb-8" style={{ color: "var(--text-secondary)" }}>
                  Establece tu identidad de operador para el sistema de seguridad.
                </p>

                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                      Nombre del Operador
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => {
                          cancelOperatorTyping();
                          setOperatorName(e.target.value);
                        }}
                        placeholder="Ej: Operador Vega"
                        className={`w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-all ${isTypingOperator ? 'typing-cursor' : ''}`}
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--bg-border)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => {
                          cancelOperatorTyping();
                          e.target.style.borderColor = "var(--accent-teal)";
                          e.target.style.boxShadow = "0 0 0 1px var(--accent-teal)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--bg-border)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                      Firma de Seguridad
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signature}
                        onChange={(e) => {
                          cancelSignatureTyping();
                          setSignature(e.target.value);
                        }}
                        placeholder="Tu código de autorización"
                        className={`w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-all ${isTypingSignature ? 'typing-cursor' : ''}`}
                        style={{
                          background: "var(--bg-surface)",
                          borderColor: "var(--bg-border)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => {
                          cancelSignatureTyping();
                          e.target.style.borderColor = "var(--accent-teal)";
                          e.target.style.boxShadow = "0 0 0 1px var(--accent-teal)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--bg-border)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => setStep(2)}
                  disabled={!operatorName || !signature}
                  initial={{ scale: 0.97, opacity: 0.5 }}
                  animate={{
                    scale: ctaReady && operatorName && signature ? 1 : 0.97,
                    opacity: ctaReady && operatorName && signature ? 1 : 0.5,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--brand)",
                    color: "var(--brand-text)",
                  }}
                  onMouseEnter={(e) => {
                    if (!(!operatorName || !signature)) {
                      e.currentTarget.style.background = "var(--brand-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--brand)";
                  }}
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </motion.button>
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
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-teal)" }}>
                  Paso 2 de 3
                </p>
                <h2 className="text-[28px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Despliegue del Primer Agente
                </h2>
                <p className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>
                  Selecciona el tipo de agente y asígnale un nombre.
                </p>

                {/* Selector de tipo de agente */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {agentTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedAgentType === type.id;
                    const isHighlighted = highlightedCard === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => setSelectedAgentType(type.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={isHighlighted ? {
                          boxShadow: [
                            "0 0 0 0 rgba(215, 254, 250, 0)",
                            "0 0 0 4px rgba(215, 254, 250, 0.5)",
                            "0 0 0 0 rgba(215, 254, 250, 0)",
                          ],
                        } : {}}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-start p-4 rounded-xl border transition-all text-left"
                        style={{
                          background: isSelected ? "var(--bg-surface)" : "var(--bg-surface)",
                          borderColor: isSelected ? "var(--accent-teal)" : "var(--bg-border)",
                          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.02)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "var(--bg-hover)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg-surface)";
                        }}
                      >
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center mb-2"
                          style={{ background: type.bg }}
                        >
                          <Icon className="h-4 w-4" style={{ color: type.color }} />
                        </div>
                        <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{type.label}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{type.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Nombre del agente */}
                <div className="relative">
                  <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Nombre del Agente
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => {
                        cancelAgentTyping();
                        setAgentName(e.target.value);
                      }}
                      placeholder="Ej: Marco el de Ventas"
                      className={`w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-all ${isTypingAgent ? 'typing-cursor' : ''}`}
                      style={{
                        background: "var(--bg-surface)",
                        borderColor: "var(--bg-border)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => {
                        cancelAgentTyping();
                        e.target.style.borderColor = "var(--accent-teal)";
                        e.target.style.boxShadow = "0 0 0 1px var(--accent-teal)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--bg-border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleDeployAgent}
                  disabled={!selectedAgentType || !agentName}
                  initial={{ scale: 0.97, opacity: 0.5 }}
                  animate={{
                    scale: ctaReady && selectedAgentType && agentName ? 1 : 0.97,
                    opacity: ctaReady && selectedAgentType && agentName ? 1 : 0.5,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--brand)",
                    color: "var(--brand-text)",
                  }}
                  onMouseEnter={(e) => {
                    if (!(!selectedAgentType || !agentName)) {
                      e.currentTarget.style.background = "var(--brand-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--brand)";
                  }}
                >
                  Desplegar Agente <ChevronRight className="h-4 w-4" />
                </motion.button>
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
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent-teal)" }}>
                  Paso 3 de 3
                </p>
                <h2 className="text-[28px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Protocolos de Autonomía
                </h2>
                <p className="text-[14px] mb-8" style={{ color: "var(--text-secondary)" }}>
                  Define el umbral de confianza mínimo para que los agentes actúen sin supervisión.
                </p>

                {/* Slider */}
                <div className="rounded-2xl border p-6 mb-6"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--bg-border)",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.02)",
                  }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>Umbral de Confianza</span>
                    <span className="text-[24px] font-bold font-mono" style={{ color: "var(--brand)" }}>{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--brand) ${((threshold - 50) / 45) * 100}%, var(--bg-border) ${((threshold - 50) / 45) * 100}%)`,
                      accentColor: "var(--brand)",
                    }}
                  />
                  <div className="flex justify-between mt-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                    <span>50% — Más supervisión</span>
                    <span>95% — Más autonomía</span>
                  </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="rounded-xl p-3 border" style={{ background: "rgba(52, 211, 153, 0.15)", borderColor: "rgba(52, 211, 153, 0.3)" }}>
                    <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--status-nominal)" }}>
                      Por encima de {threshold}%
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>El agente actúa automáticamente</p>
                  </div>
                  <div className="rounded-xl p-3 border" style={{ background: "rgba(251, 191, 36, 0.15)", borderColor: "rgba(251, 191, 36, 0.3)" }}>
                    <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--status-warning)" }}>
                      Por debajo de {threshold}%
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>Requiere aprobación humana</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleComplete}
                  initial={{ scale: 0.97, opacity: 0.5 }}
                  animate={{
                    scale: ctaReady ? 1 : 0.97,
                    opacity: ctaReady ? 1 : 0.5,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold transition-all"
                  style={{
                    background: "var(--brand)",
                    color: "var(--brand-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--brand-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--brand)";
                  }}
                >
                  Iniciar Sentinel OS <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Blinking cursor CSS */}
      <style jsx global>{`
        .typing-cursor {
          position: relative;
        }
        .typing-cursor::after {
          content: '|';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--accent-teal);
          font-weight: 300;
          animation: blink 0.7s step-end infinite;
          pointer-events: none;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
