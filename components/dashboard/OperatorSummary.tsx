"use client";

import { AlertTriangle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
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

function KpiCard({
  label, value, unit, meta, metaOk, trend, trendOk, accent
}: {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  metaOk: boolean;
  trend?: string;
  trendOk?: boolean;
  accent?: "ok" | "warn" | "critical" | "accent";
}) {
  const accentColor = {
    ok: "var(--status-nominal)",
    warn: "var(--status-warning)",
    critical: "var(--status-critical)",
    accent: "var(--status-accent)",
  }[accent ?? "ok"];

  return (
    <div className="relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-card border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6">
      <div className="absolute left-6 right-6 top-0 h-[2px] rounded-full" style={{ background: accentColor }} />
      <p className="mt-2 text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </p>
      <div className="mt-4 flex items-end gap-2">
        <span className="font-display font-medium leading-none" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: accentColor, letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {unit && (
          <span className="mb-1 font-display text-base text-[var(--text-secondary)]">{unit}</span>
        )}
        {trend && (
          <span className={`mb-1 font-display text-sm ${trendOk ? "text-[var(--status-nominal)]" : "text-[var(--status-critical)]"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${metaOk ? "bg-[var(--status-nominal)]" : "bg-[var(--status-warning)]"}`} />
        <p className="text-[11px] text-[var(--text-muted)]">meta {meta}</p>
      </div>
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
        <KpiCard label="Tasa de excepción" value="8.3" unit="%" meta="<10%" metaOk trend="↓" trendOk accent="ok" />
        <KpiCard label="Ejecución autónoma" value="91.7" unit="%" meta=">90%" metaOk accent="accent" />
        <KpiCard label="Tiempo resolución" value="4.2" unit="s" meta="<10s" metaOk accent="accent" />
        <KpiCard label="Salud de flota" value="47" unit="/50" meta=">45" metaOk={false} trend="▲" trendOk={false} accent="warn" />
      </div>

      <div className="grid grid-cols-[3fr_2fr] gap-4">
        <section className="rounded-card border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-accent text-base font-medium text-[var(--text-primary)]">
                Actividad de flota
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Últimas 2 horas · actualización en vivo</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-6 rounded-full bg-[var(--status-nominal)] opacity-70" />
                Resueltas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-6 rounded-full bg-[var(--status-warning)] opacity-70" />
                Nuevas
              </span>
            </div>
          </div>
          <div className="mb-4 flex items-baseline gap-3">
            <span className="font-display text-5xl font-medium leading-none text-[var(--status-nominal)]">
              12
            </span>
            <span className="text-sm text-[var(--text-secondary)]">excepciones resueltas hoy</span>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradNominal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--status-nominal)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--status-nominal)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--status-warning)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--status-warning)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text-secondary)" }}
                />
                <Area type="monotone" dataKey="resueltas" name="Resueltas" stroke="var(--status-nominal)" fill="url(#gradNominal)" strokeWidth={1.5} dot={false} />
                <Area type="monotone" dataKey="nuevas" name="Nuevas" stroke="var(--status-warning)" fill="url(#gradWarning)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="flex flex-col rounded-card border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-accent text-base font-medium">Excepciones activas</h3>
            <span className="rounded-pill bg-[var(--status-critical)]/15 px-2.5 py-1 font-display text-xs text-[var(--status-critical)]">
              {activeExceptions.length} ahora
            </span>
          </div>
          <div className="flex-1 space-y-3">
            {activeExceptions.slice(0, 4).map((agent) => (
              <div key={agent.id} className="flex cursor-pointer items-center gap-3 rounded-data border border-[var(--bg-border)] bg-[var(--bg-elevated)] p-3 transition-colors hover:border-[var(--status-critical)]/40">
                <span className="h-2 w-2 flex-shrink-0 animate-status-pulse rounded-full bg-[var(--status-critical)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xs font-medium text-[var(--text-primary)]">{agent.id}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                    {agent.exception_reason ?? agent.current_task.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-display text-sm font-medium text-[var(--status-critical)]">
                    ${economicImpactK(agent)}K
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onViewExceptions} className="mt-4 text-left font-display text-xs text-[var(--text-accent)] transition-colors hover:text-[var(--text-accent)]/80">
            Ver todas las excepciones →
          </button>
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
