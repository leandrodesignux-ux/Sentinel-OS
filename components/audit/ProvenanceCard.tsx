import { cn } from "@/lib/utils";
import type { Agent, DecisionStep } from "@/types/agent";

export function ProvenanceCard({ agent, step }: { agent: Agent; step?: DecisionStep }) {
  const confidence = step?.confidence ?? agent.confidence_score;

  return (
    <div className="rounded-data border bg-white p-3 font-display text-xs">
      <div className="text-[var(--text-muted)]">PROVENANCE</div>
      <div className="mt-2 grid grid-cols-[120px_1fr] gap-2">
        <span>Qué pasó</span><span className="text-[var(--status-accent)]">{step?.action ?? agent.current_task.description}</span>
        <span>Con qué datos</span><span className="text-[var(--status-accent)]">{step ? `${step.data_source} · ${step.input_tokens} tokens` : `${agent.metadata.region} · ${agent.metadata.tokens_used} tokens`}</span>
        <span>Modelo</span><span className="text-[var(--status-accent)]">{agent.metadata.model_version}</span>
        <span>Policy</span><span className="text-[var(--status-accent)]">{agent.metadata.prompt_policy}</span>
        <span>Cuándo</span><span className="text-[var(--status-accent)]">{step ? new Date(step.timestamp).toLocaleTimeString() : agent.metadata.last_human_touch}</span>
        <span>Riesgo aportado</span><span className="text-[var(--status-accent)]">{step?.risk_contribution ?? agent.risk_level}</span>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between"><span>Confianza</span><span>{Math.round(confidence * 100)}%</span></div>
        <div className="h-1.5 bg-muted">
          <div className={cn("h-full", confidence >= 0.9 ? "bg-ok" : confidence >= 0.8 ? "bg-warn" : "bg-critical")} style={{ width: `${confidence * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
