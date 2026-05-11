"use client";

import { motion } from "framer-motion";
import { CheckCircle, Code2, Eye, Lightbulb, Users, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    phase: "Descubrimiento del problema",
    icon: Lightbulb,
    color: "#F79009",
    bg: "#FFF7ED",
    border: "#FDE68A",
    title: "Una persona no puede revisar 50 agentes manualmente",
    body: "Las plataformas de agentes de IA existentes muestran todo al mismo tiempo. El operador recibe notificaciones de cada micro-decisión, lo que crea fatiga de alertas y hace imposible escalar. El problema real: ¿cómo decide una persona qué revisar primero cuando hay 50 cosas pasando en paralelo?",
    tags: ["Supervisión por Excepción", "PropTech", "Escala operativa"],
  },
  {
    num: "02",
    phase: "Principio de diseño",
    icon: Eye,
    color: "#2E90FA",
    bg: "#EBF8FF",
    border: "#BDDEFF",
    title: "El sistema trabaja en autopilot — el humano solo decide lo crítico",
    body: "Definí el modelo mental: si el agente tiene confianza alta y bajo riesgo económico, actúa solo. Si tiene confianza baja o el monto involucrado es alto, escala al operador. El dashboard no muestra tareas — muestra excepciones ordenadas por impacto económico. Menos información, mejores decisiones.",
    tags: ["Supervisión por Excepción", "Jerarquía de información", "Mental model"],
  },
  {
    num: "03",
    phase: "Arquitectura de información",
    icon: Users,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    title: "5 secciones, 1 flujo de trabajo",
    body: "Panel principal (estado macro) → Mis agentes (flota en vivo) → Para revisar (cola de excepciones ordenada por impacto) → Historial (auditoría completa de decisiones) → Configuración (control de umbrales y circuit breakers). Cada sección tiene un trabajo específico y no se pisan entre sí.",
    tags: ["IA", "Navegación", "Flujo lineal"],
  },
  {
    num: "04",
    phase: "Construcción con IA",
    icon: Code2,
    color: "#12B76A",
    bg: "#ECFDF3",
    border: "#A9EFC5",
    title: "Vibe coding: del concepto al producto en días",
    body: "Usé Windsurf + Claude Sonnet para construir el stack completo: Next.js 14 App Router, Tailwind CSS, Framer Motion, Zustand, Recharts. El proceso: diseñé la arquitectura de componentes primero, luego pedí implementaciones quirúrgicas por sección. El control del output viene de conocer exactamente qué quieres antes de pedirlo.",
    tags: ["Windsurf", "Claude", "Next.js", "Framer Motion"],
  },
  {
    num: "05",
    phase: "Simulación en tiempo real",
    icon: Zap,
    color: "#F79009",
    bg: "#FFF7ED",
    border: "#FDE68A",
    title: "3 escenarios de crisis demostrables",
    body: "Para que el portfolio se venda solo, construí 3 escenarios activables: un agente con precios incorrectos que propaga errores en cascada, detección de posible discriminación en evaluaciones de inquilinos (flag legal inmediato), y un agente en retry loop gastando presupuesto. Cada escenario muestra una capacidad diferente del sistema.",
    tags: ["Agente con precios incorrectos 💰", "Posible discriminación ⚖️", "Presupuesto de más 💸"],
  },
  {
    num: "06",
    phase: "Resultado",
    icon: CheckCircle,
    color: "#12B76A",
    bg: "#ECFDF3",
    border: "#A9EFC5",
    title: "1 operador · 50 agentes · solo ves lo que importa",
    body: "En menos de 2 minutos cualquier persona — técnica o no — puede entrar, hacer el onboarding, activar un escenario de demo y entender el valor del producto. El dashboard se vende solo sin explicación verbal. Ese era el objetivo.",
    tags: ["Portfolio", "Product Design", "AI-native UX"],
  },
];

const metrics = [
  { num: "50", label: "Agentes supervisados", color: "#2E90FA" },
  { num: "91%", label: "Tareas en autopilot", color: "#12B76A" },
  { num: "4.2s", label: "Tiempo de decisión", color: "#F79009" },
  { num: "3", label: "Escenarios de demo", color: "#8B5CF6" },
];

export function DocsSection() {
  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#98A2B3] mb-2">
          Case study · Portfolio 2025
        </p>
        <h1 className="text-[32px] font-semibold text-[#101828] leading-tight mb-3">
          Cómo construí Sentinel OS
        </h1>
        <p className="text-[15px] text-[#475467] leading-relaxed max-w-xl">
          De un problema real de operaciones con IA a un producto completo usando
          vibe coding. El proceso completo, las decisiones de diseño y lo que aprendí.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#2E90FA]/10 flex items-center justify-center">
            <span className="text-[11px] font-bold text-[#2E90FA]">LB</span>
          </div>
          <p className="text-[13px] text-[#475467]">
            <span className="font-semibold text-[#101828]">Leandro Balbián</span> · Product Designer
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {metrics.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-[16px] border border-[#E4E7EC] p-4 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p className="text-[28px] font-bold font-mono leading-none mb-1" style={{ color: m.color }}>{m.num}</p>
            <p className="text-[11px] text-[#98A2B3] leading-tight">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Separador */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-[#E4E7EC]" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#98A2B3]">El proceso</p>
        <div className="flex-1 h-px bg-[#E4E7EC]" />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((s, i) => {
          const SIcon = s.icon;
          return (
            <motion.div key={s.num}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-white rounded-[20px] border border-[#E4E7EC] p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
                    <SIcon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold font-mono text-[#98A2B3]">{s.num}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>
                      {s.phase}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#101828] mb-2 leading-snug">{s.title}</h3>
                  <p className="text-[13px] text-[#475467] leading-relaxed mb-3">{s.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map((tag) => (
                      <span key={tag} className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center pb-8">
        <div className="inline-flex flex-col items-center gap-2 bg-white rounded-2xl border border-[#E4E7EC] px-8 py-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#98A2B3]">Diseñado y construido por</p>
          <p className="text-[20px] font-semibold text-[#101828]">Leandro Balbián</p>
          <p className="text-[12px] text-[#98A2B3]">Product Designer · 2025</p>
        </div>
      </div>
    </div>
  );
}
