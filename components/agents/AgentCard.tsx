"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Home, 
  Users, 
  Wrench, 
  MoreVertical, 
  Play, 
  Pause,
  Activity,
  Settings,
  FileText,
  Loader2
} from "lucide-react";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { cn } from "@/lib/utils";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

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
    label: "Error", 
    color: "text-rose-400", 
    bg: "bg-rose-400/10",
    dot: "bg-rose-400"
  },
  circuit_open: { 
    label: "Error", 
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

const TYPE_ICONS: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const TYPE_LABELS: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mantenimiento",
  screening: "Evaluación",
};

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  onPauseResume: () => Promise<void>;
}

// Circular progress component for confidence
function ConfidenceRing({ 
  percentage, 
  color 
}: { 
  percentage: number; 
  color: string;
}) {
  const radius = 28;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg]"
      >
        <circle
          stroke="rgba(255,255,255,0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-sm font-semibold text-white">
        {percentage}%
      </span>
    </div>
  );
}

export function AgentCard({ agent, onClick, onPauseResume }: AgentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const confidence = confidencePercent(agent);
  const risk = economicImpactK(agent);
  const isPaused = agent.status === "suspended";
  const status = STATUS_CONFIG[agent.status];
  const TypeIcon = TYPE_ICONS[agent.type];
  
  const confidenceColor = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";

  const handlePauseResume = async () => {
    setIsLoading(true);
    try {
      await onPauseResume();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative group rounded-2xl p-5 cursor-pointer",
        "bg-white/5 backdrop-blur-md border border-white/10",
        "shadow-lg hover:shadow-xl hover:shadow-indigo-500/10",
        "transition-all duration-300",
        isPaused && "opacity-60 grayscale"
      )}
      onClick={onClick}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Header: Icon + Menu */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
              "border border-white/10"
            )}
          >
            <TypeIcon className="w-6 h-6 text-indigo-400" />
          </div>
          
          <div>
            <h3 className="font-semibold text-white text-sm truncate max-w-[140px]">
              {agent.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {agent.id.replace('AGT-', '#')}
            </p>
          </div>
        </div>

        {/* Kebab Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "absolute right-0 top-full mt-1 w-48 z-50",
                  "bg-slate-800/95 backdrop-blur-md border border-white/10",
                  "rounded-xl shadow-xl overflow-hidden"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver tarea actual
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Ajustar confianza
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Verificar estado
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="relative flex items-center gap-2 mb-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          status.bg,
          status.color
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Metrics: Confidence Ring + Risk */}
      <div className="relative flex items-center justify-between mb-4">
        <ConfidenceRing percentage={confidence} color={confidenceColor} />
        
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-1">Riesgo asociado</p>
          <p className={cn(
            "text-lg font-semibold",
            risk > 50 ? "text-rose-400" : risk > 25 ? "text-amber-400" : "text-emerald-400"
          )}>
            ${risk}K
          </p>
        </div>
      </div>

      {/* Current Task */}
      <div className="relative mb-4">
        <p className="text-xs text-slate-500 mb-1">Tarea actual</p>
        <p className="text-sm text-slate-300 line-clamp-2">
          {agent.current_task.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePauseResume();
          }}
          disabled={isLoading}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
            isPaused 
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
              : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Reanudar
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pausar
            </>
          )}
        </button>
      </div>

      {/* Type Label */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          {TYPE_LABELS[agent.type]}
        </span>
      </div>
    </motion.div>
  );
}
