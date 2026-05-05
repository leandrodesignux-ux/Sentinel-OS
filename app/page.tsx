"use client";

import { SentinelShell } from "@/components/layout/SentinelShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAgentSimulation } from "@/lib/hooks/useAgentSimulation";
import { useAgentStore } from "@/store/agentStore";

export default function Home() {
  const agents = useAgentStore((state) => state.agents);

  useAgentSimulation({
    tickInterval: 2000,
    volatility: "medium",
    scenarioMode: "normal",
  });

  return (
    <TooltipProvider>
      <SentinelShell agents={agents} />
    </TooltipProvider>
  );
}
