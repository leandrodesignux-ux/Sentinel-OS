"use client";

import { AutonomyDial } from "@/components/controls/AutonomyDial";
import { useAgentStore } from "@/store/agentStore";

export function GlobalControls() {
  const threshold = useAgentStore((state) => state.threshold);
  const setThreshold = useAgentStore((state) => state.setThreshold);

  return (
    <div className="rounded-data border bg-card/70 p-3 backdrop-blur">
      <div className="mb-3 flex items-center justify-between font-display text-sm"><span>Escalation threshold</span><span>{threshold}</span></div>
      <AutonomyDial value={threshold} onChange={setThreshold} />
    </div>
  );
}
