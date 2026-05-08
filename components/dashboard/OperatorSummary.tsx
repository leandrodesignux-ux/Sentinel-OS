"use client";

import { Bell, Building2, Clock, Home, TrendingUp, Users, Wrench, Zap } from "lucide-react";
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

const typeIcons = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

function todayLabel() {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

function humanAgentName(agent: Agent) {
  const typeLabel = {
    sales: "Agente de Ventas",
    asset_mgmt: "Agente de Activos",
    maintenance: "Agente de Mantenimiento",
    screening: "Agente de Evaluación",
  }[agent.type];
  const number = parseInt(agent.id.replace("AGT-", ""));
  return `${typeLabel} #${number}`;
}

function humanDescription(agent: Agent) {
  if (agent.status === "circuit_open") return "Detectó una decisión que requiere validación segura";
  if (agent.status === "suspended") return "Está pausado hasta que confirmes el siguiente paso";
  if (agent.type === "sales") return "Encontró una situación inusual en precios";
  if (agent.type === "asset_mgmt") return "Identificó un cambio relevante en activos";
  if (agent.type === "maintenance") return "Marcó una señal operativa fuera de patrón";
  return "Necesita revisión antes de continuar";
}

function KpiCard({ label, value, subtitle, badge, link, accentColor, Icon, onLinkClick }: {
  label: string;
  value: string;
  subtitle: string;
  badge?: string;
  link?: string;
  accentColor: string;
  Icon: typeof Zap;
  onLinkClick?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[var(--bg-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <Icon className="absolute right-4 top-4 h-12 w-12 opacity-15" style={{ color: accentColor }} />
      <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-4xl font-bold" style={{ color: accentColor }}>{value}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
      {badge && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          ✓ {badge}
        </span>
      )}
      {link && (
        <button onClick={onLinkClick} className="mt-3 text-xs font-medium text-[var(--status-warning)] hover:underline">
          {link}
        </button>
      )}
    </div>
  );
}

export function OperatorSummary({ agents, onViewExceptions }: { agents: Agent[]; onViewExceptions: () => void }) {
  const activeExceptions = agents
    .filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended")
    .sort((left, right) => right.economic_risk.amount - left.economic_risk.amount);

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Buenos días, Operador Vega
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {todayLabel()} · Tu flota lleva 6 horas trabajando sin interrupciones
        </p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <KpiCard label="Tareas en piloto automático" value="8.3%" subtitle="Tasa de escalación — meta < 10%" badge="Por debajo del límite" accentColor="var(--status-nominal)" Icon={Zap} />
        <KpiCard label="Sin intervención humana" value="91.7%" subtitle="De cada 100 tareas, solo 8 necesitan tu revisión" badge="Por encima de la meta" accentColor="var(--status-accent)" Icon={Bell} />
        <KpiCard label="Tiempo para tomar una decisión" value="4.2s" subtitle="Promedio para aprobar una acción" badge="Excelente" accentColor="var(--status-accent)" Icon={Clock} />
        <KpiCard label="Agentes trabajando ahora" value="47/50" subtitle="3 agentes necesitan tu criterio ahora" link="Revisar ahora →" accentColor="var(--status-warning)" Icon={TrendingUp} onLinkClick={onViewExceptions} />
      </div>

      <div className="grid grid-cols-[3fr_2fr] gap-4">
        <section className="rounded-[20px] border border-[var(--bg-border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Trabajo completado hoy</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">El sistema resuelve la mayoría sin interrumpirte</p>
          </div>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[var(--status-nominal)]">
              12
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              tareas completadas sin tu intervención
            </span>
          </div>
          <div className="h-[180px]">
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

        <section className="flex flex-col rounded-[20px] border border-[var(--bg-border)] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Necesitan tu criterio ahora</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Prioriza por impacto económico</p>
            </div>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
              {activeExceptions.length} esperando tu revisión
            </span>
          </div>
          <div className="flex-1 space-y-3">
            {activeExceptions.slice(0, 4).map((agent) => {
              const Icon = typeIcons[agent.type];
              const accentColor = agent.type === "sales" ? "var(--status-warning)" : agent.type === "maintenance" ? "var(--status-critical)" : "var(--status-accent)";
              const accentBg = agent.type === "sales" ? "rgba(247, 144, 9, 0.12)" : agent.type === "maintenance" ? "rgba(240, 68, 56, 0.1)" : "rgba(46, 144, 250, 0.1)";

              return (
              <div key={agent.id} className="flex items-start gap-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-canvas)] p-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: accentBg }}>
                  <Icon className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {humanAgentName(agent)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                    {humanDescription(agent)}
                  </p>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold text-[var(--status-critical)]">
                  ${economicImpactK(agent)}K
                </span>
              </div>
              );
            })}
          </div>
          <button onClick={onViewExceptions} className="mt-4 text-left text-sm font-medium text-[var(--status-warning)] hover:underline">
            Revisar y aprobar →
          </button>
        </section>
      </div>
    </div>
  );
}
