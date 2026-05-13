"use client";

import { MousePointerClick, Building2, Home, Users, Wrench, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { StatusPulse } from "@/components/fleet/StatusPulse";
import { ConfidenceSparkline } from "@/components/charts/ConfidenceSparkline";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { useAgentStore } from "@/store/agentStore";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "var(--status-nominal)",
  running: "var(--text-accent)",
  monitoring: "var(--status-warning)",
  intervention_required: "var(--status-critical)",
  circuit_open: "var(--status-critical)",
  suspended: "var(--status-offline)",
};

const TYPE_COLORS: Record<AgentType, string> = {
  sales: "#FBBF24",
  asset_mgmt: "#D7FEFA",
  maintenance: "#F87171",
  screening: "#A78BFA",
};

const TYPE_LABELS: Record<AgentType, string> = {
  sales: "ventas",
  asset_mgmt: "activos",
  maintenance: "mantenimiento",
  screening: "evaluación",
};

const RISK_COLORS: Record<string, string> = {
  low: "#34D399",
  medium: "#FBBF24",
  high: "#F87171",
  critical: "#F87171",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "En espera",
  running: "Trabajando",
  monitoring: "Bajo observación",
  intervention_required: "Necesita atención",
  circuit_open: "Necesita atención",
  suspended: "Pausado",
};

export function AgentDetailPanel({ agent }: { agent: Agent | null }) {
  // Store hooks
  const emergencyHalt = useAgentStore((s) => s.emergencyHalt);
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const approveAgent = useAgentStore((s) => s.approveAgent);
  const selectAgent = useAgentStore((s) => s.selectAgent);

  // Empty state
  if (!agent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-[#1A1D1D] border-l border-[#3D4141]">
        <MousePointerClick className="h-8 w-8 text-[#6B7272] mb-3" />
        <span className="text-sm text-[#A8AFAF]">Selecciona un agente</span>
      </div>
    );
  }

  const confidence = confidencePercent(agent);
  const confidenceStroke = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";

  // Calculate average confidence from history for sparkline color
  const avgHistoryConfidence = agent.confidence_history.length > 0
    ? agent.confidence_history.reduce((a, b) => a + b, 0) / agent.confidence_history.length
    : agent.confidence_score;
  const sparklineColor = avgHistoryConfidence > 0.9 ? "#34D399" : avgHistoryConfidence >= 0.8 ? "#FBBF24" : "#F87171";

  // Check if agent is already paused
  const isPaused = emergencyHalt.affectedAgentIds.includes(agent.id) || agent.status === "suspended";

  // Check if agent requires intervention
  const needsIntervention = agent.status === "intervention_required" || agent.status === "circuit_open";

  return (
    <motion.div
      className="h-full flex flex-col p-4 bg-[#1A1D1D] border-l border-[#3D4141] overflow-y-auto"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* SECTION 1 — Agent Header */}
      <div className="mb-4">
        {/* Name + ID + Type badge */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-white truncate">{agent.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="font-mono text-[10px] text-[#6B7272]"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {agent.id}
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                style={{
                  backgroundColor: TYPE_COLORS[agent.type] + "20",
                  color: TYPE_COLORS[agent.type],
                }}
              >
                {TYPE_LABELS[agent.type]}
              </span>
            </div>
          </div>
          <StatusPulse status={agent.status} />
        </div>

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium mb-2"
          style={{
            backgroundColor: STATUS_COLORS[agent.status] + "20",
            color: STATUS_COLORS[agent.status],
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[agent.status] }}
          />
          {STATUS_LABELS[agent.status]}
        </div>

        {/* Current task */}
        <p className="text-xs text-[#A8AFAF] line-clamp-2">{agent.current_task.description}</p>
      </div>

      {/* SECTION 2 — Key Metrics (2x2 grid) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Confidence */}
        <div className="bg-[#2B2E2E] rounded-lg p-3">
          <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">Confianza</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className="text-xl font-mono font-semibold"
              style={{ color: confidenceStroke }}
            >
              {confidence}
            </span>
            <span className="text-xs text-[#6B7272]">%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-[#3D4141] mt-2">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${confidence}%`, background: confidenceStroke }}
            />
          </div>
        </div>

        {/* Economic Risk */}
        <div className="bg-[#2B2E2E] rounded-lg p-3">
          <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">Riesgo económico</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-semibold text-white">
              ${economicImpactK(agent)}K
            </span>
          </div>
          <span
            className="inline-block mt-2 px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{
              backgroundColor: RISK_COLORS[agent.risk_level] + "20",
              color: RISK_COLORS[agent.risk_level],
            }}
          >
            {agent.risk_level}
          </span>
        </div>

        {/* Task Progress */}
        <div className="bg-[#2B2E2E] rounded-lg p-3">
          <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">Progreso tarea</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-semibold text-white">
              {agent.current_task.progress}
            </span>
            <span className="text-xs text-[#6B7272]">%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-[#3D4141] mt-2">
            <div
              className="h-full rounded-full bg-[#34D399] transition-all"
              style={{ width: `${agent.current_task.progress}%` }}
            />
          </div>
        </div>

        {/* Exceptions Today */}
        <div className="bg-[#2B2E2E] rounded-lg p-3">
          <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">Excepciones hoy</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-semibold text-white">
              {agent.metadata.exceptions_today}
            </span>
          </div>
          <span className="text-[9px] text-[#6B7272] mt-2 block">excepciones hoy</span>
        </div>
      </div>

      {/* SECTION 3 — Confidence History Sparkline */}
      <div className="mb-4">
        <span className="text-[10px] text-[#6B7272] uppercase tracking-wide block mb-2">
          Historial de confianza
        </span>
        <div className="bg-[#2B2E2E] rounded-lg p-3" style={{ color: sparklineColor }}>
          <ConfidenceSparkline agent={agent} />
        </div>
      </div>

      {/* SECTION 4 — Quick Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Pause button */}
        <button
          onClick={() => !isPaused && updateAgent(agent.id, { status: "suspended" })}
          disabled={isPaused}
          className={`w-full py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isPaused
              ? "bg-[#F87171]/5 border-[#F87171]/20 text-[#F87171]/50 cursor-not-allowed"
              : "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171] hover:bg-[#F87171]/20"
          }`}
        >
          {isPaused ? "Ya pausado" : "Pausar agente"}
        </button>

        {/* Approve or Inspect button */}
        {needsIntervention ? (
          <button
            onClick={() => approveAgent(agent.id)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-sm font-medium hover:bg-[#34D399]/20 transition-colors flex items-center justify-center gap-2"
          >
            Aprobar tarea
          </button>
        ) : (
          <button
            onClick={() => selectAgent(agent.id)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#6B7272]/10 border border-[#6B7272]/30 text-[#A8AFAF] text-sm font-medium hover:bg-[#6B7272]/20 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Inspeccionar
          </button>
        )}
      </div>
    </motion.div>
  );
}
