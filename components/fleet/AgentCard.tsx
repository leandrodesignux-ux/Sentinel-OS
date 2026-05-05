"use client";

import { Building2, ClipboardCheck, Home, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { ConfidenceSparkline } from "@/components/charts/ConfidenceSparkline";
import { StatusPulse } from "@/components/fleet/StatusPulse";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

const STATUS_COLORS = {
  idle: "var(--status-nominal)",
  running: "var(--text-accent)",
  monitoring: "var(--status-warning)",
  intervention_required: "var(--status-critical)",
  circuit_open: "var(--status-critical)",
  suspended: "var(--status-offline)",
};

const statusTone = {
  idle: "bg-ok/8 text-ok",
  running: "bg-primary/10 text-primary",
  monitoring: "bg-warn/10 text-warn",
  intervention_required: "bg-critical/15 text-critical shadow-danger",
  circuit_open: "bg-critical/20 text-critical shadow-danger",
  suspended: "bg-muted text-foreground/50",
};

const typeIcons = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: ClipboardCheck,
};

export function AgentCard({ agent }: { agent: Agent }) {
  const confidence = confidencePercent(agent);
  const impact = economicImpactK(agent);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const emergencyHalt = useAgentStore((state) => state.emergencyHalt);
  const Icon = typeIcons[agent.type];
  const isIntervention = agent.status === "intervention_required";
  const isSelected = selectedAgentId === agent.id;
  const haltIndex = emergencyHalt.affectedAgentIds.indexOf(agent.id);
  const isHalted = emergencyHalt.active && haltIndex >= 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          layout
          animate={{
            scale: isIntervention ? 1.05 : 1,
            opacity: isHalted ? 0.38 : 1,
            filter: isHalted ? "grayscale(1)" : "grayscale(0)",
            borderColor: STATUS_COLORS[agent.status],
          }}
          transition={{ duration: 0.18, delay: isHalted ? haltIndex * 0.05 : 0 }}
          onClick={() => selectAgent(agent.id)}
          className={cn(
            "relative h-20 w-16 rounded-data border bg-card/80 p-1.5 text-left transition hover:z-10 hover:shadow-glow",
            isIntervention && "animate-critical-breach",
            isHalted && "bg-muted text-foreground/40",
            isSelected && "ring-1 ring-primary",
            statusTone[agent.status],
          )}
        >
          <div className="flex items-center justify-between">
            <Icon className="h-3.5 w-3.5" />
            <StatusPulse status={agent.status} />
          </div>
          <p className="mt-1 truncate font-display text-[10px] text-foreground">{agent.id}</p>
          <div className="mt-1 h-5 text-current">
            <ConfidenceSparkline agent={agent} />
          </div>
          <div className="mt-1 flex items-center justify-between font-display text-[9px]">
            <span className={cn(confidence > 90 ? "text-ok" : confidence >= 80 ? "text-warn" : "text-critical")}>{confidence}</span>
            {agent.economic_risk.amount > 50000 && <span className="rounded-badge bg-critical/15 px-1 text-critical">{impact}K</span>}
          </div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent className="w-72">
        <div className="space-y-2">
          <div className="flex items-center justify-between"><span className="font-display text-primary">{agent.name}</span><span>{confidence}%</span></div>
          <p className="text-xs text-foreground/65">{agent.current_task.description}</p>
          <div className="grid grid-cols-2 gap-2 font-display text-xs">
            <span className="text-foreground/45">Economic risk</span><span className="text-critical">${impact}K</span>
            <span className="text-foreground/45">Status</span><span>{agent.status}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
