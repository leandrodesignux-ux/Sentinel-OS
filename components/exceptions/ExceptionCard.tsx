"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, Clock, Flag } from "lucide-react";
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
  sales: { bg: "#EBF8FF", accent: "#2E90FA" },
  asset_mgmt: { bg: "#ECFDF3", accent: "#12B76A" },
  maintenance: { bg: "#FFF7ED", accent: "#F79009" },
  screening: { bg: "#F5F3FF", accent: "#8B5CF6" },
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
  const initials = agent.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  
  const impactLevel = impact > 100 ? "critical" : impact > 50 ? "high" : "medium";
  const impactBadge = {
    critical: { bg: "bg-red-50 text-red-700 border-red-200", label: "Alto riesgo" },
    high: { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Medio riesgo" },
    medium: { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Bajo riesgo" },
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
          className="bg-white rounded-[20px] border border-[var(--bg-border)] shadow-[var(--shadow-card)] p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ backgroundColor: accent.accent }}>
                {initials}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">{agent.name}</p>
                <p className="text-[12px] text-[var(--text-muted)]">{typeLabels[agent.type]}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", impactBadge.bg)}>
              <Flag className="h-3.5 w-3.5" />
              <span>${impact}K · {impactBadge.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-[var(--bg-canvas)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{agent.current_task.description}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--bg-canvas)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)]">
              <Clock className="h-3.5 w-3.5" />
              <span>Hace {Math.max(1, parseInt(agent.id.replace("AGT-", "")) % 11)} min</span>
            </div>
          </div>

          <h3 className="text-[15px] font-semibold text-[#101828] mb-1 leading-snug">
            {agent.current_task.description}
          </h3>
          <p className="text-[13px] text-[#475467] line-clamp-2 mb-4 leading-relaxed">
            {agent.exception_reason ?? "La decisión excede el umbral operativo y requiere revisión humana antes de continuar con la transacción."}
          </p>

          <div className="flex items-center gap-2">
            <button onClick={handleReject} className="flex-1 rounded-xl border border-[var(--bg-border)] py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
              Ver detalle
            </button>
            <button onClick={handleApprove} className="flex-1 rounded-xl bg-[var(--status-nominal)] py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Aprobar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
