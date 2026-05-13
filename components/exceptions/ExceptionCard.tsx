"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Building2, Home, Users, Wrench } from "lucide-react";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

const typeIcons = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const typeAccentColors = {
  sales:       { bg: "rgba(215,254,250,0.08)", accent: "#D7FEFA" },
  asset_mgmt:  { bg: "rgba(52,211,153,0.08)",  accent: "#34D399" },
  maintenance: { bg: "rgba(251,191,36,0.08)",  accent: "#FBBF24" },
  screening:   { bg: "rgba(167,139,250,0.08)", accent: "#A78BFA" },
};

const typeLabels = {
  sales: "Agente de Ventas",
  asset_mgmt: "Agente de Activos",
  maintenance: "Agente de Mantenimiento",
  screening: "Agente de Evaluación",
};

export function ExceptionCard({ agent, onApprove, onViewDetail }: { agent: Agent; onApprove?: () => void; onViewDetail?: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [approved, setApproved] = useState(false);
  
  const Icon = typeIcons[agent.type];
  const accent = typeAccentColors[agent.type];
  const impact = economicImpactK(agent);
  
  const impactLevel = impact > 100 ? "critical" : impact > 50 ? "high" : "medium";
  const impactBadge = {
    critical: { bg: "bg-red-900/30 text-red-300 border-red-700/40", label: "Alto riesgo" },
    high: { bg: "bg-amber-900/30 text-amber-300 border-amber-700/40", label: "Medio riesgo" },
    medium: { bg: "bg-teal-900/30 text-[#D7FEFA] border-teal-700/40", label: "Bajo riesgo" },
  }[impactLevel];

  const handleApprove = () => {
    setApproved(true);
    setIsExiting(true);
    setTimeout(() => {
      onApprove?.();
    }, 150);
  };

  const handleReject = () => {
    setApproved(false);
    setIsExiting(true);
    setTimeout(() => {
      onViewDetail?.();
    }, 150);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: approved ? 40 : -40 }}
          transition={{ duration: 0.15 }}
          className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] shadow-[var(--shadow-card)] p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: accent.bg, color: accent.accent }}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-white">{agent.name}</p>
                <p className="text-[12px] text-[#A8AFAF]">{typeLabels[agent.type]}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", impactBadge.bg)}>
              <span className="text-white font-semibold">${impact}K</span>
              <span>· {impactBadge.label}</span>
            </div>
          </div>

          <div className="h-px bg-[#3D4141] my-4" />

          <h3 className="text-[15px] font-semibold text-white mb-1 leading-snug">
            {agent.current_task.description}
          </h3>
          <p className="text-[13px] text-[#A8AFAF] line-clamp-2 mb-4 leading-relaxed">
            {agent.exception_reason ?? "La decisión excede el umbral operativo y requiere revisión humana antes de continuar con la transacción."}
          </p>

          <div className="flex items-center gap-2">
            <button onClick={handleReject} className="flex-1 rounded-xl bg-[#2B2E2E] border border-[#3D4141] py-2 text-sm text-[#A8AFAF] hover:bg-[#333737] hover:text-white transition-colors">
              Revisar detalle
            </button>
            <button onClick={handleApprove} className="flex-1 rounded-xl bg-[#F6F4D2] py-2 text-sm font-semibold text-[#1A1D1D] hover:bg-[#EDEBBF] transition-colors flex items-center justify-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Aprobar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
