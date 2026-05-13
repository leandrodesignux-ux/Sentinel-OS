"use client";

import { AutonomyDial } from "@/components/controls/AutonomyDial";
import { ScenarioSelector } from "@/components/controls/ScenarioSelector";
import { useAgentStore } from "@/store/agentStore";

export function GlobalControls() {
  const threshold = useAgentStore((state) => state.threshold);
  const setThreshold = useAgentStore((state) => state.setThreshold);

  return (
    <div className="space-y-3">
      <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
        <div className="mb-3 flex items-center justify-between font-display text-sm"><span className="text-white">Autonomy dial</span><span className="text-[#D7FEFA]">{threshold}% AUTO</span></div>
        <AutonomyDial value={threshold} onChange={setThreshold} />
      </div>
      <ScenarioSelector />
    </div>
  );
}
