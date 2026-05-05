"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfidenceSparkline } from "@/components/charts/ConfidenceSparkline";
import { StatusPulse } from "@/components/fleet/StatusPulse";
import { DecisionAudit } from "@/components/audit/DecisionAudit";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK, isCriticalAgent } from "@/lib/utils/riskUtils";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

const statusTone = {
  idle: "border-ok/25 bg-ok/8 text-ok",
  running: "border-primary/30 bg-primary/10 text-primary",
  monitoring: "border-warn/35 bg-warn/10 text-warn",
  intervention_required: "animate-critical-breach border-critical/70 bg-critical/15 text-critical",
  circuit_open: "animate-critical-breach border-critical/80 bg-critical/20 text-critical",
  suspended: "border-border bg-muted text-foreground/50",
};

export function AgentCard({ agent }: { agent: Agent }) {
  const confidence = confidencePercent(agent);
  const impact = economicImpactK(agent);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={cn("group min-h-32 rounded-data border bg-card/70 p-2.5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow", statusTone[agent.status])}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-sm tracking-tight text-foreground">{agent.id}</p>
              <p className="mt-1 text-xs text-foreground/55">{agent.name} / {agent.metadata.region}</p>
            </div>
            <StatusPulse status={agent.status} />
          </div>
          <div className="mt-2 text-current">
            <ConfidenceSparkline agent={agent} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 font-display text-[11px]">
            <div><span className="text-foreground/45">RISK</span><p>{agent.risk_level}</p></div>
            <div><span className="text-foreground/45">CONF</span><p className={cn(confidence > 90 ? "text-ok" : confidence >= 80 ? "text-warn" : "text-critical")}>{confidence}%</p></div>
            <div><span className="text-foreground/45">USD</span><p>{impact}K</p></div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-accent text-2xl">Exception packet: {agent.id}</DialogTitle>
        <DialogDescription className="text-foreground/60">{agent.name} / {agent.current_task.description}</DialogDescription>
        <DecisionAudit agent={agent} compact={!isCriticalAgent(agent)} />
      </DialogContent>
    </Dialog>
  );
}
