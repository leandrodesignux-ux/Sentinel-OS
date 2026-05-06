"use client";

import { Building2, Home, Users, Wrench } from "lucide-react";
import { motion } from "framer-motion";
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

const typeIcons = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const typeLabels = {
  sales: "ventas",
  asset_mgmt: "activos",
  maintenance: "mantenimiento",
  screening: "evaluación",
};

const statusLabels = {
  idle: "En espera",
  running: "Trabajando",
  monitoring: "Bajo observación",
  intervention_required: "Necesita tu atención",
  circuit_open: "Necesita tu atención",
  suspended: "Pausado",
};

export function AgentCard({ agent }: { agent: Agent }) {
  const confidence = confidencePercent(agent);
  const impact = economicImpactK(agent);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const emergencyHalt = useAgentStore((state) => state.emergencyHalt);
  const activeScenario = useAgentStore((state) => state.activeScenario);
  const Icon = typeIcons[agent.type];
  const isIntervention = agent.status === "intervention_required";
  const isSelected = selectedAgentId === agent.id;
  const haltIndex = emergencyHalt.affectedAgentIds.indexOf(agent.id);
  const isHalted = emergencyHalt.active && haltIndex >= 0;
  const scenarioIndex = activeScenario?.affectedAgentIds.indexOf(agent.id) ?? -1;
  const inScenarioCascade = activeScenario?.mode === "price_loop" && scenarioIndex >= 0;
  const hasLegalFlag = activeScenario?.mode === "screening_bias" && agent.id === "AGT-048";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          layout
          animate={{
            scale: isIntervention ? 1.05 : 1,
            opacity: isHalted ? 0.38 : 1,
            filter: isHalted ? "grayscale(1)" : "grayscale(0)",
            borderColor: inScenarioCascade ? "var(--status-critical)" : STATUS_COLORS[agent.status],
          }}
          transition={{ duration: 0.18, delay: inScenarioCascade ? scenarioIndex * 0.2 : isHalted ? haltIndex * 0.05 : 0 }}
          onClick={() => selectAgent(agent.id)}
          className={cn(
            "relative h-[88px] w-16 rounded-data border border-[var(--bg-border)] bg-[var(--bg-surface)] p-2 text-left transition hover:z-10 hover:border-[var(--status-accent)]/50 hover:bg-[var(--bg-elevated)]",
            isIntervention && "animate-critical-breach",
            inScenarioCascade && "animate-critical-breach border-[var(--status-critical)] bg-[var(--status-critical)]/10",
            hasLegalFlag && "border-[var(--status-warning)] bg-[var(--status-warning)]/10 shadow-danger",
            isHalted && "bg-[var(--bg-border)] text-[var(--text-muted)]",
            isSelected && "ring-1 ring-[var(--status-accent)]",
          )}
        >
          <div className="flex items-center justify-between">
            <Icon className="h-3 w-3 opacity-60" />
            <StatusPulse status={agent.status} />
          </div>
          <p className="mt-1 truncate font-display text-[9px] text-[var(--text-muted)]">
            {agent.id}
          </p>
          <div className="mt-2 h-5 w-full overflow-hidden rounded-[2px] bg-[var(--bg-border)]">
            <motion.div
              className="h-full origin-bottom rounded-[2px]"
              animate={{
                width: `${confidence}%`,
                backgroundColor: confidence > 90
                  ? "var(--conf-high)"
                  : confidence >= 80
                    ? "var(--conf-mid)"
                    : "var(--conf-low)",
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className={cn(
              "font-display text-[9px] font-medium",
              confidence > 90 ? "text-[var(--conf-high)]" :
                confidence >= 80 ? "text-[var(--conf-mid)]" : "text-[var(--conf-low)]"
            )}>
              {confidence}%
            </span>
            {agent.economic_risk.amount > 50000 && (
              <span className="font-display text-[8px] text-[var(--status-critical)]">
                {impact}K
              </span>
            )}
          </div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent className="w-80 rounded-card border-[var(--bg-border)] bg-[var(--bg-elevated)] p-4">
        <div className="space-y-3">
          <div>
            <p className="font-display text-sm text-[var(--text-primary)]">{agent.name}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{agent.id} · {typeLabels[agent.type]}</p>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">Seguridad de la decisión</span>
              <span className="font-display" style={{ color: confidence > 90 ? "var(--conf-high)" : confidence >= 80 ? "var(--conf-mid)" : "var(--conf-low)" }}>
                {confidence}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--bg-border)]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${confidence}%`,
                  background: confidence > 90 ? "var(--conf-high)" : confidence >= 80 ? "var(--conf-mid)" : "var(--conf-low)",
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{agent.current_task.description}</p>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-[var(--text-muted)]">Dinero en juego</span>
            <span className="font-display text-right text-[var(--status-critical)]">${impact}K</span>
            <span className="text-[var(--text-muted)]">Estado</span>
            <span className="text-right">{statusLabels[agent.status]}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
