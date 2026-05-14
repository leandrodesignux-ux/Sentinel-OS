"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Building2, 
  Home, 
  Users, 
  Wrench,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play
} from "lucide-react";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { ConfidenceSparkline } from "@/components/charts/ConfidenceSparkline";
import { cn } from "@/lib/utils";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

const TYPE_ICONS: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const TYPE_LABELS: Record<AgentType, string> = {
  sales: "Agente de Ventas",
  asset_mgmt: "Gestión de Activos",
  maintenance: "Mantenimiento",
  screening: "Evaluación",
};

const STATUS_CONFIG: Record<AgentStatus, { 
  label: string; 
  color: string; 
  bg: string;
  icon: typeof CheckCircle;
}> = {
  idle: { 
    label: "En espera", 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    icon: Clock
  },
  running: { 
    label: "Activo", 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    icon: CheckCircle
  },
  monitoring: { 
    label: "Bajo observación", 
    color: "text-amber-400", 
    bg: "bg-amber-400/10",
    icon: Activity
  },
  intervention_required: { 
    label: "Requiere atención", 
    color: "text-rose-400", 
    bg: "bg-rose-400/10",
    icon: AlertTriangle
  },
  circuit_open: { 
    label: "Circuito abierto", 
    color: "text-rose-400", 
    bg: "bg-rose-400/10",
    icon: AlertTriangle
  },
  suspended: { 
    label: "Pausado", 
    color: "text-slate-400", 
    bg: "bg-slate-400/10",
    icon: Pause
  },
};

const RISK_COLORS = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
  critical: "text-rose-500",
};

interface AgentModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onPauseResume: () => Promise<void>;
}

export function AgentModal({ agent, isOpen, onClose, onPauseResume }: AgentModalProps) {
  if (!agent) return null;

  const confidence = confidencePercent(agent);
  const risk = economicImpactK(agent);
  const status = STATUS_CONFIG[agent.status];
  const TypeIcon = TYPE_ICONS[agent.type];
  const StatusIcon = status.icon;
  const isPaused = agent.status === "suspended";

  // Calculate sparkline color based on confidence
  const sparklineColor = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              "md:w-full md:max-w-2xl md:max-h-[85vh]",
              "z-50 overflow-hidden",
              "bg-slate-900/95 backdrop-blur-xl border border-white/10",
              "rounded-2xl shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
                  "border border-white/10"
                )}>
                  <TypeIcon className="w-7 h-7 text-indigo-400" />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-400 font-mono">
                      {agent.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-sm text-slate-400">
                      {TYPE_LABELS[agent.type]}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {/* Status Banner */}
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl mb-6",
                status.bg
              )}>
                <StatusIcon className={cn("w-5 h-5", status.color)} />
                <span className={cn("font-medium", status.color)}>
                  {status.label}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Confidence */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Confianza</p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      confidence > 90 ? "text-emerald-400" : 
                      confidence >= 80 ? "text-amber-400" : "text-rose-400"
                    )}>
                      {confidence}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${confidence}%`,
                        background: confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171"
                      }}
                    />
                  </div>
                </div>

                {/* Risk */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Riesgo Económico</p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold", RISK_COLORS[agent.risk_level])}>
                      ${risk}K
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{agent.risk_level} risk</p>
                </div>

                {/* Task Progress */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Progreso</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {agent.current_task.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-400 transition-all"
                      style={{ width: `${agent.current_task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Exceptions */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Excepciones Hoy</p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      agent.metadata.exceptions_today > 0 ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {agent.metadata.exceptions_today}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {agent.metadata.exceptions_today === 0 ? "Sin incidencias" : "Revisar logs"}
                  </p>
                </div>
              </div>

              {/* Current Task */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Tarea Actual</p>
                <p className="text-white">{agent.current_task.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span>Iniciada: {new Date(agent.current_task.started_at).toLocaleString()}</span>
                  <span>·</span>
                  <span>Estimada: {new Date(agent.current_task.estimated_completion).toLocaleString()}</span>
                </div>
              </div>

              {/* Confidence History Sparkline */}
              <div className="mb-6">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Historial de Confianza</p>
                <div 
                  className="bg-white/5 rounded-xl p-4 border border-white/10 h-32"
                  style={{ color: sparklineColor }}
                >
                  <ConfidenceSparkline agent={agent} />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Modelo:</span>
                  <span className="text-slate-300 ml-2">{agent.metadata.model_version}</span>
                </div>
                <div>
                  <span className="text-slate-500">Región:</span>
                  <span className="text-slate-300 ml-2">{agent.metadata.region}</span>
                </div>
                <div>
                  <span className="text-slate-500">Tokens usados:</span>
                  <span className="text-slate-300 ml-2">{agent.metadata.tokens_used.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Última intervención:</span>
                  <span className="text-slate-300 ml-2">{new Date(agent.metadata.last_human_touch).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 p-6 border-t border-white/10 bg-white/5">
              <button
                onClick={onPauseResume}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all",
                  isPaused 
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                )}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Reanudar Agente
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pausar Agente
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
