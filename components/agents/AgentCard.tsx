"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Home, 
  Users, 
  Wrench, 
  MoreVertical, 
  Play, 
  Pause,
  ExternalLink,
  Zap,
  ChevronRight,
  Loader2
} from "lucide-react";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { cn } from "@/lib/utils";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

// Status configuration - minimal badges
const STATUS_CONFIG: Record<AgentStatus, { 
  label: string; 
  dot: string;
  bg: string;
}> = {
  idle: { 
    label: "Idle", 
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10",
  },
  running: { 
    label: "Active", 
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10",
  },
  monitoring: { 
    label: "Watch", 
    dot: "bg-amber-400",
    bg: "bg-amber-400/10",
  },
  intervention_required: { 
    label: "Alert", 
    dot: "bg-rose-400",
    bg: "bg-rose-400/10",
  },
  circuit_open: { 
    label: "Alert", 
    dot: "bg-rose-400",
    bg: "bg-rose-400/10",
  },
  suspended: { 
    label: "Paused", 
    dot: "bg-slate-400",
    bg: "bg-slate-400/10",
  },
};

const TYPE_ICONS: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const TYPE_COLORS: Record<AgentType, string> = {
  sales: "from-amber-500/20 to-orange-500/20",
  asset_mgmt: "from-blue-500/20 to-cyan-500/20",
  maintenance: "from-rose-500/20 to-pink-500/20",
  screening: "from-violet-500/20 to-purple-500/20",
};

const TYPE_ACCENT: Record<AgentType, string> = {
  sales: "text-amber-400",
  asset_mgmt: "text-blue-400",
  maintenance: "text-rose-400",
  screening: "text-violet-400",
};

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  onPauseResume: () => Promise<void>;
}

// Memoized confidence bar component
const ConfidenceBar = memo(function ConfidenceBar({ 
  confidence, 
  color 
}: { 
  confidence: number; 
  color: string;
}) {
  return (
    <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${confidence}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
});

// Memoized action button
const ActionButton = memo(function ActionButton({
  icon: Icon,
  onClick,
  label,
  variant = "default"
}: {
  icon: typeof Play;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  variant?: "default" | "primary" | "danger";
}) {
  const variants = {
    default: "bg-white/5 hover:bg-white/10 text-slate-300",
    primary: "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300",
    danger: "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg",
        "transition-all duration-200",
        variants[variant]
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );
});

export const AgentCard = memo(function AgentCard({ 
  agent, 
  onClick, 
  onPauseResume 
}: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const confidence = confidencePercent(agent);
  const isPaused = agent.status === "suspended";
  const status = STATUS_CONFIG[agent.status];
  const TypeIcon = TYPE_ICONS[agent.type];
  
  const confidenceColor = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";
  const confidenceTextColor = confidence > 90 ? "text-emerald-400" : confidence >= 80 ? "text-amber-400" : "text-rose-400";

  const handlePauseResume = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onPauseResume();
    } finally {
      setIsLoading(false);
    }
  }, [onPauseResume]);

  const handleDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  const handleRun = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger agent execution
    console.log(`Running agent ${agent.id}`);
  }, [agent.id]);

  return (
    <motion.div
      layoutId={`agent-card-${agent.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ 
        duration: 0.25, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onHoverStart={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
      onClick={onClick}
      className={cn(
        "relative group rounded-xl overflow-hidden cursor-pointer",
        "bg-slate-900/40 backdrop-blur-xl",
        "border border-white/[0.06]",
        "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]",
        "hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.15)]",
        "hover:border-white/[0.12]",
        "transition-shadow duration-300",
        isPaused && "opacity-75"
      )}
    >
      {/* Gradient overlay on hover */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          TYPE_COLORS[agent.type],
          "opacity-30"
        )}
      />

      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-4 right-4 h-[2px] rounded-full",
        "bg-gradient-to-r from-transparent via-white/20 to-transparent",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      )} />

      <div className="relative p-5">
        {/* Header: Icon + Name */}
        <div className="flex items-start gap-3 mb-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              "bg-white/5 border border-white/[0.06]",
              TYPE_ACCENT[agent.type]
            )}
          >
            <TypeIcon className="w-5 h-5" />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                status.dot,
                agent.status === "running" && "animate-pulse"
              )} />
              <span className="text-xs text-slate-400">
                {status.label}
              </span>
            </div>
          </div>

          {/* Quick Actions - appear on hover */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <ActionButton
                  icon={isPaused ? Play : Pause}
                  onClick={handlePauseResume}
                  label={isPaused ? "Resume" : "Pause"}
                  variant={isPaused ? "primary" : "default"}
                />
                <ActionButton
                  icon={Zap}
                  onClick={handleRun}
                  label="Run Agent"
                  variant="primary"
                />
                <ActionButton
                  icon={ExternalLink}
                  onClick={handleDetails}
                  label="Open Details"
                />
                <ActionButton
                  icon={MoreVertical}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show more menu
                  }}
                  label="More"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chevron indicator on hover */}
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: isHovered ? 0.5 : 0, x: 0 }}
            className="text-slate-500"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Confidence Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Confidence
            </span>
            <motion.span 
              className={cn(
                "text-sm font-semibold tabular-nums",
                confidenceTextColor
              )}
            >
              {confidence}%
            </motion.span>
          </div>
          <ConfidenceBar confidence={confidence} color={confidenceColor} />
        </div>

        {/* Expanded info on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-white/[0.06]">
                <p className="text-xs text-slate-400 line-clamp-2">
                  {agent.current_task.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-slate-500">
                    {agent.id}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-[10px] text-slate-500">
                    {agent.metadata.region}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom glow effect */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-px",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      )} />
    </motion.div>
  );
});
