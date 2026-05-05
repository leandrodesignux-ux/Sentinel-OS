import { create } from "zustand";
import { generateAgentFleet } from "@/lib/mockData";
import type { Agent } from "@/types/agent";

export interface AgentException {
  agentId: string;
  reason: string;
  economicImpact: number;
  timestamp: string;
}

type AgentStore = {
  agents: Agent[];
  exceptions: AgentException[];
  threshold: number;
  setThreshold: (threshold: number) => void;
  updateAgent: (agentId: string, patch: Partial<Agent>) => void;
  addException: (exception: AgentException) => void;
  triggerCascade: (agentId: string, confidenceDrop: number) => void;
};

const initialAgents = generateAgentFleet();

export const useAgentStore = create<AgentStore>((set) => ({
  agents: initialAgents,
  exceptions: [],
  threshold: 72,
  setThreshold: (threshold) => set({ threshold }),
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
