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

const TYPE_COLORS: Record<AgentType, string> = {
  sales: "#FBBF24",
  asset_mgmt: "#60A5FA",
  maintenance: "#F87171",
  screening: "#A78BFA",
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
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    dot: "bg-emerald-400"
  },
  running: { 
    label: "Activo", 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    dot: "bg-emerald-400"
  },
  monitoring: { 
    label: "Observación", 
    color: "text-amber-400", 
    bg: "bg-amber-400/10",
    dot: "bg-amber-400"
  },
  intervention_required: { 
    label: "Alerta", 
    color: "text-rose-400", 
    bg: "bg-rose-400/10",
    dot: "bg-rose-400"
  },
  circuit_open: { 
    label: "Alerta", 
    color: "text-rose-400", 
    bg: "bg-rose-400/10",
    dot: "bg-rose-400"
  },
  suspended: { 
    label: "Pausado", 
    color: "text-slate-400", 
    bg: "bg-slate-400/10",
    dot: "bg-slate-400"
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
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Confianza
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Riesgo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tarea Actual
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                    "border-b border-white/5 hover:bg-white/5 transition-colors",
                    isExpanded && "bg-white/5"
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-400">
                      {agent.id.replace('AGT-', '#')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{agent.name}</span>
                      <button
                        onClick={() => toggleExpand(agent.id)}
                        className="p-1 rounded hover:bg-white/10 transition-colors lg:hidden"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: TYPE_COLORS[agent.type] + "20",
                        color: TYPE_COLORS[agent.type],
                      }}
                    >
                      {TYPE_LABELS[agent.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.bg,
                      status.color
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-mono font-medium",
                        confidence > 90 ? "text-emerald-400" : 
                        confidence >= 80 ? "text-amber-400" : "text-rose-400"
                      )}>
                        {confidence}%
                      </span>
                      <div className="flex items-center text-xs">
                        {trendPositive ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-rose-400" />
                        )}
                        <span className={trendPositive ? "text-emerald-400" : "text-rose-400"}>
                          {Math.abs(trend * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "font-mono font-medium",
                      risk > 50 ? "text-rose-400" : risk > 25 ? "text-amber-400" : "text-emerald-400"
                    )}>
                      ${risk}K
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-300 truncate max-w-[200px]">
                      {agent.current_task.description}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onRowClick(agent)}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPauseResume(agent.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isPaused 
                            ? "hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400"
                            : "hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        )}
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
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-lg">No hay agentes disponibles</p>
          <p className="text-sm mt-2">Los agentes aparecerán aquí cuando estén activos</p>
        </div>
      )}
    </div>
  );
}
