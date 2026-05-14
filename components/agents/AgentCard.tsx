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
  
  // Linear progress bar for confidence
  const ConfidenceBar = () => (
    <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${confidence}%`,
          background: `linear-gradient(90deg, ${confidenceColor}80, ${confidenceColor})`
        }}
      />
    </div>
  );

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
        "relative group rounded-2xl p-6 cursor-pointer",
        "bg-white/10 backdrop-blur-md border border-white/20",
        "shadow-lg hover:shadow-xl hover:shadow-indigo-500/20",
        "transition-all duration-300",
        isPaused && "opacity-60 grayscale"
      )}
      onClick={onClick}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-indigo-500/5 pointer-events-none" />
      
      {/* Header: Icon + Menu */}
      <div className="relative flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div 
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-indigo-500/30 to-purple-500/30",
              "border border-white/20 shadow-inner"
            )}
          >
            <TypeIcon className="w-7 h-7 text-indigo-300" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base truncate max-w-[160px]">
              {agent.name}
            </h3>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
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
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
          
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "absolute right-0 top-full mt-2 w-52 z-50",
                  "bg-slate-800/95 backdrop-blur-xl border border-white/10",
                  "rounded-xl shadow-2xl overflow-hidden"
                )}
              >
                <div className="p-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Ver tarea actual
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Ajustar confianza
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    Verificar estado
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="relative flex items-center gap-2 mb-5">
        <span className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
          status.bg,
          status.color
        )}>
          <span className={cn("w-2 h-2 rounded-full animate-pulse", status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Metrics: Confidence Bar + Risk */}
      <div className="relative mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Confianza</span>
          <span className={cn(
            "text-lg font-semibold font-mono",
            confidence > 90 ? "text-emerald-400" : confidence >= 80 ? "text-amber-400" : "text-rose-400"
          )}>
            {confidence}%
          </span>
        </div>
        <ConfidenceBar />
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span className="text-sm text-slate-400">Riesgo asociado</span>
          <span className={cn(
            "text-lg font-semibold font-mono",
            risk > 50 ? "text-rose-400" : risk > 25 ? "text-amber-400" : "text-emerald-400"
          )}>
            ${risk}K
          </span>
        </div>
      </div>

      {/* Current Task */}
      <div className="relative mb-5">
        <p className="text-sm text-slate-500 mb-2">Tarea actual</p>
        <p className="text-base text-slate-300 line-clamp-2 leading-relaxed">
          {agent.current_task.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePauseResume();
          }}
          disabled={isLoading}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
            isPaused 
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
              : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/10"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPaused ? (
            <>
              <Play className="w-5 h-5" />
              Reanudar
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              Pausar
            </>
          )}
        </button>
      </div>

      {/* Hover Detail Button */}
      <div className="absolute top-6 right-16 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-500 uppercase tracking-wider bg-slate-800/80 px-2 py-1 rounded">
          {TYPE_LABELS[agent.type]}
        </span>
      </div>
    </motion.div>
  );
}
