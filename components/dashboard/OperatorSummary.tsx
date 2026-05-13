"use client";

import { useEffect, useState } from "react";
import { Bell, Building2, Clock, Home, Pause, TrendingUp, Users, Wrench, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

// Subcomponent: Fleet Health Strip (Nivel 1)
function FleetHealthStrip({ agents }: { agents: Agent[] }) {
  const healthyCount = agents.filter((a) => a.status === "running" || a.status === "idle").length;
  const totalCount = agents.length;
  const healthPercent = Math.round((healthyCount / totalCount) * 100);

  return (
    <div className="flex items-center gap-4 bg-[#2B2E2E] border border-[#3D4141] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
        <span className="text-sm font-medium text-white">Flota operativa</span>
      </div>
      <div className="flex-1 h-2 bg-[#1A1D1D] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#34D399] to-[#D7FEFA] rounded-full transition-all duration-500"
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      <span className="text-sm font-mono text-[#6B7272]">{healthyCount}/{totalCount}</span>
      <span className="text-xs text-[#34D399] font-medium">{healthPercent}% salud</span>
    </div>
  );
}

// Subcomponent: Hero Activity Card (Nivel 3)
function HeroActivityCard() {
  return (
    <section className="rounded-[20px] border border-[#3D4141] bg-[#2B2E2E] p-6 flex flex-col">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">Trabajo completado hoy</h3>
        <p className="mt-1 text-sm text-[#A8AFAF]">El sistema resuelve la mayoría sin interrumpirte</p>
      </div>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-[#D7FEFA]">12</span>
        <span className="text-sm text-[#A8AFAF]">tareas completadas sin tu intervención</span>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gradNominal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "#2B2E2E",
                border: "1px solid #3D4141",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#A8AFAF" }}
              itemStyle={{ color: "#FFFFFF" }}
            />
            <Area type="monotone" dataKey="resueltas" name="Resueltas" stroke="#34D399" fill="url(#gradNominal)" strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="nuevas" name="Nuevas" stroke="#FBBF24" fill="url(#gradWarning)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// Subcomponent: KPI Card (for KpiCardsRow)
function KpiCard({ label, value, subtitle, badge, link, accentColor, Icon, onLinkClick }: {
  label: string; value: string; subtitle: string; badge?: string;
  link?: string; accentColor: string; Icon: typeof Zap; onLinkClick?: () => void;
}) {
  const numericStr = value.replace(/[^0-9.]/g, '');
  const numeric = parseFloat(numericStr) || 0;
  const suffix = value.replace(/[0-9.]/g, '');

  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => {
    if (suffix === '/50') return `${Math.round(v)}/50`;
    if (suffix.includes('s')) return `${v.toFixed(1)}s`;
    if (suffix.includes('%')) return `${v.toFixed(1)}%`;
    return `${v.toFixed(1)}`;
  });

  useEffect(() => {
    motionVal.set(numeric);
  }, [numeric, motionVal]);

  const isSlash = value.includes('/');
  const fontSize = isSlash ? '28px' : '32px';

  const badgeColor = badge?.includes('debajo') || badge?.includes('Por encima')
    ? 'text-[#34D399]'
    : badge?.includes('Excelente')
    ? 'text-[#D7FEFA]'
    : 'text-[#F87171]';

  return (
    <div className="flex flex-col bg-[#2B2E2E] border border-[#3D4141] rounded-[16px] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272]">{label}</p>
      </div>
      <motion.p
        className="font-mono font-bold leading-none text-white mb-1"
        style={{ fontSize }}
      >
        {display}
      </motion.p>
      <p className="text-[11px] text-[#A8AFAF] leading-relaxed mb-2 flex-1">{subtitle}</p>
      {badge && (
        <span className={`text-[10px] font-medium ${badgeColor}`}>
          {badge}
        </span>
      )}
      {link && (
        <button onClick={onLinkClick} className="text-[11px] text-[#F6F4D2] font-medium hover:text-[#EDEBBF] hover:underline text-left">
          {link}
        </button>
      )}
    </div>
  );
}

// Subcomponent: KPI Cards Row (Nivel 4)
function KpiCardsRow({ onViewExceptions }: { onViewExceptions: () => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <KpiCard
        label="Piloto automático"
        value="8.3%"
        subtitle="Tasa de escalación"
        badge="Por debajo del límite"
        accentColor="#34D399"
        Icon={Zap}
      />
      <KpiCard
        label="Sin intervención"
        value="91.7%"
        subtitle="Tareas autónomas"
        badge="Por encima de la meta"
        accentColor="#34D399"
        Icon={Bell}
      />
      <KpiCard
        label="Tiempo decisión"
        value="4.2s"
        subtitle="Promedio de aprobación"
        badge="Excelente"
        accentColor="#D7FEFA"
        Icon={Clock}
      />
      <KpiCard
        label="Agentes activos"
        value="47/50"
        subtitle="3 necesitan revisión"
        link="Revisar →"
        accentColor="#F6F4D2"
        Icon={TrendingUp}
        onLinkClick={onViewExceptions}
      />
    </div>
  );
}

// Subcomponent: Exceptions Panel (Nivel 2)
function ExceptionsPanel({ agents, onViewExceptions }: { agents: Agent[]; onViewExceptions: () => void }) {
  const activeExceptions = agents
    .filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended")
    .sort((left, right) => right.economic_risk.amount - left.economic_risk.amount);

  return (
    <section className="flex flex-col rounded-[20px] border border-[#3D4141] bg-[#2B2E2E] p-6 h-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Necesitan tu criterio ahora</h3>
          <p className="mt-1 text-sm text-[#A8AFAF]">Prioriza por impacto económico</p>
        </div>
        <span className="rounded-full bg-[#F6F4D2]/10 px-2.5 py-1 text-xs font-medium text-[#F6F4D2] border border-[#F6F4D2]/20">
          {activeExceptions.length} esperando
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto min-h-0">
        {activeExceptions.slice(0, 6).map((agent, i) => {
          const Icon = typeIcons[agent.type];
          const accentColor = agent.type === "sales" ? "#FBBF24" : agent.type === "maintenance" ? "#F87171" : "#D7FEFA";
          const accentBg = agent.type === "sales" ? "rgba(251, 191, 36, 0.08)" : agent.type === "maintenance" ? "rgba(248, 113, 113, 0.08)" : "rgba(215, 254, 250, 0.08)";

          return (
            <div
              key={agent.id}
              className={`flex items-start gap-3 rounded-xl p-3 hover:bg-[#333737] transition-colors cursor-pointer ${i > 0 ? 'border-t border-[#3D4141]' : ''}`}
              onClick={onViewExceptions}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: accentBg }}>
                <Icon className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{humanAgentName(agent)}</p>
                <p className="mt-0.5 truncate text-xs text-[#A8AFAF]">{humanDescription(agent)}</p>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold text-white">${economicImpactK(agent)}K</span>
            </div>
          );
        })}
      </div>
      <button
        onClick={onViewExceptions}
        className="mt-4 w-full text-center py-2.5 rounded-lg bg-[#F6F4D2]/10 border border-[#F6F4D2]/20 text-sm font-medium text-[#F6F4D2] hover:bg-[#F6F4D2]/20 transition-colors"
      >
        Revisar y aprobar →
      </button>
    </section>
  );
}

// Main Component
export function OperatorSummary({ agents, onViewExceptions }: { agents: Agent[]; onViewExceptions: () => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#1A1D1D] px-6 py-6">
      {/* Fila 1: Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Buenos días, <span className="text-[#D7FEFA]">Operador Vega</span>
          </h1>
          <p className="mt-1 text-sm text-[#A8AFAF]">
            {todayLabel()} · Tu flota lleva 6 horas trabajando sin interrupciones
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-[#6B7272]">{formatTime(time)}</span>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#F87171]/40 text-[#F87171] bg-[#F87171]/5 hover:bg-[#F87171]/10 transition-colors text-sm font-medium">
            <Pause className="h-4 w-4" />
            Pausar flota
          </button>
        </div>
      </header>

      {/* Fila 2: Fleet Health Strip */}
      <div className="mb-6">
        <FleetHealthStrip agents={agents} />
      </div>

      {/* Fila 3: Grid principal 65/35 */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* Columna izquierda */}
        <div className="flex flex-col gap-5">
          <HeroActivityCard />
          <KpiCardsRow onViewExceptions={onViewExceptions} />
        </div>

        {/* Columna derecha */}
        <ExceptionsPanel agents={agents} onViewExceptions={onViewExceptions} />
      </div>
    </div>
  );
}
