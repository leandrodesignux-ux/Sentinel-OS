"use client";

import { useCallback } from "react";
import { useAgentStore } from "@/store/agentStore";

export function useCircuitBreaker(agentId: string) {
  const updateAgent = useAgentStore((state) => state.updateAgent);

  const openCircuit = useCallback(() => {
    updateAgent(agentId, { status: "circuit_open" });
  }, [agentId, updateAgent]);

  const suspend = useCallback(() => {
    updateAgent(agentId, { status: "suspended" });
  }, [agentId, updateAgent]);

  return { openCircuit, suspend };
}
