import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/exceptions/PriorityBadge";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { getExceptionKind } from "@/lib/utils/exceptionUtils";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

const exceptionVariants: Variants = {
  enter: { x: 100, opacity: 0 },
  center: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
  exit: { x: -50, opacity: 0 },
};

export function ExceptionCard({ agent }: { agent: Agent }) {
  const kind = getExceptionKind(agent);

  return (
    <motion.div initial="enter" animate="center" exit="exit" variants={exceptionVariants} className={cn("rounded-data border bg-background/55 p-2", kind === "critical" && "border-critical/60 shadow-danger", kind === "legal" && "border-warn/60", kind === "cascade" && "border-accent/60", kind === "uncertainty" && "border-warn/40")}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm">{agent.id}</span>
        <div className="flex items-center gap-2">
          <PriorityBadge agent={agent} />
          <Badge variant="destructive">{agent.status}</Badge>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">{agent.name} / confidence {confidencePercent(agent)}% / blast {agent.blast_radius?.length ?? agent.dependencies.length}</p>
    </motion.div>
  );
}
