import { getExceptionKind, getExceptionLabel } from "@/lib/utils/exceptionUtils";
import type { Agent } from "@/types/agent";

export function PriorityBadge({ agent }: { agent: Agent }) {
  const impact = Math.round(agent.economic_risk.amount / 1000);
  const kind = getExceptionKind(agent);
  
  const badgeStyles = {
    critical: "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]",
    legal: "bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]",
    uncertainty: "bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]",
    standard: "bg-[#6B7272]/10 border-[#6B7272]/30 text-[#6B7272]",
  };
  
  const style = kind === "critical" ? badgeStyles.critical 
    : kind === "legal" ? badgeStyles.legal 
    : kind === "uncertainty" ? badgeStyles.uncertainty 
    : badgeStyles.standard;

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${style}`}>
      {`${getExceptionLabel(kind)} · $${impact}K`}
    </span>
  );
}
