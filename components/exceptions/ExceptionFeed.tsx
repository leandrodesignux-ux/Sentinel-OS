"use client";

import { AlertTriangle } from "lucide-react";
import { BatchApproval } from "@/components/exceptions/BatchApproval";
import { ExceptionCard } from "@/components/exceptions/ExceptionCard";
import { useExceptionQueue } from "@/lib/hooks/useExceptionQueue";
import { getExceptionLabel, getExceptionPriority, groupExceptionsByKind, type ExceptionKind } from "@/lib/utils/exceptionUtils";

export function ExceptionFeed() {
  const { queuedAgents } = useExceptionQueue();
  const prioritizedAgents = [...queuedAgents].sort((left, right) => getExceptionPriority(right) - getExceptionPriority(left));
  const groups = Object.entries(groupExceptionsByKind(prioritizedAgents)) as [ExceptionKind, typeof prioritizedAgents][];
  const batchGroups = groups.filter(([, agents]) => agents.length > 3);

  return (
    <div className="animate-critical-breach rounded-data border border-critical/30 bg-critical/10 p-3 shadow-danger">
      <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-critical" /><h2 className="font-accent text-lg">Human escalation queue</h2></div>
      <div className="mt-3 space-y-2">
        {batchGroups.map(([kind, agents]) => (
          <div key={kind} className="rounded-data border border-warn/40 bg-background/65 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-xs text-warn">{agents.length} agentes con mismo error: {getExceptionLabel(kind)}</p>
              <BatchApproval kind={kind} agents={agents} />
            </div>
          </div>
        ))}
        {prioritizedAgents.slice(0, 10).map((agent) => <ExceptionCard key={agent.id} agent={agent} />)}
      </div>
    </div>
  );
}
