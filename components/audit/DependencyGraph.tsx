import type { Agent } from "@/types/agent";

export function DependencyGraph({ agent }: { agent: Agent }) {
  const nodes = [agent.id, ...agent.dependencies.slice(0, 4)];

  return (
    <svg viewBox="0 0 420 120" className="h-28 w-full rounded-data border bg-background/60">
      {nodes.map((node, index) => (
        <g key={node} transform={`translate(${40 + index * 88} 60)`}>
          {index > 0 && <line x1="-70" y1="0" x2="-16" y2="0" stroke="currentColor" className="text-primary/40" />}
          <circle r="16" className={index === 0 ? "fill-critical/40 stroke-critical" : "fill-primary/20 stroke-primary"} />
          <text y="36" textAnchor="middle" className="fill-current font-display text-[10px] text-foreground">{node}</text>
        </g>
      ))}
    </svg>
  );
}
