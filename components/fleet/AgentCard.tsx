"use client";

import { Building2, Home, Users, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { StatusPulse } from "@/components/fleet/StatusPulse";
import { ConfidenceSparkline } from "@/components/charts/ConfidenceSparkline";
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
  const confidenceStroke = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";

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
          whileHover={{ scale: 1.02 }}
          onClick={() => selectAgent(agent.id)}
          className={cn(
            "group relative h-[110px] w-[140px] rounded-xl bg-[#2B2E2E] border border-[#3D4141] p-2.5 flex flex-col transition-all duration-150 hover:border-[#D7FEFA]/30",
            isIntervention && "border-[#F87171]/50",
            inScenarioCascade && "border-[#F87171]/50",
            hasLegalFlag && "border-[#FBBF24]/50",
            isHalted && "opacity-40 grayscale",
            isSelected && "border-[#D7FEFA] bg-[#333737]"
          )}
        >
          {/* Header: ID left + StatusPulse right */}
          <div className="flex items-center justify-between mb-1">
            <span 
              className="font-mono text-[9px] text-[#6B7272] tracking-tight" 
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {agent.id.replace('AGT-','#')}
            </span>
            <StatusPulse status={agent.status} />
          </div>

          {/* Center: Icon (24px) */}
          <div className="flex justify-center mb-1">
            <Icon className="h-6 w-6" style={{ color: STATUS_COLORS[agent.status] }} />
          </div>

          {/* Confidence number: large mono */}
          <div className="text-center mb-0.5">
            <span 
              className="font-mono text-[20px] font-semibold leading-none"
              style={{ color: confidenceStroke }}
            >
              {confidence}
            </span>
          </div>

          {/* Type label */}
          <p className="text-[9px] text-[#6B7272] text-center mb-1">
            {typeLabels[agent.type]}
          </p>

          {/* Mini sparkline */}
          <div className="h-[28px]" style={{ color: confidenceStroke }}>
            <ConfidenceSparkline agent={agent} />
          </div>

          {/* Bottom confidence bar (2px) */}
          <div className="mt-1 h-[2px] rounded-full overflow-hidden bg-[#3D4141]">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${confidence}%`,
                background: confidenceStroke
              }} 
            />
          </div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent className="w-80 rounded-card border-[#3D4141] bg-[#2B2E2E] p-4">
        <div className="space-y-3">
          <div>
            <p className="font-display text-sm text-white">{agent.name}</p>
            <p className="mt-0.5 text-xs text-[#A8AFAF]">{agent.id} · {typeLabels[agent.type]}</p>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[#6B7272]">Seguridad de la decisión</span>
              <span className="font-display text-white">{confidence}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#3D4141]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${confidence}%`,
                  background: confidence > 70 ? '#34D399' : confidence >= 40 ? '#FBBF24' : '#F87171',
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[#A8AFAF]">{agent.current_task.description}</p>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-[#6B7272]">Dinero en juego</span>
            <span className="font-display text-right text-white">${impact}K</span>
            <span className="text-[#6B7272]">Estado</span>
            <span className="text-right text-white">{statusLabels[agent.status]}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
