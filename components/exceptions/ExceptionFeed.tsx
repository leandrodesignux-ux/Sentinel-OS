"use client";

import { AlertTriangle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { BatchApproval } from "@/components/exceptions/BatchApproval";
import { ExceptionCard } from "@/components/exceptions/ExceptionCard";
import { useExceptionQueue } from "@/lib/hooks/useExceptionQueue";
import { getExceptionLabel, getExceptionPriority, groupExceptionsByKind, type ExceptionKind } from "@/lib/utils/exceptionUtils";
import { useAgentStore } from "@/store/agentStore";

export function ExceptionFeed() {
  const { queuedAgents } = useExceptionQueue();
  const prioritizedAgents = [...queuedAgents].sort((left, right) => getExceptionPriority(right) - getExceptionPriority(left));
  const groups = Object.entries(groupExceptionsByKind(prioritizedAgents)) as [ExceptionKind, typeof prioritizedAgents][];
  const batchGroups = groups.filter(([, agents]) => agents.length > 3);
  const activeScenario = useAgentStore((state) => state.activeScenario);
  const containScenarioFamily = useAgentStore((state) => state.containScenarioFamily);
  const forceScreeningHITL = useAgentStore((state) => state.forceScreeningHITL);
  const priceLoopAlert = activeScenario?.mode === "price_loop";
  const screeningBiasAlert = activeScenario?.mode === "screening_bias";
  const retryStormAlert = activeScenario?.mode === "retry_storm";
  const budgetData = [
    { t: "00m", budget: 4 },
    { t: "08m", budget: 7 },
    { t: "16m", budget: 11 },
    { t: "24m", budget: 19 },
    { t: "32m", budget: 37 },
    { t: "40m", budget: 50 },
  ];

  return (
    <div className="animate-critical-breach rounded-data border border-critical/30 bg-critical/10 p-3 shadow-danger">
      <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-critical" /><h2 className="font-accent text-lg">Human escalation queue</h2></div>
      <div className="mt-3 space-y-2">
        {priceLoopAlert && (
          <div className="rounded-data border border-accent/60 bg-accent/10 p-2 shadow-danger">
            <p className="font-display text-xs text-accent">CASCADA DETECTADA - 13 agentes afectados - $2.3M en riesgo</p>
            <p className="mt-1 text-xs text-foreground/55">AGT-007 recibió dato corrupto: precio +20%, replicado por dependientes.</p>
            <button onClick={containScenarioFamily} className="mt-2 rounded-badge border border-ok/40 px-2 py-1 font-display text-[10px] text-ok">Contener familia</button>
          </div>
        )}
        {screeningBiasAlert && (
          <div className="rounded-data border border-warn/70 bg-warn/15 p-2 shadow-danger">
            <p className="font-display text-xs text-warn">Fair Housing Act potencial violación</p>
            <p className="mt-1 text-xs text-foreground/55">Nova-N03 rechaza sistemáticamente solicitudes: tasa 73% vs. baseline 22%.</p>
            <button onClick={forceScreeningHITL} className="mt-2 rounded-badge border border-critical/40 px-2 py-1 font-display text-[10px] text-critical">Forzar HITL 100% screening</button>
          </div>
        )}
        {retryStormAlert && (
          <div className="rounded-data border border-warn/70 bg-warn/15 p-2 shadow-danger">
            <p className="font-display text-xs text-warn">Budget cap al 50% - Requiere aprobación para continuar</p>
            <p className="mt-1 text-xs text-foreground/55">Orion-M05 entró en retry loop contra HVAC provider: $120k gastados en 40 minutos.</p>
            <div className="mt-2 h-20 text-warn">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetData} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
                  <Area type="monotone" dataKey="budget" stroke="currentColor" fill="currentColor" fillOpacity={0.18} strokeWidth={2} isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 font-display text-[10px] text-critical">Circuit breaker automático: L2 State Freeze</p>
          </div>
        )}
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
