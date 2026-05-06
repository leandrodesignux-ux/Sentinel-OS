"use client";

import { AlertTriangle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import type { Agent } from "@/types/agent";

const activityData = [
  { hora: "-120m", resueltas: 3, nuevas: 2 },
  { hora: "-100m", resueltas: 4, nuevas: 3 },
  { hora: "-80m", resueltas: 5, nuevas: 4 },
  { hora: "-60m", resueltas: 7, nuevas: 5 },
  { hora: "-40m", resueltas: 8, nuevas: 4 },
  { hora: "-20m", resueltas: 10, nuevas: 6 },
  { hora: "ahora", resueltas: 12, nuevas: 4 },
];

function KpiCard({ label, value, meta, tone, suffix }: { label: string; value: string; meta: string; tone: "ok" | "warn" | "primary"; suffix?: string }) {
  return (
    <div className="rounded-[8px] border border-[#1E2235] bg-[#131625] p-4">
      <p className="text-xs text-foreground/45">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className={cn("font-display text-[28px] font-medium leading-none", tone === "ok" && "text-ok", tone === "warn" && "text-warn", tone === "primary" && "text-primary")}>{value}</p>
        {suffix && <span className="font-display text-xs text-ok">{suffix}</span>}
      </div>
      <p className="mt-2 text-[11px] text-foreground/40">meta {meta}</p>
    </div>
  );
}

export function OperatorSummary({ agents, onViewExceptions }: { agents: Agent[]; onViewExceptions: () => void }) {
  const activeExceptions = agents
    .filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended")
    .sort((left, right) => right.economic_risk.amount - left.economic_risk.amount);
  const circuitOpenCount = agents.filter((agent) => agent.status === "circuit_open").length;

  return (
    <div className="h-full min-h-0 space-y-4 overflow-y-auto">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Tasa de excepción" value="8.3%" meta="<10%" tone="ok" suffix="↓ mejorando" />
        <KpiCard label="Ejecución autónoma" value="91.7%" meta=">90%" tone="ok" suffix="nominal" />
        <KpiCard label="Tiempo de resolución" value="4.2s" meta="<10s" tone="primary" />
        <div className="rounded-[8px] border border-[#1E2235] bg-[#131625] p-4">
          <p className="text-xs text-foreground/45">Salud de flota</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-warn" />
            <p className="font-display text-[28px] font-medium leading-none text-warn">47/50</p>
          </div>
          <p className="mt-2 text-[11px] text-foreground/40">meta &gt;45</p>
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-[3fr_2fr] gap-4">
        <section className="rounded-data border border-[#1E2235] bg-card/70 p-4">
          <h3 className="font-accent text-lg">Actividad de flota últimas 2 horas</h3>
          <div className="mt-4 h-[160px] min-h-[160px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <Tooltip contentStyle={{ background: "#131625", border: "1px solid #1E2235", borderRadius: 8 }} labelStyle={{ color: "#9CA3AF" }} />
                <Area type="monotone" dataKey="resueltas" name="excepciones resueltas" stroke="var(--status-nominal)" fill="var(--status-nominal)" fillOpacity={0.16} strokeWidth={2} />
                <Area type="monotone" dataKey="nuevas" name="nuevas excepciones" stroke="var(--status-warning)" fill="var(--status-warning)" fillOpacity={0.16} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-data border border-[#1E2235] bg-card/70 p-4">
          <h3 className="font-accent text-lg">Excepciones activas ahora</h3>
          <div className="mt-4 space-y-2">
            {activeExceptions.slice(0, 4).map((agent) => (
              <div key={agent.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-data border border-[#1E2235] bg-background/45 p-2">
                <span className="h-2 w-2 animate-status-pulse rounded-full bg-critical" />
                <div className="min-w-0">
                  <p className="font-display text-xs text-foreground">{agent.id}</p>
                  <p className="truncate text-xs text-foreground/50">{agent.exception_reason ?? agent.current_task.description}</p>
                </div>
                <span className="font-display text-xs text-critical">${economicImpactK(agent)}K</span>
              </div>
            ))}
          </div>
          <button onClick={onViewExceptions} className="mt-4 font-display text-xs text-primary hover:text-primary/80">Ver todas →</button>
        </section>
      </div>

      {circuitOpenCount > 0 && (
        <section className="rounded-data border border-warn/40 bg-warn/15 p-4 text-warn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-accent text-lg">Alertas del sistema</h3>
          </div>
          <p className="mt-2 text-sm">Hay {circuitOpenCount} cortacircuito activo. Las decisiones asociadas permanecen congeladas hasta revisión del operador.</p>
        </section>
      )}
    </div>
  );
}
