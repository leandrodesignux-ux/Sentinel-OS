import { AgentCard } from "@/components/fleet/AgentCard";
import type { Agent, AgentStatus } from "@/types/agent";

type AgentGridProps = {
  agents: Agent[];
  statusFilter?: AgentStatus | "all";
};

export function AgentGrid({ agents, statusFilter = "all" }: AgentGridProps) {
  const visibleAgents = statusFilter === "all" ? agents : agents.filter((agent) => agent.status === statusFilter);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-5">
      {visibleAgents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
    </div>
  );
}
