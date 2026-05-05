"use client";

import { useCircuitBreaker } from "@/lib/hooks/useCircuitBreaker";

export function CircuitBreaker({ agentId }: { agentId: string }) {
  const { openCircuit } = useCircuitBreaker(agentId);

  return <button onClick={openCircuit} className="rounded-badge border border-critical/40 px-2 py-1 font-display text-xs text-critical">OPEN CIRCUIT</button>;
}
