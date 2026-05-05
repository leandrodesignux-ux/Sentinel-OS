import type { Agent } from "@/types/agent";

export function ProvenanceCard({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-data border bg-background/60 p-3 font-display text-xs">
      <div className="text-foreground/45">PROVENANCE</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <span>Model</span><span className="text-primary">{agent.metadata.model_version}</span>
        <span>Policy</span><span className="text-primary">{agent.metadata.prompt_policy}</span>
        <span>Tokens</span><span className="text-primary">{agent.metadata.tokens_used}</span>
        <span>Region</span><span className="text-primary">{agent.metadata.region}</span>
      </div>
    </div>
  );
}
