"use client";

import { useAgentStore } from "@/store/agentStore";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

export function DependencyGraph({ agent }: { agent: Agent }) {
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const agents = useAgentStore((state) => state.agents);
  const upstream = agent.depends_on.slice(0, 4);
  const downstream = agent.dependencies.slice(0, 5);
  const blastRadius = new Set(agent.blast_radius ?? []);
  const isCritical = agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended" || agent.risk_level === "critical";

  function dependencyWeight(nodeId: string) {
    const linkedAgent = agents.find((item) => item.id === nodeId);
    return Math.max(1, Math.min(5, Math.round(((linkedAgent?.economic_risk.amount ?? agent.economic_risk.amount) / 50000) + 1)));
  }

  function nodeLabel(nodeId: string) {
    return agents.find((item) => item.id === nodeId)?.name ?? nodeId;
  }

  return (
    <svg viewBox="0 0 680 260" className="h-64 w-full rounded-data border bg-background/60">
      <defs>
        <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-primary" />
        </marker>
        <marker id="arrow-red" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-critical" />
        </marker>
      </defs>

      {upstream.map((node, index) => {
        const y = 55 + index * 44;
        const weight = dependencyWeight(node);

        return (
          <g key={`up-${node}`}>
            <line x1="170" y1={y} x2="315" y2="130" stroke="currentColor" strokeWidth={weight} markerEnd="url(#arrow-blue)" className="text-primary/45" />
            <GraphNode x={110} y={y} label={node} subtitle={nodeLabel(node)} tone="upstream" onClick={() => selectAgent(node)} />
          </g>
        );
      })}

      {downstream.map((node, index) => {
        const y = 40 + index * 42;
        const weight = dependencyWeight(node);
        const inBlast = blastRadius.has(node);

        return (
          <g key={`down-${node}`} className={cn(isCritical && inBlast && "animate-signal-blink")}>
            <line x1="365" y1="130" x2="510" y2={y} stroke="currentColor" strokeWidth={weight} markerEnd="url(#arrow-red)" className={cn(inBlast ? "text-critical" : "text-critical/45")} />
            <GraphNode x={570} y={y} label={node} subtitle={nodeLabel(node)} tone={inBlast ? "blast" : "downstream"} onClick={() => selectAgent(node)} />
          </g>
        );
      })}

      {isCritical && <circle cx="340" cy="130" r="52" className="animate-critical-breach fill-transparent stroke-critical/40" />}
      <GraphNode x={340} y={130} label={agent.id} subtitle={agent.name} tone="center" onClick={() => selectAgent(agent.id)} />
    </svg>
  );
}

function GraphNode({ x, y, label, subtitle, tone, onClick }: { x: number; y: number; label: string; subtitle: string; tone: "center" | "upstream" | "downstream" | "blast"; onClick: () => void }) {
  const circleClass = {
    center: "fill-critical/35 stroke-critical",
    upstream: "fill-primary/20 stroke-primary",
    downstream: "fill-critical/20 stroke-critical/70",
    blast: "fill-critical/45 stroke-critical",
  }[tone];

  return (
    <g className="cursor-pointer" onClick={onClick} transform={`translate(${x} ${y})`}>
      <circle r={tone === "center" ? 24 : 18} className={circleClass} />
      <text y={tone === "center" ? 4 : 3} textAnchor="middle" className="pointer-events-none fill-current font-display text-[10px] text-foreground">{label}</text>
      <text y={tone === "center" ? 40 : 34} textAnchor="middle" className="pointer-events-none fill-current text-[9px] text-foreground/45">{subtitle.slice(0, 18)}</text>
    </g>
  );
}
