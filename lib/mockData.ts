import type { Agent, AgentStatus, AgentType, DecisionStep, RiskLevel } from "@/types/agent";

const regions = ["MIA", "BOG", "CDMX", "SCL", "LIM", "MAD"];
const taskDescriptions = {
  sales: "Qualifying inbound PropTech lead and preparing lease offer",
  asset_mgmt: "Reconciling portfolio exposure and NOI variance",
  maintenance: "Coordinating urgent work order with vendor network",
  screening: "Evaluating tenant application and Fair Housing signals",
};
const actions = [
  "Evaluated tenant credit score",
  "Checked lease compliance policy",
  "Queried property maintenance ledger",
  "Scored economic exposure",
  "Validated regional operating constraint",
  "Generated recommended containment action",
  "Compared anomaly against historical baseline",
  "Resolved dependency state from upstream agent",
];

function agentIdentity(index: number): { type: AgentType; name: string } {
  if (index < 20) {
    return { type: "sales", name: `Aria-S${String(index + 1).padStart(2, "0")}` };
  }

  if (index < 35) {
    return { type: "asset_mgmt", name: `Rex-A${String(index - 19).padStart(2, "0")}` };
  }

  if (index < 45) {
    return { type: "maintenance", name: `Orion-M${String(index - 34).padStart(2, "0")}` };
  }

  return { type: "screening", name: `Nova-N${String(index - 44).padStart(2, "0")}` };
}

function riskLevelFromAmount(amount: number, confidence: number): RiskLevel {
  if (amount > 120000 || confidence < 0.62) return "critical";
  if (amount > 50000 || confidence < 0.8) return "high";
  if (amount > 18000 || confidence < 0.9) return "medium";
  return "low";
}

function shouldIntervene(agent: Pick<Agent, "confidence_score" | "economic_risk" | "risk_level" | "type" | "dependencies">) {
  return (
    agent.confidence_score < 0.8 ||
    (agent.economic_risk.amount > 50000 && agent.confidence_score < 0.92) ||
    agent.risk_level === "critical" ||
    (agent.type === "screening" && agent.confidence_score < 0.95) ||
    (agent.dependencies.length > 3 && agent.confidence_score < 0.85)
  );
}

function buildDecisionPath(agentId: string, index: number, confidence: number, scenario?: string): DecisionStep[] {
  const length = 3 + (index % 6);

  return Array.from({ length }, (_, stepIndex) => ({
    id: `${agentId}-STEP-${String(stepIndex + 1).padStart(2, "0")}`,
    timestamp: new Date(Date.now() - (length - stepIndex) * 90_000 - index * 7_000).toISOString(),
    action: scenario && stepIndex === 1 ? scenario : actions[(index + stepIndex) % actions.length],
    tool_used: ["credit_bureau_api", "lease_policy_engine", "asset_graph_query", "vendor_sla_router"][stepIndex % 4],
    confidence: Math.max(0.42, Math.min(0.99, confidence - stepIndex * 0.018 + (index % 5) * 0.006)),
    data_source: ["Experian API v2.1", "Yardi Voyager", "Internal Asset Graph", "ServiceChannel API"][stepIndex % 4],
    input_tokens: 820 + index * 17 + stepIndex * 143,
    output_summary: scenario && stepIndex === 1 ? "Scenario anomaly detected and escalated into exception queue." : "Signal processed and propagated into fleet risk posture.",
    risk_contribution: Math.round((index % 9) * 2.7 + stepIndex * 1.8),
  }));
}

function targetStatus(index: number): AgentStatus {
  if (index < 30) return "running";
  if (index < 38) return "monitoring";
  if (index < 45) return "intervention_required";
  if (index < 48) return "idle";
  return index === 48 ? "circuit_open" : "suspended";
}

