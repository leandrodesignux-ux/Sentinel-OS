"use client";

import { useAgentStore } from "@/store/agentStore";
import { isCriticalAgent } from "@/lib/utils/riskUtils";

export function useExceptionQueue() {
  const agents = useAgentStore((state) => state.agents);
  const exceptions = useAgentStore((state) => state.exceptions);

  const queuedAgents = agents
    .filter(isCriticalAgent)
    .sort((left, right) => right.economic_risk.amount - left.economic_risk.amount);

  return { exceptions, queuedAgents };
}
