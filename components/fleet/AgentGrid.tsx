import { Search } from "lucide-react";
import { AgentCard } from "@/components/fleet/AgentCard";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

type AgentGridProps = {
  agents: Agent[];
  statusFilter?: AgentStatus | "all";
  typeFilter?: AgentType | "all";
  searchQuery?: string;
};

export function AgentGrid({ agents, statusFilter, typeFilter, searchQuery }: AgentGridProps) {
  const effectiveTypeFilter = typeFilter ?? (statusFilter as AgentType | "all") ?? "all";

  let visible = agents;

  if (effectiveTypeFilter !== "all") {
    visible = visible.filter((a) => a.type === effectiveTypeFilter);
  }

  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase().trim();
    visible = visible.filter((a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#6B7272]">
        <Search className="h-8 w-8 mb-3" />
        <span className="text-sm">Sin agentes que coincidan</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((agent, i) => (
        <AgentCard key={agent.id} agent={agent} index={i} />
      ))}
    </div>
  );
}
