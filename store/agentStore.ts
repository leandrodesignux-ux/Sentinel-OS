import { create } from "zustand";
import { generateAgentFleet } from "@/lib/mockData";
import type { Agent } from "@/types/agent";

export interface AgentException {
  agentId: string;
  reason: string;
  economicImpact: number;
  timestamp: string;
  scenario?: "price_loop" | "screening_bias" | "retry_storm";
  affectedAgentIds?: string[];
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

export type ActiveScenario = {
  mode: "price_loop" | "screening_bias" | "retry_storm";
  affectedAgentIds: string[];
  startedAt: string;
} | null;

type AgentStore = {
  agents: Agent[];
  exceptions: AgentException[];
  threshold: number;
  selectedAgentId?: string;
  emergencyHalt: EmergencyHalt;
  circuitBreakers: Record<string, CircuitBreakerLevel>;
  activeScenario: ActiveScenario;
  setThreshold: (threshold: number) => void;
  selectAgent: (agentId: string) => void;
  approveAgent: (agentId: string) => void;
  activatePriceLoopScenario: () => void;
  activateScreeningBiasScenario: () => void;
  activateRetryStormScenario: () => void;
  containScenarioFamily: () => void;
  forceScreeningHITL: () => void;
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
  activeScenario: null,
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
  approveAgent: (agentId) =>
    set((state) => ({
      agents: state.agents.map((a) => a.id === agentId ? { ...a, status: "idle" as const } : a),
    })),
  activatePriceLoopScenario: () =>
    set((state) => {
      const affectedAgentIds = ["AGT-007", "AGT-008", "AGT-009", "AGT-010", "AGT-011", "AGT-012", "AGT-013", "AGT-014", "AGT-015", "AGT-016", "AGT-017", "AGT-018", "AGT-019"];
      const now = new Date().toISOString();

      return {
        activeScenario: { mode: "price_loop", affectedAgentIds, startedAt: now },
        selectedAgentId: "AGT-007",
        agents: state.agents.map((agent) => {
          if (!affectedAgentIds.includes(agent.id)) return agent;

          return {
            ...agent,
            status: "intervention_required",
            confidence_score: Math.max(0.52, agent.confidence_score - 0.22),
            economic_risk: {
              ...agent.economic_risk,
              amount: agent.id === "AGT-007" ? 2_300_000 : Math.round(agent.economic_risk.amount * 1.2),
              category: "contract",
              affected_assets: Math.max(agent.economic_risk.affected_assets, 12),
            },
            risk_level: "critical",
            exception_reason: "CASCADA DETECTADA - Price feedback loop: dato corrupto aumentó precio 20% y fue replicado por dependientes.",
            blast_radius: affectedAgentIds.filter((id) => id !== agent.id),
          };
        }),
        exceptions: [{
          agentId: "AGT-007",
          reason: "CASCADA DETECTADA - 13 agentes afectados - $2.3M en riesgo",
          economicImpact: 2_300_000,
          timestamp: now,
          scenario: "price_loop",
          affectedAgentIds,
        }, ...state.exceptions],
      };
    }),
  activateScreeningBiasScenario: () =>
    set((state) => {
      const affectedAgentIds = ["AGT-048"];
      const now = new Date().toISOString();

      return {
        activeScenario: { mode: "screening_bias", affectedAgentIds, startedAt: now },
        selectedAgentId: "AGT-048",
        agents: state.agents.map((agent) => {
          if (agent.id !== "AGT-048") return agent;

          return {
            ...agent,
            status: "intervention_required",
            confidence_score: 0.91,
            economic_risk: {
              ...agent.economic_risk,
              amount: 680000,
              category: "legal",
              affected_assets: 5,
            },
            risk_level: "critical",
            exception_reason: "Fair Housing Act potencial violación: tasa de rechazo 73% vs. baseline 22%.",
            blast_radius: ["AGT-046", "AGT-047", "AGT-049", "AGT-050"],
          };
        }),
        exceptions: [{
          agentId: "AGT-048",
          reason: "Fair Housing Act potencial violación",
          economicImpact: 680000,
          timestamp: now,
          scenario: "screening_bias",
          affectedAgentIds,
        }, ...state.exceptions],
      };
    }),
  activateRetryStormScenario: () =>
    set((state) => {
      const affectedAgentIds = ["AGT-040"];
      const now = new Date().toISOString();

      return {
        activeScenario: { mode: "retry_storm", affectedAgentIds, startedAt: now },
        selectedAgentId: "AGT-040",
        circuitBreakers: { ...state.circuitBreakers, "AGT-040": 2 },
        agents: state.agents.map((agent) => {
          if (agent.id !== "AGT-040") return agent;

          return {
            ...agent,
            status: "monitoring",
            confidence_score: 0.74,
            economic_risk: {
              ...agent.economic_risk,
              amount: 120000,
              category: "maintenance",
              affected_assets: 6,
            },
            risk_level: "high",
            exception_reason: "Budget cap al 50% - Retry storm contra HVAC provider. State Freeze aplicado automáticamente.",
            blast_radius: ["AGT-039", "AGT-041", "AGT-042"],
          };
        }),
        exceptions: [{
          agentId: "AGT-040",
          reason: "Budget cap al 50% - Requiere aprobación para continuar",
          economicImpact: 120000,
          timestamp: now,
          scenario: "retry_storm",
          affectedAgentIds,
        }, ...state.exceptions],
      };
    }),
  containScenarioFamily: () =>
    set((state) => {
      const affected = state.activeScenario?.affectedAgentIds ?? [];

      return {
        activeScenario: null,
        agents: state.agents.map((agent) => affected.includes(agent.id) ? { ...agent, status: "monitoring", confidence_score: Math.max(agent.confidence_score, 0.82) } : agent),
        exceptions: state.exceptions.filter((exception) => exception.scenario !== state.activeScenario?.mode),
      };
    }),
  forceScreeningHITL: () =>
    set((state) => ({
      agents: state.agents.map((agent) => agent.type === "screening" ? { ...agent, status: "intervention_required", exception_reason: "Forced HITL 100% for screening decisions after Fair Housing flag." } : agent),
      exceptions: [
        ...state.agents
          .filter((agent) => agent.type === "screening")
          .map((agent) => ({
            agentId: agent.id,
            reason: "Screening HITL 100% enforced",
            economicImpact: agent.economic_risk.amount,
            timestamp: new Date().toISOString(),
            scenario: "screening_bias" as const,
            affectedAgentIds: [agent.id],
          })),
        ...state.exceptions,
      ].slice(0, 50),
    })),
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
