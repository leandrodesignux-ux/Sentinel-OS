import { Badge } from "@/components/ui/badge";
import { getExceptionKind, getExceptionLabel } from "@/lib/utils/exceptionUtils";
import type { Agent } from "@/types/agent";

export function PriorityBadge({ agent }: { agent: Agent }) {
  const impact = Math.round(agent.economic_risk.amount / 1000);
  const kind = getExceptionKind(agent);
  const variant = kind === "critical" ? "destructive" : kind === "legal" || kind === "uncertainty" ? "warning" : "secondary";

  return <Badge variant={variant}>{`${getExceptionLabel(kind)} · $${impact}K`}</Badge>;
}
