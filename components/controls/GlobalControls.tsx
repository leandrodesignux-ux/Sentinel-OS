"use client";

import { AutonomyDial } from "@/components/controls/AutonomyDial";
import { ScenarioSelector } from "@/components/controls/ScenarioSelector";
import { useAgentStore } from "@/store/agentStore";

export function GlobalControls() {
  const threshold = useAgentStore((state) => state.threshold);
  const setThreshold = useAgentStore((state) => state.setThreshold);

  return (
    <div className="space-y-3">
      <div className="rounded-data border bg-card/70 p-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between font-display text-sm"><span>Autonomy dial</span><span>{threshold}% AUTO</span></div>
        <AutonomyDial value={threshold} onChange={setThreshold} />
      </div>
      <ScenarioSelector />
    </div>
  );
}
