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
  featured?: boolean;
  index?: number;
}

// Compact confidence indicator - just the number with color
const ConfidenceIndicator = memo(function ConfidenceIndicator({ 
  confidence,
  featured = false
}: { 
  confidence: number;
  featured?: boolean;
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
      "flex items-center rounded-md",
      featured ? "gap-2 px-2.5 py-1.5" : "gap-1.5 px-2 py-1",
      bgClass
    )}>
      <Activity className={cn(featured ? "w-4 h-4" : "w-3 h-3", colorClass)} />
      <span className={cn(
        "font-semibold tabular-nums",
        featured ? "text-sm" : "text-xs",
        colorClass
      )}>
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
  onPauseResume,
  featured = false,
  index = 0
}: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const confidence = confidencePercent(agent);
  const isPaused = agent.status === "suspended";
  const status = STATUS_CONFIG[agent.status];
  const TypeIcon = TYPE_ICONS[agent.type];
  const typeStyle = TYPE_COLORS[agent.type];
  
  // Featured card shows more prominent styling
  const isFeatured = featured;

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
        y: isFeatured ? -2 : -1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer",
        "rounded-xl overflow-hidden",
        isFeatured ? "bg-slate-800/60" : "bg-slate-900/40",
        "backdrop-blur-xl",
        "border",
        isFeatured ? "border-white/[0.1]" : "border-white/[0.06]",
        "hover:border-white/[0.15]",
        isFeatured 
          ? "shadow-[0_4px_20px_-8px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.03)]"
          : "shadow-[0_2px_8px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]",
        "hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.2),0_4px_12px_-4px_rgba(0,0,0,0.3)]",
        "hover:bg-slate-800/50",
        "transition-all duration-300 ease-out",
        isPaused && "opacity-50 saturate-50"
      )}
    >
      {/* Main row - horizontal layout, taller for featured */}
      <div className={cn(
        "flex items-center gap-3",
        isFeatured ? "px-4 py-4" : "px-3 py-2.5"
      )}>
        
        {/* Status indicator with premium glow - larger for featured */}
        <div className="relative shrink-0">
          <motion.div 
            animate={agent.status === "running" ? {
              boxShadow: [
                "0 0 0 0 rgba(52, 211, 153, 0)",
                isFeatured ? "0 0 0 6px rgba(52, 211, 153, 0.3)" : "0 0 0 4px rgba(52, 211, 153, 0.3)",
                "0 0 0 0 rgba(52, 211, 153, 0)"
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className={cn(
              "rounded-full relative z-10",
              isFeatured ? "w-2.5 h-2.5" : "w-2 h-2",
              status.dot,
              agent.status === "running" && (isFeatured ? "shadow-[0_0_12px_currentColor]" : "shadow-[0_0_8px_currentColor]")
            )}
          />
          {/* Ambient glow ring */}
          {agent.status === "running" && (
            <motion.div
              animate={{ 
                scale: [1, 1.6], 
                opacity: [0.4, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className={cn(
                "absolute inset-0 rounded-full",
                isFeatured ? "-m-1.5" : "-m-1",
                status.dot,
                "blur-sm"
              )}
            />
          )}
        </div>

        {/* Type icon - glass badge, larger for featured */}
        <div className={cn(
          "rounded-lg flex items-center justify-center shrink-0",
          isFeatured ? "w-10 h-10" : "w-8 h-8",
          "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
          "border border-white/[0.08]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
          typeStyle.split(" ")[0]
        )}>
          <TypeIcon className={isFeatured ? "w-5 h-5" : "w-4 h-4"} />
        </div>

        {/* Name with subtle gradient text - larger for featured */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-white/90 truncate group-hover:text-white transition-colors",
            isFeatured ? "text-base" : "text-sm"
          )}>
            {agent.name}
          </h3>
          {isFeatured && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {agent.current_task.description}
            </p>
          )}
        </div>

        {/* Confidence badge */}
        <ConfidenceIndicator confidence={confidence} featured={isFeatured} />

        {/* Quick actions */}
        <div 
          className={cn(
            "flex items-center shrink-0",
            isFeatured ? "gap-1" : "gap-0.5"
          )}
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

      {/* Expandable footer - hidden for featured (already shows task), visible on hover for others */}
      <AnimatePresence>
        {!isFeatured && isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="px-3 py-2.5 bg-gradient-to-b from-white/[0.03] to-transparent">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400 truncate flex-1 leading-relaxed">
                  {agent.current_task.description}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {agent.id.split("-").pop()}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-[10px] text-slate-500">
                    {agent.metadata.region}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at 50% 0%, rgba(99,102,241,0.08), transparent 50%)`
        }}
      />
      
      {/* Top accent line */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scaleX: isHovered ? 1 : 0.8
        }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
      />
    </motion.div>
  );
});
