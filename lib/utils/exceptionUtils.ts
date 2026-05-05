import type { Agent } from "@/types/agent";

export type ExceptionKind = "critical" | "legal" | "cascade" | "uncertainty" | "operational";

export function getExceptionKind(agent: Agent): ExceptionKind {
  if (agent.economic_risk.amount > 100000) return "critical";
  if (agent.type === "screening" || agent.economic_risk.category === "legal" || /fair housing|gdpr|protected-class/i.test(agent.exception_reason ?? agent.current_task.description)) return "legal";
  if ((agent.blast_radius?.length ?? agent.dependencies.length) > 5) return "cascade";
  if (agent.confidence_score < 0.7) return "uncertainty";
  return "operational";
}

export function getExceptionLabel(kind: ExceptionKind) {
  return {
    critical: "CRÍTICO",
    legal: "LEGAL",
    cascade: "CASCADA",
    uncertainty: "ALTA INCERTIDUMBRE",
    operational: "OPERACIONAL",
  }[kind];
}

export function getExceptionPriority(agent: Agent) {
  const kind = getExceptionKind(agent);
  const kindWeight = {
    critical: 5,
    legal: 4,
    cascade: 3,
    uncertainty: 2,
    operational: 1,
  }[kind];

  return agent.economic_risk.amount + kindWeight * 1_000_000;
}

export function groupExceptionsByKind(agents: Agent[]) {
  return agents.reduce<Record<ExceptionKind, Agent[]>>((groups, agent) => {
    const kind = getExceptionKind(agent);
    groups[kind] = [...(groups[kind] ?? []), agent];
    return groups;
  }, {} as Record<ExceptionKind, Agent[]>);
}
