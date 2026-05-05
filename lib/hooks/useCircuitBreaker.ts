"use client";

import { useCallback } from "react";
import { useAgentStore, type CircuitBreakerLevel } from "@/store/agentStore";

export function useCircuitBreaker(agentId: string) {
  const setCircuitBreakerLevel = useAgentStore((state) => state.setCircuitBreakerLevel);

  const openCircuit = useCallback(() => {
    setCircuitBreakerLevel(agentId, 3);
  }, [agentId, setCircuitBreakerLevel]);

  const suspend = useCallback(() => {
    setCircuitBreakerLevel(agentId, 4);
  }, [agentId, setCircuitBreakerLevel]);

  const setLevel = useCallback((level: CircuitBreakerLevel) => {
    setCircuitBreakerLevel(agentId, level);
  }, [agentId, setCircuitBreakerLevel]);

  return { openCircuit, setLevel, suspend };
}
