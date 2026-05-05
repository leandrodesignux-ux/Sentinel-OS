import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types/agent";

export function PriorityBadge({ agent }: { agent: Agent }) {
  const impact = Math.round(agent.economic_risk.amount / 1000);
  const variant = agent.risk_level === "critical" ? "destructive" : agent.risk_level === "high" ? "warning" : "secondary";

  return <Badge variant={variant}>{`$${impact}K`}</Badge>;
}
