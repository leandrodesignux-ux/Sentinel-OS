import { Search } from "lucide-react";
import { AgentCard } from "@/components/fleet/AgentCard";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

type AgentGridProps = {
  agents: Agent[];
  /** @deprecated Use typeFilter instead */
  statusFilter?: AgentStatus | "all";
  typeFilter?: AgentType | "all";
  searchQuery?: string;
};

export function AgentGrid({
  agents,
  statusFilter,
  typeFilter,
  searchQuery,
}: AgentGridProps) {
  // Determine the effective type filter (backward compatibility with statusFilter)
  const effectiveTypeFilter = typeFilter ?? (statusFilter as AgentType | "all") ?? "all";

  let visibleAgents = agents;

  // Filter by type (or legacy statusFilter)
  if (effectiveTypeFilter !== "all") {
    visibleAgents = visibleAgents.filter((agent) => agent.type === effectiveTypeFilter);
  }

  // Filter by search query (case-insensitive on name or id)
  if (searchQuery?.trim()) {
    const query = searchQuery.toLowerCase().trim();
    visibleAgents = visibleAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.id.toLowerCase().includes(query)
    );
  }

  // Empty state
  if (visibleAgents.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-[#6B7272]">
        <Search className="h-8 w-8 mb-3" />
        <span className="text-sm">Sin agentes que coincidan</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-2 xl:grid-cols-8 2xl:grid-cols-10">
      {visibleAgents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
