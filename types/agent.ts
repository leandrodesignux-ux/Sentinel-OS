export type AgentType = "sales" | "asset_mgmt" | "maintenance" | "screening";

export type AgentStatus =
  | "idle"
  | "running"
  | "monitoring"
  | "intervention_required"
  | "circuit_open"
  | "suspended";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface DecisionStep {
  id: string;
  timestamp: string;
  action: string;
  tool_used: string;
  confidence: number;
  data_source: string;
  input_tokens: number;
  output_summary: string;
  risk_contribution: number;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  confidence_score: number;
  confidence_history: number[];
  economic_risk: {
    amount: number;
    currency: "USD";
    category: "transaction" | "contract" | "maintenance" | "legal";
    affected_assets: number;
  };
  risk_level: RiskLevel;
  current_task: {
    description: string;
    started_at: string;
    estimated_completion: string;
    progress: number;
  };
  decision_path: DecisionStep[];
  metadata: {
    model_version: string;
    prompt_policy: string;
    region: string;
    tokens_used: number;
    last_human_touch: string;
    exceptions_today: number;
  };
  dependencies: string[];
  depends_on: string[];
  exception_reason?: string;
  blast_radius?: string[];
}
