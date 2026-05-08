import type { AgentStatus } from "@/types/agent";
import { cn } from "@/lib/utils";

const statusClass: Record<AgentStatus, string> = {
  idle: "bg-ok text-green-700",
  running: "bg-primary text-[var(--status-accent)]",
  monitoring: "bg-warn text-yellow-700",
  intervention_required: "bg-critical text-red-600",
  circuit_open: "bg-critical text-red-600",
  suspended: "bg-muted text-[var(--text-muted)]",
};

export function StatusPulse({ status }: { status: AgentStatus }) {
  return <span className={cn("h-2 w-2 animate-status-pulse rounded-full shadow-glow", statusClass[status])} />;
}
