import type { Agent } from "@/types/agent";

export function XAIPanel({ agent }: { agent: Agent }) {
  const factors = [
    ["confidence", Math.round((1 - agent.confidence_score) * 100)],
    ["economic", Math.min(100, Math.round(agent.economic_risk.amount / 1800))],
    ["cascade", Math.min(100, agent.dependencies.length * 20)],
  ] as const;

  return (
    <div className="rounded-data border bg-background/60 p-3">
      <p className="font-accent text-sm">XAI factors</p>
      <div className="mt-3 space-y-2">
        {factors.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[90px_1fr_40px] items-center gap-2 font-display text-xs">
            <span className="text-foreground/50">{label}</span>
            <div className="h-1.5 bg-muted"><div className="h-full bg-primary" style={{ width: `${value}%` }} /></div>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
