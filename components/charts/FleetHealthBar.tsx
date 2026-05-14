import type { Agent } from "@/types/agent";

export function FleetHealthBar({ agents }: { agents: Agent[] }) {
  const running = agents.filter((a) => a.status === "running" || a.status === "idle").length;
  const monitoring = agents.filter((a) => a.status === "monitoring").length;
  const critical = agents.length - running - monitoring;
  const total = Math.max(agents.length, 1);

  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-[#3D4141]">
      <div style={{ width: `${(running / total) * 100}%`, background: "#34D399" }} />
      <div style={{ width: `${(monitoring / total) * 100}%`, background: "#FBBF24" }} />
      <div style={{ width: `${(critical / total) * 100}%`, background: "#F87171" }} />
    </div>
  );
}
