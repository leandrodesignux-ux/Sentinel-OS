import { DependencyGraph } from "@/components/audit/DependencyGraph";
import { DecisionLineage } from "@/components/audit/DecisionLineage";
import { ProvenanceCard } from "@/components/audit/ProvenanceCard";
import { XAIPanel } from "@/components/audit/XAIPanel";
import { economicImpactK } from "@/lib/utils/riskUtils";
import type { Agent } from "@/types/agent";

export function DecisionAudit({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Economic risk" value={`$${economicImpactK(agent)}K`} />
        <Metric label="Confidence" value={`${Math.round(agent.confidence_score * 100)}%`} />
        <Metric label="Assets" value={agent.economic_risk.affected_assets.toString()} />
      </div>
      <div className="rounded-data border bg-background/60 p-3">
        <p className="font-accent text-sm text-foreground">Recommended operator action</p>
        <p className="mt-2 text-sm text-foreground/65">{agent.exception_reason ?? "Continue monitoring current task until confidence or risk exits nominal envelope."}</p>
      </div>
      <DecisionLineage agent={agent} />
      {!compact && <DependencyGraph agent={agent} />}
      <div className="grid gap-3 md:grid-cols-2">
        <ProvenanceCard agent={agent} />
        <XAIPanel agent={agent} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-data border bg-card/75 p-3">
      <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">{label}</p>
      <p className="mt-1 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}
