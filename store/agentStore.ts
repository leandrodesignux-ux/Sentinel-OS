import { create } from "zustand";
import { generateAgentFleet } from "@/lib/mockData";
import type { Agent } from "@/types/agent";

export interface AgentException {
  agentId: string;
  reason: string;
  economicImpact: number;
  timestamp: string;
}

export type EmergencyScope = "all" | "critical" | "sales" | "asset_mgmt" | "maintenance" | "screening";
export type CircuitBreakerLevel = 0 | 1 | 2 | 3 | 4;

export type EmergencyHalt = {
  active: boolean;
  scope: EmergencyScope;
  affectedAgentIds: string[];
  startedAt?: string;
  undoExpiresAt?: string;
};

type AgentStore = {
  agents: Agent[];
  exceptions: AgentException[];
  threshold: number;
  selectedAgentId?: string;
  emergencyHalt: EmergencyHalt;
  circuitBreakers: Record<string, CircuitBreakerLevel>;
  setThreshold: (threshold: number) => void;
  selectAgent: (agentId: string) => void;
  triggerEmergencyHalt: (scope: EmergencyScope) => void;
  reactivateFleet: () => void;
  setCircuitBreakerLevel: (agentId: string, level: CircuitBreakerLevel) => void;
  updateAgent: (agentId: string, patch: Partial<Agent>) => void;
  addException: (exception: AgentException) => void;
  triggerCascade: (agentId: string, confidenceDrop: number) => void;
};

const initialAgents = generateAgentFleet();

function shouldRequireHuman(agent: Agent, autonomy: number) {
  const requiredConfidence = autonomy / 100;
  if (agent.status === "suspended" || agent.status === "circuit_open") return true;
  if (agent.confidence_score < requiredConfidence) return true;
  if (agent.economic_risk.amount > 50000 && agent.confidence_score < Math.min(0.98, requiredConfidence + 0.08)) return true;
  if (agent.type === "screening" && agent.confidence_score < Math.max(0.95, requiredConfidence)) return true;
  return false;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: initialAgents,
  exceptions: [],
  threshold: 75,
  selectedAgentId: initialAgents[0]?.id,
  emergencyHalt: { active: false, scope: "all", affectedAgentIds: [] },
  circuitBreakers: {},
  setThreshold: (threshold) =>
    set((state) => {
      const now = new Date().toISOString();
      const agents = state.agents.map((agent) => {
        const requiresHuman = shouldRequireHuman(agent, threshold);

        if (agent.status === "suspended" || agent.status === "circuit_open") return agent;
        if (requiresHuman) return { ...agent, status: "intervention_required" as const };
        if (agent.status === "intervention_required" || agent.status === "monitoring") return { ...agent, status: "running" as const };
        return agent;
      });
      const exceptions = agents
        .filter((agent) => shouldRequireHuman(agent, threshold))
        .map((agent) => ({
          agentId: agent.id,
          reason: `Autonomy threshold ${threshold}% requires human review.`,
          economicImpact: agent.economic_risk.amount,
          timestamp: now,
        }))
        .sort((left, right) => right.economicImpact - left.economicImpact)
        .slice(0, 50);

      return { agents, exceptions, threshold };
    }),
  selectAgent: (agentId) => set({ selectedAgentId: agentId }),
  triggerEmergencyHalt: (scope) =>
    set((state) => {
      const affectedAgents = state.agents.filter((agent) => {
        if (scope === "all") return agent.status !== "suspended";
        if (scope === "critical") return agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical";
        return agent.type === scope;
      });
      const now = Date.now();

      return {
        emergencyHalt: {
          active: true,
          scope,
          affectedAgentIds: affectedAgents.map((agent) => agent.id),
          startedAt: new Date(now).toISOString(),
          undoExpiresAt: new Date(now + 30_000).toISOString(),
        },
        agents: state.agents.map((agent) => (affectedAgents.some((affected) => affected.id === agent.id) ? { ...agent, status: "suspended" } : agent)),
      };
    }),
  reactivateFleet: () =>
    set((state) => ({
      emergencyHalt: { active: false, scope: "all", affectedAgentIds: [] },
      agents: state.agents.map((agent) => (state.emergencyHalt.affectedAgentIds.includes(agent.id) ? { ...agent, status: "running" } : agent)),
    })),
  setCircuitBreakerLevel: (agentId, level) =>
    set((state) => ({
      circuitBreakers: { ...state.circuitBreakers, [agentId]: level },
      agents: state.agents.map((agent) => {
        if (agent.id !== agentId) return agent;
        if (level === 0) return { ...agent, status: "running" };
        if (level === 4) return { ...agent, status: "suspended" };
        if (level >= 3) return { ...agent, status: "circuit_open" };
        return { ...agent, status: "monitoring" };
      }),
    })),
  updateAgent: (agentId, patch) =>
    set((state) => ({
      agents: state.agents.map((agent) => (agent.id === agentId ? { ...agent, ...patch } : agent)),
    })),
  addException: (exception) =>
    set((state) => {
      const exists = state.exceptions.some((item) => item.agentId === exception.agentId && item.reason === exception.reason);

      if (exists) {
        return state;
      }

      return {
        exceptions: [exception, ...state.exceptions]
          .sort((left, right) => right.economicImpact - left.economicImpact)
          .slice(0, 50),
      };
    }),
  triggerCascade: (agentId, confidenceDrop) =>
    set((state) => {
      const source = state.agents.find((agent) => agent.id === agentId);
      const impacted = new Set(source ? source.dependencies.concat(source.blast_radius ?? []) : []);

      return {
        agents: state.agents.map((agent) => {
          if (!impacted.has(agent.id)) {
            return agent;
          }

          const confidence = Math.max(0.5, agent.confidence_score - confidenceDrop);

          return {
            ...agent,
            confidence_score: confidence,
            confidence_history: [...agent.confidence_history.slice(-19), confidence],
            status: confidence < 0.8 ? "intervention_required" : agent.status,
          };
        }),
      };
    }),
}));
