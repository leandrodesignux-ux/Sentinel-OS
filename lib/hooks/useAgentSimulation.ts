"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

interface SimulationConfig {
  tickInterval?: number;
  volatility: "low" | "medium" | "high";
  scenarioMode?: "normal" | "cascade_failure" | "price_loop" | "storm";
}

const volatilityScale = {
  low: 0.018,
  medium: 0.04,
  high: 0.075,
};

function evaluateExceptionLogic(agent: Agent, confidence: number): boolean {
  if (confidence < 0.8) return true;
  if (agent.economic_risk.amount > 50000 && confidence < 0.92) return true;
  if (agent.risk_level === "critical") return true;
  if (agent.type === "screening" && confidence < 0.95) return true;
  if (agent.dependencies.length > 3 && confidence < 0.85) return true;
  if (agent.economic_risk.category === "contract" && confidence < 0.98) return true;
  return false;
}

function generateExceptionReason(agent: Agent, confidence: number): string {
  if (confidence < 0.8) return `Confidence dropped to ${Math.round(confidence * 100)}%.`;
  if (agent.risk_level === "critical") return "Critical risk level requires operator review.";
  if (agent.type === "screening" && confidence < 0.95) return "Fair Housing screening confidence below compliance envelope.";
  if (agent.dependencies.length > 3 && confidence < 0.85) return "Cascade dependency risk detected.";
  if (agent.economic_risk.amount > 50000 && confidence < 0.92) return "High economic exposure with sub-threshold confidence.";
  if (agent.economic_risk.category === "contract" && confidence < 0.98) return "Contract-risk agent requires elevated confidence.";
  return "Exception rule triggered.";
}

function scenarioSource(mode: SimulationConfig["scenarioMode"]) {
  if (mode === "cascade_failure" || mode === "price_loop") return "AGT-025";
  if (mode === "storm") return "AGT-043";
  return undefined;
}

export function useAgentSimulation(config: SimulationConfig) {
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickInterval = config.tickInterval ?? 2000;
  const volatility = config.volatility;
  const scenarioMode = config.scenarioMode;

  // Use refs to access store imperatively, avoiding re-runs of the effect
  const storeApi = useRef(useAgentStore);

  const simulateTick = useCallback(() => {
    const { agents, updateAgent, addException, triggerCascade } = storeApi.current.getState();

    agents.forEach((agent) => {
      if (agent.status === "suspended" || agent.status === "circuit_open") return;

      const complexTaskMultiplier =
        agent.dependencies.length > 3 || agent.economic_risk.amount > 50000 ? 1.45 : 1;
      const drift = (Math.random() - 0.48) * volatilityScale[volatility] * complexTaskMultiplier;
      const newConfidence = Math.max(0.5, Math.min(1, agent.confidence_score + drift));
      const shouldEscalate = evaluateExceptionLogic(agent, newConfidence);

      if (shouldEscalate && agent.status === "running") {
        addException({
          agentId: agent.id,
          reason: generateExceptionReason(agent, newConfidence),
          economicImpact: agent.economic_risk.amount,
          timestamp: new Date().toISOString(),
        });
      }

      updateAgent(agent.id, {
        confidence_score: newConfidence,
        confidence_history: [...agent.confidence_history.slice(-19), newConfidence],
        status: shouldEscalate ? "intervention_required" : agent.status,
      });
    });

    const source = scenarioSource(scenarioMode);
    if (source) {
      triggerCascade(source, scenarioMode === "storm" ? 0.09 : 0.15);
    }
  }, [volatility, scenarioMode]);

  useEffect(() => {
    tickRef.current = setInterval(simulateTick, tickInterval);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [simulateTick, tickInterval]);
}