function confidenceForStatus(status: AgentStatus, index: number) {
  if (status === "running") return 0.92 + (index % 7) * 0.01;
  if (status === "monitoring") return 0.81 + (index % 7) * 0.012;
  if (status === "intervention_required") return 0.66 + (index % 8) * 0.025;
  if (status === "idle") return 0.94 + (index % 3) * 0.01;
  if (status === "circuit_open") return 0.74;
  return 0.58;
}

function buildAgent(index: number): Agent {
  const id = `AGT-${String(index + 1).padStart(3, "0")}`;
  const forcedStatus = targetStatus(index);
  const scenario = index === 24 ? "Pricing feedback loop detected across comparable lease offers" : index === 46 ? "Potential protected-class proxy bias detected in screening model" : index === 42 ? "Maintenance retry storm detected against vendor dispatch API" : undefined;
  const identity = agentIdentity(index);
  const type = identity.type;
  const confidence = scenario ? (index === 24 ? 0.88 : index === 46 ? 0.91 : 0.76) : confidenceForStatus(forcedStatus, index);
  const dependencies = index === 24 ? ["AGT-026", "AGT-027", "AGT-028", "AGT-029"] : index < 47 ? [`AGT-${String(index + 2).padStart(3, "0")}`] : [];
  const dependsOn = index > 2 && index % 4 === 0 ? [`AGT-${String(index - 1).padStart(3, "0")}`] : [];
  const amount = scenario ? (index === 24 ? 184000 : index === 46 ? 72000 : 128000) : Math.round((1 - confidence) * 210000 + (index % 11) * 4500);
  const riskLevel = scenario ? "critical" : riskLevelFromAmount(amount, confidence);
  const provisional = {
    confidence_score: confidence,
    economic_risk: { amount },
    risk_level: riskLevel,
    type,
    dependencies,
  } as Pick<Agent, "confidence_score" | "economic_risk" | "risk_level" | "type" | "dependencies">;
  const exception = shouldIntervene(provisional);
  const status: AgentStatus = forcedStatus === "running" && exception ? "intervention_required" : forcedStatus;

  return {
    id,
    name: identity.name,
    type,
    status,
    confidence_score: confidence,
    confidence_history: Array.from({ length: 20 }, (_, point) => Math.max(0.35, Math.min(0.99, confidence + Math.sin(point + index) * 0.055 - (point % 5) * 0.006))),
    economic_risk: {
      amount,
      currency: "USD",
      category: type === "maintenance" ? "maintenance" : type === "screening" ? "legal" : type === "asset_mgmt" ? "contract" : "transaction",
      affected_assets: scenario ? 8 + (index % 5) : 1 + (index % 9),
    },
    risk_level: riskLevel,
    current_task: {
      description: scenario ?? taskDescriptions[type],
      started_at: new Date(Date.now() - (index + 4) * 240_000).toISOString(),
      estimated_completion: new Date(Date.now() + (12 + index) * 180_000).toISOString(),
      progress: Math.min(98, 14 + ((index * 13) % 84)),
    },
    decision_path: buildDecisionPath(id, index, confidence, scenario),
    metadata: {
      model_version: index % 3 === 0 ? "claude-3-sonnet-20241022" : "gpt-4.1-ops-2025-04",
      prompt_policy: "proptech-v2.3.1",
      region: regions[index % regions.length],
      tokens_used: 2800 + index * 391,
      last_human_touch: `${index % 12}h ago`,
      exceptions_today: exception || status === "circuit_open" || status === "suspended" ? 2 + (index % 5) : index % 2,
    },
    dependencies,
    depends_on: dependsOn,
    exception_reason: exception ? scenario ?? "Exception rule triggered by confidence, economic risk, policy exposure, or cascade dependency risk." : status === "circuit_open" ? "Circuit breaker activated by critical economic exposure." : status === "suspended" ? "Emergency stop requested by operator." : undefined,
    blast_radius: exception || status === "circuit_open" ? dependencies.concat(dependsOn) : undefined,
  };
}

export function generateAgentFleet(): Agent[] {
  return Array.from({ length: 50 }, (_, index) => buildAgent(index));
}
