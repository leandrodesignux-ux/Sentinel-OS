"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Home, 
  Users, 
  Wrench, 
  MoreHorizontal, 
  Play, 
  Pause,
  ExternalLink,
  Zap,
  Loader2,
  Activity
} from "lucide-react";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { cn } from "@/lib/utils";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

// Status configuration - ultra compact
const STATUS_CONFIG: Record<AgentStatus, { 
  dot: string;
  glow: string;
}> = {
  idle: { 
    dot: "bg-emerald-400",
    glow: "shadow-emerald-400/30",
  },
  running: { 
    dot: "bg-emerald-400",
    glow: "shadow-emerald-400/40",
  },
  monitoring: { 
    dot: "bg-amber-400",
    glow: "shadow-amber-400/30",
  },
  intervention_required: { 
    dot: "bg-rose-500",
    glow: "shadow-rose-500/40",
  },
  circuit_open: { 
    dot: "bg-rose-500",
    glow: "shadow-rose-500/40",
  },
  suspended: { 
    dot: "bg-slate-500",
    glow: "shadow-slate-500/20",
  },
};

const TYPE_ICONS: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const TYPE_COLORS: Record<AgentType, string> = {
  sales: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  asset_mgmt: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  maintenance: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  screening: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  onPauseResume: () => Promise<void>;
}

// Compact confidence indicator - just the number with color
const ConfidenceIndicator = memo(function ConfidenceIndicator({ 
  confidence 
}: { 
  confidence: number;
}) {
  const colorClass = confidence > 90 
    ? "text-emerald-400" 
    : confidence >= 80 
      ? "text-amber-400" 
      : "text-rose-400";
  
  const bgClass = confidence > 90 
    ? "bg-emerald-400/10" 
    : confidence >= 80 
      ? "bg-amber-400/10" 
      : "bg-rose-400/10";

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-md",
      bgClass
    )}>
      <Activity className={cn("w-3 h-3", colorClass)} />
      <span className={cn("text-xs font-semibold tabular-nums", colorClass)}>
        {confidence}%
      </span>
    </div>
  );
});

// Icon action button - minimal
const IconButton = memo(function IconButton({
  icon: Icon,
  onClick,
  label,
  variant = "ghost"
}: {
  icon: typeof Play;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  variant?: "ghost" | "primary" | "danger";
}) {
  const variants = {
    ghost: "text-slate-400 hover:text-white hover:bg-white/10",
    primary: "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20",
    danger: "text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all duration-150",
        variants[variant]
      )}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
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
  
  const confidence = confidencePercent(agent);
  const isPaused = agent.status === "suspended";
  const status = STATUS_CONFIG[agent.status];
  const TypeIcon = TYPE_ICONS[agent.type];
  const typeStyle = TYPE_COLORS[agent.type];

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
    console.log(`Running agent ${agent.id}`);
  }, [agent.id]);

  return (
    <motion.div
      layoutId={`agent-${agent.id}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        y: -1,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer",
        "rounded-lg overflow-hidden",
        "bg-slate-900/60 backdrop-blur-sm",
        "border border-white/[0.05]",
        "hover:border-white/[0.1]",
        "hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]",
        "transition-all duration-200",
        isPaused && "opacity-60"
      )}
    >
      {/* Main row - ultra compact horizontal layout */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        
        {/* Status dot with glow for running agents */}
        <div className="relative shrink-0">
          <motion.div 
            animate={agent.status === "running" ? {
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-2 h-2 rounded-full",
              status.dot,
              agent.status === "running" && cn("shadow-lg", status.glow)
            )}
          />
          {/* Pulse ring for running */}
          {agent.status === "running" && (
            <motion.span
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                "absolute inset-0 rounded-full",
                status.dot,
                "opacity-30"
              )}
            />
          )}
        </div>

        {/* Type icon - small badge */}
        <div className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
          "border",
          typeStyle
        )}>
          <TypeIcon className="w-3.5 h-3.5" />
        </div>

        {/* Name - single line, truncated */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {agent.name}
          </h3>
        </div>

        {/* Confidence - compact badge */}
        <ConfidenceIndicator confidence={confidence} />

        {/* Quick actions - always visible but subtle */}
        <div 
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            icon={isPaused ? Play : Pause}
            onClick={handlePauseResume}
            label={isPaused ? "Resume" : "Pause"}
            variant={isPaused ? "primary" : "ghost"}
          />
          <IconButton
            icon={Zap}
            onClick={handleRun}
            label="Run"
            variant="ghost"
          />
          <IconButton
            icon={ExternalLink}
            onClick={handleDetails}
            label="Details"
            variant="ghost"
          />
          <IconButton
            icon={MoreHorizontal}
            onClick={(e) => e.stopPropagation()}
            label="More"
            variant="ghost"
          />
        </div>
      </div>

      {/* Expandable footer on hover - secondary info */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-white/[0.03]"
          >
            <div className="px-3 py-2 bg-white/[0.02]">
              <div className="flex items-center justify-between gap-4">
                {/* Task description */}
                <p className="text-[11px] text-slate-500 truncate flex-1">
                  {agent.current_task.description}
                </p>
                
                {/* Meta info */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-600 font-mono">
                    {agent.id}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-[10px] text-slate-600">
                    {agent.metadata.region}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle gradient glow on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 0%), rgba(99,102,241,0.06), transparent 40%)`
        }}
      />
    </motion.div>
  );
});
