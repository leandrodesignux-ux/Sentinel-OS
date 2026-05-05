import type { Agent } from "@/types/agent";

export function FleetHealthBar({ agents }: { agents: Agent[] }) {
  const running = agents.filter((agent) => agent.status === "running" || agent.status === "idle").length;
  const monitoring = agents.filter((agent) => agent.status === "monitoring").length;
  const critical = agents.length - running - monitoring;
  const total = Math.max(agents.length, 1);

  return (
    <div className="flex h-2 overflow-hidden rounded-badge border bg-background">
      <div className="bg-ok" style={{ width: `${(running / total) * 100}%` }} />
      <div className="bg-warn" style={{ width: `${(monitoring / total) * 100}%` }} />
      <div className="bg-critical" style={{ width: `${(critical / total) * 100}%` }} />
    </div>
  );
}
