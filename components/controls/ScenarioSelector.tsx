"use client";

import { GitBranch } from "lucide-react";
import { useAgentStore } from "@/store/agentStore";

export function ScenarioSelector() {
  const activeScenario = useAgentStore((state) => state.activeScenario);
  const activatePriceLoopScenario = useAgentStore((state) => state.activatePriceLoopScenario);
  const activateScreeningBiasScenario = useAgentStore((state) => state.activateScreeningBiasScenario);
  const activateRetryStormScenario = useAgentStore((state) => state.activateRetryStormScenario);
  const containScenarioFamily = useAgentStore((state) => state.containScenarioFamily);
  const forceScreeningHITL = useAgentStore((state) => state.forceScreeningHITL);

  return (
    <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-[#FBBF24]" /><h2 className="font-accent text-sm text-white">Scenario selector</h2></div>
        {activeScenario && <span className="animate-signal-blink font-display text-[10px] text-[#F87171]">ACTIVE</span>}
      </div>
      <div className="space-y-2">
        <button onClick={activatePriceLoopScenario} className="w-full rounded-badge border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3 py-2 text-left font-display text-xs text-[#FBBF24] hover:bg-[#FBBF24]/20 transition-colors">
          Escenario 1 · Price Feedback Loop
        </button>
        <button onClick={activateScreeningBiasScenario} className="w-full rounded-badge border border-[#A78BFA]/30 bg-[#A78BFA]/10 px-3 py-2 text-left font-display text-xs text-[#A78BFA] hover:bg-[#A78BFA]/20 transition-colors">
          Escenario 2 · Fair Housing Flag
        </button>
        <button onClick={activateRetryStormScenario} className="w-full rounded-badge border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-left font-display text-xs text-[#F87171] hover:bg-[#F87171]/20 transition-colors">
          Escenario 3 · Retry Storm HVAC
        </button>
        {activeScenario?.mode === "price_loop" && (
          <button onClick={containScenarioFamily} className="w-full rounded-badge border border-[#34D399]/30 bg-[#34D399]/10 px-3 py-2 text-left font-display text-xs text-[#34D399] hover:bg-[#34D399]/20 transition-colors">
            Contener familia · {activeScenario.affectedAgentIds.length} agentes
          </button>
        )}
        {activeScenario?.mode === "screening_bias" && (
          <button onClick={forceScreeningHITL} className="w-full rounded-badge border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-left font-display text-xs text-[#F87171] hover:bg-[#F87171]/20 transition-colors">
            Forzar HITL 100% para screening
          </button>
        )}
      </div>
    </div>
  );
}
