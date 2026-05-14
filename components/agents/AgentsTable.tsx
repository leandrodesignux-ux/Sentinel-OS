"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  Pause, 
  Play, 
  ChevronDown, 
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { cn } from "@/lib/utils";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

const TYPE_COLORS: Record<AgentType, { bg: string; text: string }> = {
  sales: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  asset_mgmt: { bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA" },
  maintenance: { bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
  screening: { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA" },
};

const TYPE_LABELS: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mant.",
  screening: "Eval.",
};

const STATUS_CONFIG: Record<AgentStatus, { 
  label: string; 
  color: string; 
  bg: string;
  dot: string;
}> = {
  idle: { 
    label: "En espera", 
    color: "#34D399", 
    bg: "rgba(52, 211, 153, 0.1)",
    dot: "#34D399"
  },
  running: { 
    label: "Activo", 
    color: "#34D399", 
    bg: "rgba(52, 211, 153, 0.1)",
    dot: "#34D399"
  },
  monitoring: { 
    label: "Observación", 
    color: "#FBBF24", 
    bg: "rgba(251, 191, 36, 0.1)",
    dot: "#FBBF24"
  },
  intervention_required: { 
    label: "Alerta", 
    color: "#F87171", 
    bg: "rgba(248, 113, 113, 0.1)",
    dot: "#F87171"
  },
  circuit_open: { 
    label: "Alerta", 
    color: "#F87171", 
    bg: "rgba(248, 113, 113, 0.1)",
    dot: "#F87171"
  },
  suspended: { 
    label: "Pausado", 
    color: "#6B7272", 
    bg: "rgba(107, 114, 114, 0.1)",
    dot: "#6B7272"
  },
};

interface AgentsTableProps {
  agents: Agent[];
  onRowClick: (agent: Agent) => void;
  onPauseResume: (agentId: string) => Promise<void>;
}

export function AgentsTable({ agents, onRowClick, onPauseResume }: AgentsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (agentId: string) => {
    setExpandedId(expandedId === agentId ? null : agentId);
  };

  return (
    <div 
      className="bg-[#1A1D1D] border border-[#3D4141] rounded-[20px] overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#2B2E2E] border-b border-[#3D4141]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Confianza
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Riesgo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Tarea Actual
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7272' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => {
              const confidence = confidencePercent(agent);
              const risk = economicImpactK(agent);
              const status = STATUS_CONFIG[agent.status];
              const isExpanded = expandedId === agent.id;
              const isPaused = agent.status === "suspended";
              
              // Calculate trend based on confidence history
              const history = agent.confidence_history;
              const trend = history.length > 1 
                ? history[history.length - 1] - history[0]
                : 0;
              const trendPositive = trend > 0;

              return (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "border-b border-[#3D4141] hover:bg-[#2B2E2E] transition-colors",
                    isExpanded && "bg-[#2B2E2E]"
                  )}
                >
                  <td className="px-4 py-3">
                    <span 
                      className="font-mono text-sm"
                      style={{ color: '#6B7272', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {agent.id.replace('AGT-', '#')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{agent.name}</span>
                      <button
                        onClick={() => toggleExpand(agent.id)}
                        className="p-1 hover:bg-white/10 transition-colors lg:hidden"
                        style={{ borderRadius: 'var(--radius-inner)' }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" style={{ color: '#A8AFAF' }} />
                        ) : (
                          <ChevronDown className="w-4 h-4" style={{ color: '#A8AFAF' }} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: TYPE_COLORS[agent.type].bg,
                        color: TYPE_COLORS[agent.type].text,
                        borderRadius: 'var(--radius-inner)'
                      }}
                    >
                      {TYPE_LABELS[agent.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: status.bg,
                        color: status.color,
                        borderRadius: '9999px'
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: status.dot }}
                      />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-medium"
                        style={{ 
                          color: confidence > 90 ? '#34D399' : confidence >= 80 ? '#FBBF24' : '#F87171',
                          fontFamily: 'var(--font-jetbrains-mono), monospace'
                        }}
                      >
                        {confidence}%
                      </span>
                      <div className="flex items-center text-xs">
                        {trendPositive ? (
                          <ArrowUpRight className="w-3 h-3" style={{ color: '#34D399' }} />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" style={{ color: '#F87171' }} />
                        )}
                        <span style={{ color: trendPositive ? '#34D399' : '#F87171' }}>
                          {Math.abs(trend * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className="font-medium"
                      style={{ 
                        color: risk > 50 ? '#F87171' : risk > 25 ? '#FBBF24' : '#34D399',
                        fontFamily: 'var(--font-jetbrains-mono), monospace'
                      }}
                    >
                      ${risk}K
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p 
                      className="text-sm truncate max-w-[200px]"
                      style={{ color: '#A8AFAF' }}
                    >
                      {agent.current_task.description}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onRowClick(agent)}
                        className="p-2 text-[#6B7272] hover:text-white hover:bg-[#2B2E2E] transition-colors"
                        style={{ borderRadius: 'var(--radius-inner)' }}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPauseResume(agent.id)}
                        className={cn(
                          "p-2 transition-colors",
                          isPaused
                            ? "text-[#6B7272] hover:text-[#34D399] hover:bg-[rgba(52,211,153,0.1)]"
                            : "text-[#6B7272] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)]"
                        )}
                        style={{ borderRadius: 'var(--radius-inner)' }}
                        title={isPaused ? "Reanudar" : "Pausar"}
                      >
                        {isPaused ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12" style={{ color: '#6B7272' }}>
          <p className="text-lg">No hay agentes disponibles</p>
          <p className="text-sm mt-2">Los agentes aparecerán aquí cuando estén activos</p>
        </div>
      )}
    </div>
  );
}
