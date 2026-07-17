"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Copy, Check, FileCode, Settings, Activity, ExternalLink } from "lucide-react";

const tools = [
  { name: "Figma", subtext: "Design System & Prototipado HF" },
  { name: "Windsurf / Cursor", subtext: "Vibe Coding · Arquitectura de componentes" },
  { name: "React (Next.js)", subtext: "Lógica de estados del sistema" },
  { name: "Framer Motion", subtext: "Micro-interacciones · Latencia perceptual" },
  { name: "Microsoft Clarity", subtext: "Análisis de comportamiento (simulado)" },
];

const processes = [
  {
    title: "Diseño de Gobernanza IA",
    body: "Establecimiento de protocolos de 'Confidence Thresholds' para determinar cuándo la IA actúa sola y cuándo requiere intervención humana (HITL).",
  },
  {
    title: "Arquitectura de Linaje",
    body: "Creación de flujos visuales que permiten auditar el raciocinio de la IA en menos de 5 segundos, eliminando el problema de la 'caja negra'.",
  },
  {
    title: "Calibrated Friction",
    body: "Implementación de patrones de interacción de alta seguridad para acciones críticas (movimientos financieros de agentes), evitando errores accidentales.",
  },
];

const impact = [
  {
    title: "Reducción de Cost-to-Serve",
    subtitle: "Ratio 1:1 → 1:50",
    body: "Optimización del ratio de supervisión permitiendo que un solo operador gestione toda una flota de agentes.",
  },
  {
    title: "Mitigación de Riesgo en Cascada",
    subtitle: "Circuit Breakers visuales",
    body: "Implementación de Circuit Breakers que detienen procesos ante anomalías detectadas, protegiendo los activos de la empresa.",
  },
  {
    title: "Eficiencia de Decisión",
    subtitle: "Escaneo rápido · excepciones priorizadas",
    body: "Reducción de la carga cognitiva mediante filtrado de 'ruido', mostrando solo las excepciones que requieren juicio humano real.",
  },
];

function DocsSectionInner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("leandrodesign.ux@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail if clipboard is not available
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-2">
      {/* HERO BLOCK */}
      <div className="bg-[#2B2E2E] rounded-2xl p-8 mb-6 border border-[#3D4141]">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="flex-1">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase bg-[#D7FEFA]/10 text-[#D7FEFA] border border-[#D7FEFA]/20 rounded-full px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" />
              DOCUMENTATIONVIEW
            </span>

            {/* Title */}
            <h1
              className="font-bold mt-3 leading-tight"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#FFFFFF" }}
            >
              Leandro Balbian
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-[#A8AFAF] mt-2 leading-relaxed">
              AI Product Architect | Design Intelligence Systems · SaaS PropTech & FinTech | Data-Driven UX · Agentes IA
            </p>

            {/* Hook text */}
            <p className="text-sm text-[#A8AFAF] leading-relaxed mt-4 max-w-lg">
              ¿Cómo escalas una operación con 50 agentes de IA sin perder el control ni aumentar el riesgo operativo?
              Sentinel OS es una auditoría de diseño aplicada a la Gobernanza de IA, demostrando cómo la supervisión
              por excepción y el diseño de &apos;linaje de decisión&apos; pueden reducir el Cost-to-Serve en entornos
              empresariales complejos.
            </p>
          </div>

          {/* RIGHT COLUMN - Contact Card */}
          <div className="w-full lg:w-72 flex-shrink-0 bg-[#1A1D1D] rounded-xl border border-[#3D4141] p-5">
            <p className="text-[10px] uppercase tracking-widest text-[#6B7272] mb-3">CONTACTO</p>

            {/* Email row */}
            <div className="flex items-center justify-between bg-[#2B2E2E] rounded-lg px-3 py-2.5">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-[#A8AFAF]">leandrodesign.ux@gmail.com</span>
                <span className="text-[9px] text-[#6B7272]">Click para copiar</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-[#6B7272] hover:text-[#D7FEFA] transition-colors cursor-pointer p-1"
                aria-label="Copiar email"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#34D399]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* LinkedIn button */}
            <button
              onClick={() => window.open("https://www.linkedin.com/in/leodisenofreelance/", "_blank")}
              className="mt-3 w-full bg-[#D7FEFA] hover:bg-[#C5F0EC] text-[#1A1D1D] font-semibold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LINKEDIN
            </button>

            {/* Portfolio button */}
            <a
              href="https://leandrobalbian.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full bg-[#F6F4D2] hover:bg-[#EDEBBF] text-[#1A1D1D] font-semibold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              PORTFOLIO
            </a>

            {/* Availability badge */}
            <div className="mt-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-lg px-3 py-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#34D399] leading-snug">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" />
                Disponible para consultoría estratégica en Sistemas de IA y SaaS Senior.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE COLUMNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* COLUMN A: TOOLS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0 }}
          className="bg-[#2B2E2E] rounded-2xl border border-[#3D4141] p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#6B7272]">HERRAMIENTAS</span>
            <div className="bg-[#D7FEFA]/10 p-1.5 rounded-lg">
              <FileCode className="h-[18px] w-[18px] text-[#D7FEFA]" />
            </div>
          </div>

          {/* Tool list */}
          <div className="space-y-2">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#1A1D1D] rounded-lg px-3 py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-[#FFFFFF]">{tool.name}</span>
                  <span className="text-[10px] text-[#6B7272]">{tool.subtext}</span>
                </div>
                <span className="text-[9px] text-[#6B7272] bg-[#3D4141] px-2 py-0.5 rounded-full">
                  tool
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* COLUMN B: PROCESSES */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          className="bg-[#2B2E2E] rounded-2xl border border-[#3D4141] p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#6B7272]">PROCESOS</span>
            <div className="bg-[#D7FEFA]/10 p-1.5 rounded-lg">
              <Settings className="h-[18px] w-[18px] text-[#D7FEFA]" />
            </div>
          </div>

          {/* Process list */}
          <div className="space-y-0">
            {processes.map((process, i) => (
              <div
                key={i}
                className={`py-2 ${i < processes.length - 1 ? "border-b border-[#3D4141]/60" : ""}`}
              >
                <h3 className="text-sm font-medium text-[#FFFFFF]">{process.title}</h3>
                <p className="text-[11px] text-[#A8AFAF] leading-relaxed mt-1">{process.body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* COLUMN C: IMPACT */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.16 }}
          className="bg-[#2B2E2E] rounded-2xl border border-[#3D4141] p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest text-[#6B7272]">IMPACTO</span>
            <div className="bg-[#D7FEFA]/10 p-1.5 rounded-lg">
              <Activity className="h-[18px] w-[18px] text-[#D7FEFA]" />
            </div>
          </div>

          {/* Impact list */}
          <div className="space-y-0">
            {impact.map((item, i) => (
              <div
                key={i}
                className={`py-2 ${i < impact.length - 1 ? "border-b border-[#3D4141]/60" : ""}`}
              >
                <h3 className="text-sm font-medium text-[#FFFFFF]">{item.title}</h3>
                <span className="text-[10px] text-[#6B7272] font-mono">{item.subtitle}</span>
                <p className="text-[11px] text-[#A8AFAF] leading-relaxed mt-1">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export const DocsSection = memo(DocsSectionInner);
