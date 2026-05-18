"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, Check, Home, Users, Wrench, ChevronRight, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import type { AgentType } from "@/types/agent";
import { SentinelLogo } from "@/components/brand/SentinelLogo";

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
  const hasStarted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Mantiene la referencia actualizada sin añadirla a deps de useCallback
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const startTyping = useCallback(() => {
    // Guardia: solo ejecuta una vez por montaje
    if (userInteracted.current || hasStarted.current) return;
    hasStarted.current = true;

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
          onCompleteRef.current();
        }
      }, charInterval);
    }, delay);
  }, [value, delay, charInterval]); // onComplete ya NO está en deps

  const cancelTyping = useCallback(() => {
    userInteracted.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTyping(false);
  }, []);

  // Reset hasStarted cuando cambia el value (al cambiar de step)
  useEffect(() => {
    hasStarted.current = false;
    userInteracted.current = false;
    setDisplayValue("");
  }, [value]);

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

// Rich CTA Button Component
function StepButton({
  step,
  isReady,
  isLoading,
  isComplete,
  onClick,
  showSuccess: showSuccessProp,
}: {
  step: number;
  isReady: boolean;
  isLoading: boolean;
  isComplete: boolean;
  onClick: () => void;
  showSuccess?: boolean;
}) {
  const [hasPulsed, setHasPulsed] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);

  useEffect(() => {
    if (isReady && !hasPulsed) {
      setHasPulsed(true);
      setShowShimmer(true);
      setTimeout(() => setShowShimmer(false), 600);
    }
  }, [isReady, hasPulsed]);

  const buttonText = {
    1: "Continuar →",
    2: "Desplegar Agente →",
    3: "Iniciar Sentinel OS →",
  }[step];

  const idleText = "Completa los campos";

  // IDLE state
  if (!isComplete) {
    return (
      <motion.button
        disabled
        className="mt-4 md:mt-8 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold cursor-not-allowed"
        style={{
          background: "var(--bg-elevated)",
          color: "var(--text-muted)",
          opacity: 0.45,
        }}
      >
        <Lock className="h-4 w-4" />
        {idleText}
      </motion.button>
    );
  }

  // Step 3 with success state
  if (step === 3 && showSuccessProp) {
    return (
      <motion.button
        className="mt-4 md:mt-8 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold"
        style={{
          background: "var(--status-nominal)",
          color: "#FFFFFF",
        }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 0.95, 1] }}
        transition={{ duration: 0.3 }}
      >
        <Check className="h-4 w-4" />
        Sistema Iniciado
      </motion.button>
    );
  }

  // READY / LOADING states
  return (
    <div className="relative mt-4 md:mt-8">
      <motion.button
        onClick={onClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-semibold transition-all overflow-hidden relative"
        style={{
          background: "var(--brand)",
          color: "var(--brand-text)",
          boxShadow: step === 3 ? "0 0 30px rgba(246,244,210,0.3)" : undefined,
        }}
        initial={{ scale: 0.97, opacity: 0.5 }}
        animate={{
          scale: isLoading ? 0.98 : isReady ? [1, 1.04, 1] : 0.97,
          opacity: isLoading ? 0.8 : isReady ? 1 : 0.5,
        }}
        transition={{
          scale: isReady && !isLoading ? { duration: 0.4, times: [0, 0.5, 1] } : { type: "spring", stiffness: 300, damping: 20 },
          opacity: { duration: 0.2 },
        }}
        whileHover={!isLoading ? { backgroundColor: "var(--brand-hover)" } : {}}
      >
        {isLoading ? (
          <>
            <span
              className="h-4 w-4 rounded-full border-2"
              style={{
                borderColor: "rgba(26, 29, 29, 0.3)",
                borderTopColor: "var(--brand-text)",
              }}
            >
              <motion.span
                className="block h-full w-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTop: "2px solid var(--brand-text)",
                  margin: "-2px",
                }}
              />
            </span>
            <span className="ml-2">Procesando...</span>
          </>
        ) : (
          buttonText
        )}

        {/* Shimmer effect */}
        {showShimmer && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            }}
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 400, opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}
      </motion.button>
    </div>
  );
}

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
                className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm relative overflow-hidden"
                animate={{
                  background: isActive ? "var(--brand)" : isCompleted ? "var(--status-nominal)" : "var(--bg-elevated)",
                  color: isActive ? "var(--brand-text)" : isCompleted ? "#FFFFFF" : "var(--text-muted)",
                }}
                transition={{ duration: 0.3 }}>
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ scale: 0, rotate: 90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -90 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {s.id}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-12 mt-2 rounded-full relative overflow-hidden" style={{ background: "var(--bg-border)" }}>
                  <motion.div
                    className="absolute inset-0 origin-top"
                    style={{ background: "var(--status-nominal)" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: isCompleted ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
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
  const [step, setStep] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [operatorName, setOperatorName] = useState("");
  const [signature, setSignature] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);
  const [agentName, setAgentName] = useState("");
  const [threshold, setThreshold] = useState(50);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [ctaReady, setCtaReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    if (!selectedAgentType || !agentName || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      // Actualizar el primer agente del tipo seleccionado
      const targetAgent = agents.find((a) => a.type === selectedAgentType);
      if (targetAgent) {
        updateAgent(targetAgent.id, { name: agentName });
      }
      setIsLoading(false);
      setStep(3);
    }, 600);
  };

  const handleComplete = () => {
    if (isLoading) return;
    setIsLoading(true);
    setShowSuccess(true);
    setTimeout(() => {
      // Actualizar el threshold global
      useAgentStore.setState({ threshold });
      onComplete();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50" style={{ background: "var(--bg-canvas)" }}>
      <AnimatePresence mode="wait">
        {/* STEP 0: Intro Screen */}
        {step === 0 && (
          <motion.div
            key="intro"
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{
              background: "var(--bg-void)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundBlendMode: "overlay",
            }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Orb 1 - Top Right */}
              <motion.div
                className="absolute rounded-full blur-3xl"
                style={{
                  top: "10%",
                  right: "10%",
                  width: 600,
                  height: 600,
                  background: "radial-gradient(circle, rgba(215,254,250,0.06) 0%, transparent 70%)",
                }}
                animate={{
                  y: [-20, 20],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              {/* Orb 2 - Bottom Left */}
              <motion.div
                className="absolute rounded-full blur-3xl"
                style={{
                  bottom: "10%",
                  left: "10%",
                  width: 500,
                  height: 500,
                  background: "radial-gradient(circle, rgba(246,244,210,0.05) 0%, transparent 70%)",
                }}
                animate={{
                  y: [20, -20],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              {/* Orb 3 - Center */}
              <motion.div
                className="absolute rounded-full blur-3xl"
                style={{
                  top: "50%",
                  left: "50%",
                  width: 800,
                  height: 800,
                  x: "-50%",
                  y: "-50%",
                  background: "radial-gradient(circle, rgba(52,211,153,0.03) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [0.9, 1.1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Isotipo with hover animation */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                  delay: 0.2,
                }}
                className="mb-8"
              >
                <SentinelLogo variant="isotipo" size="lg" hoverAnimation priority />
              </motion.div>

              {/* Wordmark */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
                className="mb-8"
              >
                <SentinelLogo variant="wordmark" isotipoWidth={220} priority />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="mb-10 text-center"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "15px",
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.8 }}
              >
                Sistema de supervisión autónoma de agentes
              </motion.p>

              {/* CTA Button */}
              <motion.button
                className="flex items-center gap-2 font-semibold"
                style={{
                  background: "var(--brand)",
                  color: "var(--brand-text)",
                  padding: "14px 36px",
                  borderRadius: "12px",
                  fontSize: "15px",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1.0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(1)}
              >
                Comenzar
                <ChevronRight className="h-4 w-4" style={{ width: "16px", height: "16px" }} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEPS 1-3: Split Layout */}
        {step >= 1 && (
          <motion.div
            key="split-layout"
            className="fixed inset-0 flex flex-col md:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── PANEL IZQUIERDO (40%) ── */}
            <motion.div
              className="hidden md:flex md:w-[40%] relative overflow-hidden flex-col"
              style={{ background: "var(--bg-void)" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Animated orb */}
              <motion.div
                className="absolute rounded-full pointer-events-none blur-3xl"
                animate={{
                  top: step === 1 ? "20%" : step === 2 ? "40%" : "60%",
                  left: step === 1 ? "10%" : step === 2 ? "30%" : "20%",
                  width: step === 1 ? 400 : step === 2 ? 500 : 450,
                  height: step === 1 ? 400 : step === 2 ? 500 : 450,
                  background: step === 1 
                    ? "rgba(215, 254, 250, 0.04)" 
                    : step === 2 
                      ? "rgba(246, 244, 210, 0.04)" 
                      : "rgba(52, 211, 153, 0.05)",
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 opacity-30"
                style={{
                  background: "radial-gradient(ellipse at top left, rgba(215, 254, 250, 0.08) 0%, transparent 50%)",
                }} />
              <div className="relative h-full flex flex-col p-10">
                {/* Header */}
                <div className="mb-12">
                  <SentinelLogo variant="full" size="xs" hoverAnimation={true} />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Portfolio · Leandro Balbián
                  </p>
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
            </motion.div>

            {/* ── PANEL DERECHO (60%) ── */}
            <motion.div
              className="w-full md:w-[60%] flex flex-col"
              style={{ background: "var(--bg-canvas)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Mobile progress header — visible only on mobile */}
              <div className="flex md:hidden items-center justify-between px-6 pt-6 pb-4 border-b border-[#3D4141]">
                <SentinelLogo variant="isotipo" size="sm" />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#D7FEFA] bg-[#2B2E2E] px-3 py-1 rounded-full font-medium">
                    Paso {step} de 3
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                          s <= step ? "bg-[#34D399]" : "bg-[#3D4141]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content area for steps 1-3 */}
              <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <AnimatePresence mode="wait">
            {/* PASO 1: Configuración de Escudo */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 60, filter: "blur(4px)", scale: 1.02 }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, x: -60, filter: "blur(4px)", scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md"
              >
                <motion.p 
                  className="text-[11px] font-semibold uppercase tracking-widest mb-2" 
                  style={{ color: "var(--accent-teal)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Paso 1 de 3
                </motion.p>
                <motion.h2 
                  className="text-[22px] md:text-[28px] font-semibold mb-2" 
                  style={{ color: "var(--text-primary)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Configuración de Escudo
                </motion.h2>
                <motion.p 
                  className="text-[14px] mb-8" 
                  style={{ color: "var(--text-secondary)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Establece tu identidad de operador para el sistema de seguridad.
                </motion.p>

                <div className="space-y-5">
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 * 0.08, duration: 0.35, ease: "easeOut" }}
                  >
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
                  </motion.div>
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4 * 0.08, duration: 0.35, ease: "easeOut" }}
                  >
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
                  </motion.div>
                </div>

                <StepButton
                  step={1}
                  isReady={!!operatorName && !!signature}
                  isLoading={isLoading}
                  isComplete={!!operatorName && !!signature}
                  onClick={() => {
                    if (!operatorName || !signature || isLoading) return;
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      setStep(2);
                    }, 600);
                  }}
                />
              </motion.div>
            )}

            {/* PASO 2: Despliegue del Primer Agente */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 60, filter: "blur(4px)", scale: 1.02 }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, x: -60, filter: "blur(4px)", scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md"
              >
                <motion.p 
                  className="text-[11px] font-semibold uppercase tracking-widest mb-2" 
                  style={{ color: "var(--accent-teal)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Paso 2 de 3
                </motion.p>
                <motion.h2 
                  className="text-[22px] md:text-[28px] font-semibold mb-2" 
                  style={{ color: "var(--text-primary)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Despliegue del Primer Agente
                </motion.h2>
                <motion.p 
                  className="text-[14px] mb-6" 
                  style={{ color: "var(--text-secondary)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Selecciona el tipo de agente y asígnale un nombre.
                </motion.p>

                {/* Selector de tipo de agente */}
                <motion.div 
                  className="grid grid-cols-2 gap-2 md:gap-3 mb-5"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  {agentTypes.map((type, index) => {
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
                        className="flex flex-col items-start p-3 md:p-4 rounded-xl border transition-all text-left"
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
                          className="h-8 w-8 md:h-9 md:w-9 rounded-lg flex items-center justify-center mb-1.5 md:mb-2"
                          style={{ background: type.bg }}
                        >
                          <Icon className="h-4 w-4" style={{ color: type.color }} />
                        </div>
                        <p className="text-[12px] md:text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{type.label}</p>
                        <p className="text-[10px] md:text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{type.desc}</p>
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Nombre del agente */}
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
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
                </motion.div>

                <StepButton
                  step={2}
                  isReady={!!selectedAgentType && !!agentName}
                  isLoading={isLoading}
                  isComplete={!!selectedAgentType && !!agentName}
                  onClick={handleDeployAgent}
                />
              </motion.div>
            )}

            {/* PASO 3: Protocolos de Autonomía */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 60, filter: "blur(4px)", scale: 1.02 }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, x: -60, filter: "blur(4px)", scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md"
              >
                <motion.p 
                  className="text-[11px] font-semibold uppercase tracking-widest mb-2" 
                  style={{ color: "var(--accent-teal)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Paso 3 de 3
                </motion.p>
                <motion.h2 
                  className="text-[22px] md:text-[28px] font-semibold mb-2" 
                  style={{ color: "var(--text-primary)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Protocolos de Autonomía
                </motion.h2>
                <motion.p 
                  className="text-[14px] mb-8" 
                  style={{ color: "var(--text-secondary)" }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  Define el umbral de confianza mínimo para que los agentes actúen sin supervisión.
                </motion.p>

                {/* Slider */}
                <motion.div 
                  className="rounded-2xl border p-4 md:p-6 mb-4 md:mb-6"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--bg-border)",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.02)",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
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
                    <span className="flex flex-col"><span className="font-mono">50%</span><span>Más supervisión</span></span>
                    <span className="flex flex-col items-end"><span className="font-mono">95%</span><span>Más autonomía</span></span>
                  </div>
                </motion.div>

                {/* Info cards */}
                <motion.div 
                  className="grid grid-cols-2 gap-2 mb-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4 * 0.08, duration: 0.35, ease: "easeOut" }}
                >
                  <div className="rounded-xl p-2.5 md:p-3 border" style={{ background: "rgba(52, 211, 153, 0.15)", borderColor: "rgba(52, 211, 153, 0.3)" }}>
                    <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--status-nominal)" }}>
                      Por encima de {threshold}%
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>El agente actúa automáticamente</p>
                  </div>
                  <div className="rounded-xl p-2.5 md:p-3 border" style={{ background: "rgba(251, 191, 36, 0.15)", borderColor: "rgba(251, 191, 36, 0.3)" }}>
                    <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--status-warning)" }}>
                      Por debajo de {threshold}%
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-primary)" }}>Requiere aprobación humana</p>
                  </div>
                </motion.div>

                <StepButton
                  step={3}
                  isReady={ctaReady}
                  isLoading={isLoading}
                  isComplete={true}
                  showSuccess={showSuccess}
                  onClick={handleComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
