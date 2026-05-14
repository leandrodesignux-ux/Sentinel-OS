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
    color: "#34D399", 
    bg: "rgba(52, 211, 153, 0.1)",
    icon: Clock
  },
  running: { 
    label: "Activo", 
    color: "#34D399", 
    bg: "rgba(52, 211, 153, 0.1)",
    icon: CheckCircle
  },
  monitoring: { 
    label: "Bajo observación", 
    color: "#FBBF24", 
    bg: "rgba(251, 191, 36, 0.1)",
    icon: Activity
  },
  intervention_required: { 
    label: "Requiere atención", 
    color: "#F87171", 
    bg: "rgba(248, 113, 113, 0.1)",
    icon: AlertTriangle
  },
  circuit_open: { 
    label: "Circuito abierto", 
    color: "#F87171", 
    bg: "rgba(248, 113, 113, 0.1)",
    icon: AlertTriangle
  },
  suspended: { 
    label: "Pausado", 
    color: "#6B7272", 
    bg: "rgba(107, 114, 114, 0.1)",
    icon: Pause
  },
};

const RISK_COLORS = {
  low: "#34D399",
  medium: "#FBBF24",
  high: "#F87171",
  critical: "#EF4444",
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

  // Calculate sparkline color based on confidence (using design system colors)
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
              "z-50 overflow-hidden backdrop-blur-xl"
            )}
            style={{
              backgroundColor: 'rgba(17, 20, 20, 0.95)',
              border: '1px solid #3D4141',
              borderRadius: 'var(--radius-card)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid #3D4141' }}>
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(to bottom right, rgba(215, 254, 250, 0.1), rgba(168, 175, 175, 0.05))',
                    border: '1px solid rgba(215, 254, 250, 0.2)',
                    borderRadius: 'var(--radius-inner)'
                  }}
                >
                  <TypeIcon className="w-7 h-7" style={{ color: '#D7FEFA' }} />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="text-sm font-mono"
                      style={{ color: '#6B7272', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {agent.id}
                    </span>
                    <span style={{ color: '#3D4141' }}>·</span>
                    <span className="text-sm" style={{ color: '#A8AFAF' }}>
                      {TYPE_LABELS[agent.type]}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 transition-colors"
                style={{ 
                  borderRadius: 'var(--radius-inner)',
                  '--hover-bg': 'rgba(168, 175, 175, 0.1)'
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 175, 175, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" style={{ color: '#A8AFAF' }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {/* Status Banner */}
              <div 
                className="flex items-center gap-3 px-4 py-3 mb-6"
                style={{ 
                  backgroundColor: status.bg, 
                  borderRadius: 'var(--radius-inner)' 
                }}
              >
                <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
                <span className="font-medium" style={{ color: status.color }}>
                  {status.label}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Confidence */}
                <div 
                  className="p-4"
                  style={{ 
                    backgroundColor: 'rgba(26, 29, 29, 0.4)', 
                    border: '1px solid #3D4141',
                    borderRadius: 'var(--radius-inner)'
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#A8AFAF' }}>Confianza</p>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-2xl font-bold"
                      style={{ 
                        color: confidence > 90 ? '#34D399' : confidence >= 80 ? '#FBBF24' : '#F87171',
                        fontFamily: 'var(--font-jetbrains-mono), monospace'
                      }}
                    >
                      {confidence}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2B2E2E' }}>
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${confidence}%`,
                        background: confidence > 90 ? '#34D399' : confidence >= 80 ? '#FBBF24' : '#F87171',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>

                {/* Risk */}
                <div 
                  className="p-4"
                  style={{ 
                    backgroundColor: 'rgba(26, 29, 29, 0.4)', 
                    border: '1px solid #3D4141',
                    borderRadius: 'var(--radius-inner)'
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#A8AFAF' }}>Riesgo Económico</p>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-2xl font-bold"
                      style={{ 
                        color: RISK_COLORS[agent.risk_level],
                        fontFamily: 'var(--font-jetbrains-mono), monospace'
                      }}
                    >
                      ${risk}K
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#6B7272' }}>{agent.risk_level} risk</p>
                </div>

                {/* Task Progress */}
                <div 
                  className="p-4"
                  style={{ 
                    backgroundColor: 'rgba(26, 29, 29, 0.4)', 
                    border: '1px solid #3D4141',
                    borderRadius: 'var(--radius-inner)'
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#A8AFAF' }}>Progreso</p>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {agent.current_task.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2B2E2E' }}>
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${agent.current_task.progress}%`,
                        backgroundColor: '#D7FEFA',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>

                {/* Exceptions */}
                <div 
                  className="p-4"
                  style={{ 
                    backgroundColor: 'rgba(26, 29, 29, 0.4)', 
                    border: '1px solid #3D4141',
                    borderRadius: 'var(--radius-inner)'
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#A8AFAF' }}>Excepciones Hoy</p>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-2xl font-bold"
                      style={{ 
                        color: agent.metadata.exceptions_today > 0 ? '#F87171' : '#34D399',
                        fontFamily: 'var(--font-jetbrains-mono), monospace'
                      }}
                    >
                      {agent.metadata.exceptions_today}
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#6B7272' }}>
                    {agent.metadata.exceptions_today === 0 ? "Sin incidencias" : "Revisar logs"}
                  </p>
                </div>
              </div>

              {/* Current Task */}
              <div 
                className="p-4 mb-6"
                style={{ 
                  backgroundColor: 'rgba(26, 29, 29, 0.4)', 
                  border: '1px solid #3D4141',
                  borderRadius: 'var(--radius-inner)'
                }}
              >
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#A8AFAF' }}>Tarea Actual</p>
                <p className="text-white">{agent.current_task.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#A8AFAF' }}>
                  <span>Iniciada: {new Date(agent.current_task.started_at).toLocaleString()}</span>
                  <span>·</span>
                  <span>Estimada: {new Date(agent.current_task.estimated_completion).toLocaleString()}</span>
                </div>
              </div>

              {/* Confidence History Sparkline */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#A8AFAF' }}>Historial de Confianza</p>
                <div 
                  className="p-4 h-32"
                  style={{ 
                    backgroundColor: 'rgba(26, 29, 29, 0.4)', 
                    border: '1px solid #3D4141',
                    borderRadius: 'var(--radius-inner)',
                    color: sparklineColor
                  }}
                >
                  <ConfidenceSparkline agent={agent} />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: '#6B7272' }}>Modelo:</span>
                  <span className="ml-2" style={{ color: '#A8AFAF' }}>{agent.metadata.model_version}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7272' }}>Región:</span>
                  <span className="ml-2" style={{ color: '#A8AFAF' }}>{agent.metadata.region}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7272' }}>Tokens usados:</span>
                  <span className="ml-2" style={{ color: '#A8AFAF' }}>{agent.metadata.tokens_used.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7272' }}>Última intervención:</span>
                  <span className="ml-2" style={{ color: '#A8AFAF' }}>{new Date(agent.metadata.last_human_touch).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div 
              className="flex items-center gap-3 p-6"
              style={{ 
                borderTop: '1px solid #3D4141', 
                backgroundColor: 'rgba(26, 29, 29, 0.4)'
              }}
            >
              <button
                onClick={onPauseResume}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all"
                style={{
                  borderRadius: 'var(--radius-inner)',
                  backgroundColor: isPaused ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  color: isPaused ? '#34D399' : '#F87171',
                  border: `1px solid ${isPaused ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
                }}
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
                className="px-6 py-3 font-medium transition-colors hover:bg-white/20"
                style={{ 
                  borderRadius: 'var(--radius-inner)',
                  backgroundColor: 'rgba(168, 175, 175, 0.1)',
                  color: 'white'
                }}
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
