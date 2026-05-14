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

// Status configuration using design system colors
const STATUS_CONFIG: Record<AgentStatus, { 
  dot: string;
  color: string;
}> = {
  idle: { 
    dot: "#34D399",
    color: "var(--status-nominal)",
  },
  running: { 
    dot: "#34D399",
    color: "var(--status-nominal)",
  },
  monitoring: { 
    dot: "#FBBF24",
    color: "var(--status-warning)",
  },
  intervention_required: { 
    dot: "#F87171",
    color: "var(--status-critical)",
  },
  circuit_open: { 
    dot: "#F87171",
    color: "var(--status-critical)",
  },
  suspended: { 
    dot: "#6B7272",
    color: "var(--status-offline)",
  },
};

const TYPE_ICONS: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const TYPE_COLORS: Record<AgentType, { text: string; bg: string; border: string }> = {
  sales: { text: "#FBBF24", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)" },
  asset_mgmt: { text: "#D7FEFA", bg: "rgba(215, 254, 250, 0.1)", border: "rgba(215, 254, 250, 0.2)" },
  maintenance: { text: "#F87171", bg: "rgba(248, 113, 113, 0.1)", border: "rgba(248, 113, 113, 0.2)" },
  screening: { text: "#A8AFAF", bg: "rgba(168, 175, 175, 0.1)", border: "rgba(168, 175, 175, 0.2)" },
};

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  onPauseResume: () => Promise<void>;
  featured?: boolean;
  index?: number;
}

// Compact confidence indicator using design system colors
const ConfidenceIndicator = memo(function ConfidenceIndicator({ 
  confidence,
  featured = false
}: { 
  confidence: number;
  featured?: boolean;
}) {
  const color = confidence > 90 
    ? "#34D399" // --conf-high
    : confidence >= 80 
      ? "#FBBF24" // --conf-mid
      : "#F87171"; // --conf-low
  
  const bgColor = confidence > 90 
    ? "rgba(52, 211, 153, 0.1)" 
    : confidence >= 80 
      ? "rgba(251, 191, 36, 0.1)" 
      : "rgba(248, 113, 113, 0.1)";

  return (
    <div className={cn(
      "flex items-center"
    )} style={{
      gap: featured ? '0.5rem' : '0.375rem',
      padding: featured ? '0.375rem 0.625rem' : '0.25rem 0.5rem',
      backgroundColor: bgColor,
      borderRadius: 'var(--radius-inner)'
    }}>
      <Activity className={featured ? "w-4 h-4" : "w-3 h-3"} style={{ color }} />
      <span className={cn(
        "font-semibold tabular-nums",
        featured ? "text-sm" : "text-xs"
      )} style={{ color, fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
        {confidence}%
      </span>
    </div>
  );
});

// Icon action button using design system
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
  const getStyles = () => {
    switch (variant) {
      case "primary":
        return { color: '#D7FEFA', hoverBg: 'rgba(215, 254, 250, 0.1)' };
      case "danger":
        return { color: '#F87171', hoverBg: 'rgba(248, 113, 113, 0.15)' };
      default:
        return { color: '#A8AFAF', hoverBg: '#3D4141', hoverText: '#FFFFFF' };
    }
  };
  
  const styles = getStyles();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="p-1.5 transition-all duration-150 hover:text-white"
      style={{ 
        borderRadius: 'var(--radius-inner)',
        color: styles.color,
        '--hover-bg': styles.hoverBg
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = styles.hoverBg;
        if (styles.hoverText) e.currentTarget.style.color = styles.hoverText;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = styles.color;
      }}
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
  const typeColor = TYPE_COLORS[agent.type];
  
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
        "relative group cursor-pointer overflow-hidden backdrop-blur-xl transition-all duration-300 ease-out",
        isPaused && "opacity-50"
      )}
      style={{
        borderRadius: '20px',
        backgroundColor: '#2B2E2E',
        border: `1px solid #3D4141`,
        boxShadow: isHovered
          ? '0 12px 32px -8px rgba(215, 254, 250, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.5)'
          : isFeatured 
            ? '0 4px 20px -8px rgba(215, 254, 250, 0.15), inset 0 1px 0 rgba(255,255,255,0.03)'
            : 'var(--shadow-card)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(215, 254, 250, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#3D4141';
      }}
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
                `0 0 0 0 ${status.color}00`,
                isFeatured ? `0 0 0 6px ${status.color}4D` : `0 0 0 4px ${status.color}4D`,
                `0 0 0 0 ${status.color}00`
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className={cn(
              "rounded-full relative z-10",
              isFeatured ? "w-2.5 h-2.5" : "w-2 h-2"
            )}
            style={{
              backgroundColor: status.dot,
              boxShadow: agent.status === "running" 
                ? (isFeatured ? `0 0 12px ${status.dot}` : `0 0 8px ${status.dot}`)
                : undefined
            }}
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
                "absolute inset-0 rounded-full blur-sm",
                isFeatured ? "-m-1.5" : "-m-1"
              )}
              style={{ backgroundColor: status.dot }}
            />
          )}
        </div>

        {/* Type icon - glass badge, larger for featured */}
        <div 
          className="flex items-center justify-center shrink-0"
          style={{
            width: isFeatured ? '2.5rem' : '2rem',
            height: isFeatured ? '2.5rem' : '2rem',
            borderRadius: 'var(--radius-inner)',
            background: `linear-gradient(to bottom right, ${typeColor.bg}, rgba(255,255,255,0.02))`,
            border: `1px solid ${typeColor.border}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <TypeIcon 
            className={isFeatured ? "w-5 h-5" : "w-4 h-4"} 
            style={{ color: typeColor.text }}
          />
        </div>

        {/* Name with subtle gradient text - larger for featured */}
        <div className="flex-1 min-w-0">
          <h3 
            className={cn(
              "font-semibold truncate group-hover:text-white transition-colors",
              isFeatured ? "text-base" : "text-sm"
            )}
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {agent.name}
          </h3>
          {isFeatured && (
            <p 
              className="text-xs mt-0.5 truncate"
              style={{ color: '#6B7272' }}
            >
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
            className="overflow-hidden"
            style={{ borderTop: '1px solid #3D4141' }}
          >
            <div 
              className="px-3 py-2.5"
              style={{ backgroundColor: '#333737' }}
            >
              <div className="flex items-center justify-between gap-4">
                <p 
                  className="text-[11px] truncate flex-1 leading-relaxed"
                  style={{ color: '#6B7272' }}
                >
                  {agent.current_task.description}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span 
                    className="text-[10px] font-mono px-1.5 py-0.5"
                    style={{ 
                      color: '#A8AFAF', 
                      backgroundColor: '#3D4141',
                      borderRadius: 'var(--radius-inner)',
                      fontFamily: 'var(--font-jetbrains-mono), monospace'
                    }}
                  >
                    {agent.id.split("-").pop()}
                  </span>
                  <span 
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#3D4141' }}
                  />
                  <span className="text-[10px]" style={{ color: '#6B7272' }}>
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
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: '20px',
          background: `radial-gradient(400px circle at 50% 0%, rgba(215, 254, 250, 0.06), transparent 50%)`
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
        className="absolute top-0 left-4 right-4 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(215, 254, 250, 0.2), transparent)'
        }}
      />
    </motion.div>
  );
});
