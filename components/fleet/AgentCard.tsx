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

export function AgentCard({ agent, index = 0 }: { agent: Agent; index?: number }) {
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

  const confidenceColor = confidence > 90 ? "text-[var(--conf-high)]" : confidence >= 80 ? "text-[var(--conf-mid)]" : "text-[var(--conf-low)]";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: isHalted ? 0.38 : 1,
            y: 0,
            scale: isIntervention ? 1.05 : 1,
            filter: isHalted ? "grayscale(1)" : "grayscale(0)",
            borderColor: inScenarioCascade ? "var(--status-critical)" : STATUS_COLORS[agent.status],
          }}
          transition={{ duration: 0.15, delay: index * 0.02 }}
          onClick={() => selectAgent(agent.id)}
          className={cn(
            "group relative min-h-[88px] w-[84px] rounded-xl bg-white p-3 text-center transition-all duration-150 hover:shadow-[var(--shadow-card)]",
            isIntervention && "ring-1 ring-[var(--status-critical)]",
            inScenarioCascade && "ring-1 ring-[var(--status-critical)]",
            hasLegalFlag && "ring-1 ring-[var(--status-warning)]",
            isHalted && "opacity-40 grayscale",
            isSelected && "ring-2 ring-[var(--status-accent)]"
          )}
        >
          {/* ID en JetBrains Mono */}
          <span className="font-mono text-[9px] text-[var(--text-muted)] tracking-tight" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
            {agent.id.replace('AGT-','#')}
          </span>
          
          {/* Icono */}
          <Icon className="h-5 w-5 mx-auto my-2" style={{color: STATUS_COLORS[agent.status]}} />
          
          {/* Porcentaje */}
          <span className="font-mono text-[11px] font-medium text-[var(--text-primary)]">
            {confidence}%
          </span>
          
          {/* Hilo de confianza (2px) en la parte inferior */}
          <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${confidence}%`,
                background: confidence > 90 ? 'var(--conf-high)' : confidence >= 80 ? 'var(--conf-mid)' : 'var(--conf-low)'
              }} 
            />
          </div>
          
          {/* Status dot flotante */}
          <span 
            className={cn("absolute top-2 right-2 h-1.5 w-1.5 rounded-full", isIntervention && "animate-pulse")} 
            style={{ backgroundColor: STATUS_COLORS[agent.status] }} 
          />
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
