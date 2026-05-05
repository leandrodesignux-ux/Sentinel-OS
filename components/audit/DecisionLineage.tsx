import type { Agent } from "@/types/agent";

export function DecisionLineage({ agent }: { agent: Agent }) {
  return (
    <div className="space-y-2">
      {agent.decision_path.map((step) => (
        <div key={step.id} className="grid grid-cols-[1fr_auto] gap-3 border-l border-primary/30 pl-3 text-xs">
          <span className="text-foreground/65">{step.action}</span>
          <span className="font-display text-primary">{Math.round(step.confidence * 100)}%</span>
        </div>
      ))}
    </div>
  );
}
