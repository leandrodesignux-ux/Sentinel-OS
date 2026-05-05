import type { Agent } from "@/types/agent";

export function KPITicker({ agents }: { agents: Agent[] }) {
  const avgConfidence = Math.round((agents.reduce((sum, agent) => sum + agent.confidence_score, 0) / Math.max(agents.length, 1)) * 100);
  const exceptions = agents.filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended").length;

  return (
    <div className="grid grid-cols-3 gap-2 font-display text-xs">
      <div><span className="text-foreground/45">AVG CONF</span><p className="text-primary">{avgConfidence}%</p></div>
      <div><span className="text-foreground/45">EXC RATE</span><p className="text-warn">{exceptions}/50</p></div>
      <div><span className="text-foreground/45">TOKENS</span><p className="text-ok">{Math.round(agents.reduce((sum, agent) => sum + agent.metadata.tokens_used, 0) / 1000)}K</p></div>
    </div>
  );
}
