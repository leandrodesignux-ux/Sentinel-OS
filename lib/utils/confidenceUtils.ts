import type { Agent } from "@/types/agent";

export function confidencePercent(agent: Agent) {
  return Math.round(agent.confidence_score * 100);
}

export function confidenceTone(confidence: number) {
  if (confidence >= 0.9) return "ok";
  if (confidence >= 0.8) return "warn";
  return "critical";
}

export function isConfidenceException(agent: Agent) {
  return agent.confidence_score < 0.8 || (agent.type === "screening" && agent.confidence_score < 0.95);
}
