import type { Agent } from "@/types/agent";

export function economicImpactK(agent: Agent) {
  return Math.round(agent.economic_risk.amount / 1000);
}

export function isCriticalAgent(agent: Agent) {
  return agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended" || agent.risk_level === "critical";
}

export function cascadeRiskScore(agent: Agent) {
  return agent.dependencies.length * 12 + (agent.blast_radius?.length ?? 0) * 18 + economicImpactK(agent) / 10;
}
