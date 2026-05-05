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
    <div className="rounded-data border bg-card/70 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-warn" /><h2 className="font-accent text-sm">Scenario selector</h2></div>
        {activeScenario && <span className="animate-signal-blink font-display text-[10px] text-critical">ACTIVE</span>}
      </div>
      <div className="space-y-2">
        <button onClick={activatePriceLoopScenario} className="w-full rounded-badge border border-warn/40 bg-warn/10 px-3 py-2 text-left font-display text-xs text-warn">
          Escenario 1 · Price Feedback Loop
        </button>
        <button onClick={activateScreeningBiasScenario} className="w-full rounded-badge border border-warn/40 bg-warn/10 px-3 py-2 text-left font-display text-xs text-warn">
          Escenario 2 · Fair Housing Flag
        </button>
        <button onClick={activateRetryStormScenario} className="w-full rounded-badge border border-warn/40 bg-warn/10 px-3 py-2 text-left font-display text-xs text-warn">
          Escenario 3 · Retry Storm HVAC
        </button>
        {activeScenario?.mode === "price_loop" && (
          <button onClick={containScenarioFamily} className="w-full rounded-badge border border-ok/40 bg-ok/10 px-3 py-2 text-left font-display text-xs text-ok">
            Contener familia · {activeScenario.affectedAgentIds.length} agentes
          </button>
        )}
        {activeScenario?.mode === "screening_bias" && (
          <button onClick={forceScreeningHITL} className="w-full rounded-badge border border-critical/40 bg-critical/10 px-3 py-2 text-left font-display text-xs text-critical">
            Forzar HITL 100% para screening
          </button>
        )}
      </div>
    </div>
  );
}
