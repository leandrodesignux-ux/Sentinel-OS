"use client";

import { DecisionAudit } from "@/components/audit/DecisionAudit";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

export function DecisionAuditPanel({ agents }: { agents: Agent[] }) {
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];

  return (
    <section className="min-h-0 overflow-hidden rounded-data border bg-card/70 p-3 backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-accent text-xl">Decision audit</h2>
          <p className="font-display text-xs text-primary">{selectedAgent?.id} / {selectedAgent?.name}</p>
        </div>
        <span className="rounded-badge border px-2 py-1 font-display text-[10px] text-foreground/50">TIMELINE DAG</span>
      </div>
      <div className="h-[calc(100%-56px)] overflow-y-auto pr-1">
        {selectedAgent && <DecisionAudit agent={selectedAgent} />}
      </div>
    </section>
  );
}
