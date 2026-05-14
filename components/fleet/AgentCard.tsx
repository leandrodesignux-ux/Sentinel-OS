"use client";

import { Building2, Home, Users, Wrench, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

const typeIcons = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const typeLabels: Record<string, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mant.",
  screening: "Eval.",
};

const typeColors: Record<string, string> = {
  sales: "#FBBF24",
  asset_mgmt: "#D7FEFA",
  maintenance: "#F87171",
  screening: "#A78BFA",
};

const statusColors: Record<string, string> = {
  idle: "#34D399",
  running: "#34D399",
  monitoring: "#FBBF24",
  intervention_required: "#F87171",
  circuit_open: "#F87171",
  suspended: "#6B7272",
};

const statusLabels: Record<string, string> = {
  idle: "En espera",
  running: "Trabajando",
  monitoring: "Observando",
  intervention_required: "Necesita atención",
  circuit_open: "Necesita atención",
  suspended: "Pausado",
};

function MiniSparkline({ history, color }: { history: number[]; color: string }) {
  const points = history.slice(-12);
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 0.01;
  const w = 80;
  const h = 28;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

export function AgentCard({ agent, index = 0 }: { agent: Agent; index?: number }) {
  const confidence = confidencePercent(agent);
  const impact = economicImpactK(agent);
  const selectAgent = useAgentStore((s) => s.selectAgent);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const emergencyHalt = useAgentStore((s) => s.emergencyHalt);

  const isSelected = selectedAgentId === agent.id;
  const isHalted = emergencyHalt.active && emergencyHalt.affectedAgentIds.includes(agent.id);
  const isAlert = agent.status === "intervention_required" || agent.status === "circuit_open";

  const Icon = typeIcons[agent.type];
  const accentColor = typeColors[agent.type];
  const statusColor = statusColors[agent.status];
  const confidenceColor = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";

  // Trend: compare last vs first of history
  const hist = agent.confidence_history;
  const trend = hist.length >= 2 ? hist[hist.length - 1] - hist[0] : 0;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isHalted ? 0.4 : 1, y: 0, filter: isHalted ? "grayscale(1)" : "none" }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={() => selectAgent(agent.id)}
      className="relative w-full text-left rounded-[20px] border bg-white p-5 flex flex-col gap-3 transition-shadow duration-200 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)]"
      style={{
        borderColor: isSelected ? accentColor : isAlert ? "#F87171" : "#E5E7EB",
        boxShadow: isSelected ? `0 0 0 2px ${accentColor}30` : undefined,
      }}
    >
      {/* TOP ROW — Icon badge + Type label + Status dot */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {/* Icon badge */}
          <div
            className="h-10 w-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accentColor + "18" }}
          >
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-tight">{agent.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{typeLabels[agent.type]}</p>
          </div>
        </div>
        {/* Status dot */}
        <span
          className="h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
      </div>

      {/* MAIN METRIC — Confidence */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Confianza</p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-[28px] font-bold leading-none"
              style={{ color: confidenceColor, fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {confidence}
            </span>
            <span className="text-[13px] text-gray-400">%</span>
            {trend !== 0 && (
              <span
                className="flex items-center gap-0.5 text-[11px] ml-1"
                style={{ color: trend > 0 ? "#34D399" : "#F87171" }}
              >
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(Math.round(trend * 100))}%
              </span>
            )}
          </div>
        </div>
        {/* Mini sparkline */}
        <MiniSparkline history={agent.confidence_history} color={confidenceColor} />
      </div>

      {/* CONFIDENCE BAR */}
      <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${confidence}%`, background: confidenceColor }}
        />
      </div>

      {/* BOTTOM ROW — Economic risk + Status label */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Riesgo económico</p>
          <p className="text-[13px] font-semibold text-gray-800 mt-0.5">${impact}K</p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{ backgroundColor: statusColor + "18", color: statusColor }}
        >
          {statusLabels[agent.status]}
        </span>
      </div>

      {/* ID badge */}
      <span
        className="absolute top-3 right-3 font-mono text-[9px] text-gray-300"
        style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        {agent.id.replace("AGT-", "#")}
      </span>
    </motion.button>
  );
}
