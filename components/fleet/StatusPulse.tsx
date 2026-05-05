import type { AgentStatus } from "@/types/agent";
import { cn } from "@/lib/utils";

const statusClass: Record<AgentStatus, string> = {
  idle: "bg-ok text-ok",
  running: "bg-primary text-primary",
  monitoring: "bg-warn text-warn",
  intervention_required: "bg-critical text-critical",
  circuit_open: "bg-critical text-critical",
  suspended: "bg-muted text-foreground/50",
};

export function StatusPulse({ status }: { status: AgentStatus }) {
  return <span className={cn("h-2 w-2 animate-status-pulse rounded-full shadow-glow", statusClass[status])} />;
}
