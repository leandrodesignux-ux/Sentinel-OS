import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/exceptions/PriorityBadge";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import type { Agent } from "@/types/agent";

export function ExceptionCard({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-data border bg-background/55 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm">{agent.id}</span>
        <div className="flex items-center gap-2">
          <PriorityBadge agent={agent} />
          <Badge variant="destructive">{agent.status}</Badge>
        </div>
      </div>
      <p className="mt-2 text-xs text-foreground/55">{agent.name} {agent.risk_level} / confidence {confidencePercent(agent)}%</p>
    </div>
  );
}
