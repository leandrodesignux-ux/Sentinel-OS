import { cn } from "@/lib/utils";
import type { Agent, DecisionStep } from "@/types/agent";

export function ProvenanceCard({ agent, step }: { agent: Agent; step?: DecisionStep }) {
  const confidence = step?.confidence ?? agent.confidence_score;

  return (
    <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3 font-display text-xs">
      <div className="text-[#6B7272] uppercase tracking-wider text-[10px] mb-2">PROVENANCE</div>
      <div className="mt-2 grid grid-cols-[120px_1fr] gap-2">
        <span className="text-[#A8AFAF]">Qué pasó</span><span className="text-[#D7FEFA]">{step?.action ?? agent.current_task.description}</span>
        <span className="text-[#A8AFAF]">Con qué datos</span><span className="text-[#D7FEFA]">{step ? `${step.data_source} · ${step.input_tokens} tokens` : `${agent.metadata.region} · ${agent.metadata.tokens_used} tokens`}</span>
        <span className="text-[#A8AFAF]">Modelo</span><span className="text-[#D7FEFA]">{agent.metadata.model_version}</span>
        <span className="text-[#A8AFAF]">Policy</span><span className="text-[#D7FEFA]">{agent.metadata.prompt_policy}</span>
        <span className="text-[#A8AFAF]">Cuándo</span><span className="text-[#D7FEFA]">{step ? new Date(step.timestamp).toLocaleTimeString() : agent.metadata.last_human_touch}</span>
        <span className="text-[#A8AFAF]">Riesgo aportado</span><span className="text-[#D7FEFA]">{step?.risk_contribution ?? agent.risk_level}</span>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between"><span className="text-[#6B7272]">Confianza</span><span className="text-white">{Math.round(confidence * 100)}%</span></div>
        <div className="h-1.5 bg-[#3D4141] rounded-full overflow-hidden">
          <div className={cn("h-full", confidence >= 0.9 ? "bg-[#34D399]" : confidence >= 0.8 ? "bg-[#FBBF24]" : "bg-[#F87171]")} style={{ width: `${confidence * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
