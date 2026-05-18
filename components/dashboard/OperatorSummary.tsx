"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bell, Bot, Building2, ChevronDown, Clock, Home, Pause, Timer, TrendingUp, Users, Wrench, Zap } from "lucide-react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
function FleetHealthStrip({ agents, hasMounted }: { agents: Agent[]; hasMounted?: boolean }) {
  const runningCount = agents.filter((a) => a.status === "running").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;
  const monitoringCount = agents.filter((a) => a.status === "monitoring").length;
  const criticalCount = agents.filter((a) =>
    a.status === "intervention_required" || a.status === "circuit_open" || a.status === "suspended"
  ).length;
  const totalCount = agents.length;

  // Calculate percentages
  const runningPercent = totalCount > 0 ? (runningCount / totalCount) * 100 : 0;
  const monitoringPercent = totalCount > 0 ? (monitoringCount / totalCount) * 100 : 0;
  const criticalPercent = totalCount > 0 ? (criticalCount / totalCount) * 100 : 0;

  // Calculate metrics
  const activeCount = runningCount + idleCount;
  const escalationRate = totalCount > 0 ? ((criticalCount / totalCount) * 100).toFixed(1) : "0.0";
  const autonomousRate = totalCount > 0 ? (100 - parseFloat(escalationRate)).toFixed(1) : "100.0";
  const tasksCompleted = agents.reduce((sum, a) => sum + (a.metadata?.exceptions_today || 0) * 12, 4750);

  return (
    <div className="relative flex items-center gap-6 bg-[#2B2E2E] border border-[#3D4141] rounded-[16px] px-5 py-3 hover:border-[#4A5050] transition-colors duration-200">
      {/* Scan effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-[16px] pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(215,254,250,0.06) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        initial={{ backgroundPosition: "200% 0" }}
        animate={{ backgroundPosition: "-200% 0" }}
        transition={{ duration: 1.2, ease: "linear", delay: 0.2 }}
      />
      {/* Dot + Counter */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
        <span className="text-sm font-semibold text-white">
          {activeCount} <span className="text-[#6B7272] font-normal">activos de {totalCount}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 h-1.5 rounded-full bg-[#3D4141] overflow-hidden relative">
        {/* Running segment - green */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-[#34D399] rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${runningPercent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
        {/* Monitoring segment - yellow */}
        <motion.div
          className="absolute top-0 h-full bg-[#FBBF24] rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${monitoringPercent}%`, left: `${runningPercent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
        />
        {/* Critical segment - red */}
        <motion.div
          className="absolute top-0 h-full bg-[#F87171] rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${criticalPercent}%`,
            left: `${runningPercent + monitoringPercent}%`,
          }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
        />
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-[#3D4141]" />

      {/* Metric 1: Escalation Rate */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-mono font-bold text-white">{escalationRate}%</span>
        <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">Escalación</span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-[#3D4141]" />

      {/* Metric 2: Autonomous Rate */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-mono font-bold text-white">{autonomousRate}%</span>
        <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">Autónomo</span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-[#3D4141]" />

      {/* Metric 3: MTTR */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-mono font-bold text-white">4.2s</span>
        <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">MTTR</span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-[#3D4141]" />

      {/* Metric 4: Tasks Completed */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-mono font-bold text-white">{tasksCompleted.toLocaleString()}</span>
        <span className="text-[10px] text-[#6B7272] uppercase tracking-wide">tareas</span>
      </div>
    </div>
  );
}

// Subcomponent: Hero Activity Card (Nivel 3)
function HeroActivityCard({ hasMounted }: { hasMounted?: boolean }) {
  // Hero number animation (0 → 12) with delay 600ms
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 50, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!hasMounted) return;
    const unsubscribe = display.on("change", (v) => setAnimatedValue(v));
    const t = setTimeout(() => {
      motionVal.set(12);
    }, 600);
    return () => {
      clearTimeout(t);
      unsubscribe();
    };
  }, [motionVal, display, hasMounted]);

  return (
    <section className="rounded-[20px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-6 flex flex-col h-[340px]">
      {/* Header with dropdown */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Trabajo completado hoy</h3>
          <p className="mt-1 text-sm text-[#A8AFAF]">El sistema resuelve la mayoría sin interrumpirte</p>
        </div>
        <button className="flex items-center gap-1 text-xs text-[#6B7272] hover:text-[#A8AFAF] transition-colors">
          Últimas 2 horas
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hero number with animation */}
      <div className="mb-4 flex items-baseline gap-3">
        <motion.span
          className="text-[64px] font-mono font-bold text-[#D7FEFA] leading-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {animatedValue}
        </motion.span>
        <span className="text-sm text-[#A8AFAF]">tareas completadas sin tu intervención</span>
      </div>

      {/* Chart with 220px height */}
      <div className="flex-1" style={{ height: 220, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gradNominal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34D399" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hora"
              tick={{ fontSize: 10, fill: "#6B7272" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6B7272" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ stroke: "#4A5050", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "#1A1D1D",
                border: "1px solid #4A5050",
                borderRadius: 10,
                fontSize: 12,
                padding: "8px 12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "#6B7272", marginBottom: 4 }}
              itemStyle={{ color: "#FFFFFF", fontFamily: "monospace" }}
            />
            <Area
              type="monotone"
              dataKey="resueltas"
              name="Resueltas"
              stroke="#34D399"
              fill="url(#gradNominal)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
              animationBegin={400}
            />
            <Area
              type="monotone"
              dataKey="nuevas"
              name="Nuevas"
              stroke="#FBBF24"
              fill="url(#gradWarning)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
              animationBegin={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#A8AFAF]">
            <span className="h-2 w-2 rounded-full bg-[#34D399]" />
            Resueltas
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#A8AFAF]">
            <span className="h-2 w-2 rounded-full bg-[#FBBF24]" />
            Nuevas
          </span>
        </div>
        <button className="text-xs text-[#F6F4D2] hover:text-[#EDEBBF] transition-colors">
          Ver historial →
        </button>
      </div>
    </section>
  );
}

// Animation variants for staggered entrance (delayChildren adjusted based on hasMounted)
const getContainerVariants = (hasMounted?: boolean) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: hasMounted ? 0 : 0.5 } }
});

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] as const } }
};

// Sparkline data for each KPI
const sparklineData = {
  escalation: [14, 12, 11, 9, 8.3],
  autonomous: [88, 89, 90, 91, 91.7],
  time: [5.1, 4.8, 4.5, 4.3, 4.2],
  agents: [48, 47, 49, 47, 47],
};

// Subcomponent: KPI Card (for KpiCardsRow)
function KpiCard({
  label,
  value,
  subtitle,
  badge,
  accentColor,
  Icon,
  sparklineData: sparkline,
  sparklineColor,
}: {
  label: string;
  value: string;
  subtitle: string;
  badge?: string;
  accentColor: string;
  Icon: typeof Zap;
  sparklineData: number[];
  sparklineColor: string;
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

  // Convert sparkline data to chart format
  const chartData = sparkline.map((val, idx) => ({ idx, val }));

  return (
    <motion.div
      className="flex flex-col border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] rounded-[16px] p-5 flex-1 h-[160px] cursor-pointer"
      variants={cardVariants}
      whileHover={{
        y: -2,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        borderColor: "#3D4141",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + "40";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#3D4141";
      }}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accentColor + "14" }} // 8% opacity
        >
          <Icon className="h-4 w-4" style={{ color: accentColor }} />
        </div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272]">{label}</p>
      </div>

      {/* Animated number */}
      <motion.p
        className="font-mono font-bold leading-none text-white mb-2"
        style={{ fontSize: "32px" }}
      >
        {display}
      </motion.p>

      {/* Sparkline micro-chart */}
      <div className="mb-3">
        <LineChart width={40} height={20} data={chartData}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={sparklineColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </div>

      {/* Description */}
      <p className="text-[11px] text-[#A8AFAF] leading-relaxed mb-3 flex-1">{subtitle}</p>

      {/* Divider */}
      <div className="h-px bg-[#3D4141] mb-3" />

      {/* Badge */}
      {badge && (
        <span className="text-[10px] font-medium" style={{ color: accentColor }}>
          {badge}
        </span>
      )}
    </motion.div>
  );
}

// Subcomponent: KPI Cards Row (Nivel 4)
function KpiCardsRow({ onViewExceptions, hasMounted }: { onViewExceptions: () => void; hasMounted?: boolean }) {
  return (
    <motion.div
      className="grid grid-cols-4 gap-3"
      variants={getContainerVariants(hasMounted)}
      initial="hidden"
      animate="visible"
    >
      <KpiCard
        label="Piloto automático"
        value="8.3%"
        subtitle="Tasa de escalación"
        badge="Por debajo del límite"
        accentColor="#FBBF24"
        Icon={Zap}
        sparklineData={sparklineData.escalation}
        sparklineColor="#34D399"
      />
      <KpiCard
        label="Sin intervención"
        value="91.7%"
        subtitle="Tareas autónomas"
        badge="Por encima de la meta"
        accentColor="#34D399"
        Icon={Bot}
        sparklineData={sparklineData.autonomous}
        sparklineColor="#34D399"
      />
      <KpiCard
        label="Tiempo decisión"
        value="4.2s"
        subtitle="Promedio de aprobación"
        badge="Excelente"
        accentColor="#D7FEFA"
        Icon={Timer}
        sparklineData={sparklineData.time}
        sparklineColor="#D7FEFA"
      />
      <KpiCard
        label="Agentes activos"
        value="47/50"
        subtitle="3 necesitan revisión"
        badge="Revisar →"
        accentColor="#F6F4D2"
        Icon={Users}
        sparklineData={sparklineData.agents}
        sparklineColor="#F6F4D2"
      />
    </motion.div>
  );
}

// Animation variants for exceptions list (delayChildren adjusted based on hasMounted)
const getListVariants = (hasMounted?: boolean) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: hasMounted ? 0 : 0.25 } }
});

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1] as const } }
};

// Helper to get impact color based on amount
function getImpactColor(amount: number): string {
  if (amount > 150000) return "#F87171"; // Red for high impact
  if (amount > 100000) return "#FBBF24"; // Yellow for medium-high
  return "#D7FEFA"; // Teal for lower
}

// Subcomponent: Exceptions Panel (Nivel 2)
function ExceptionsPanel({ agents, onViewExceptions, hasMounted }: { agents: Agent[]; onViewExceptions: () => void; hasMounted?: boolean }) {
  const activeExceptions = agents
    .filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended")
    .sort((left, right) => right.economic_risk.amount - left.economic_risk.amount);

  const maxImpact = activeExceptions[0]?.economic_risk.amount ?? 1;

  return (
    <section className="flex flex-col rounded-[20px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-6 h-full">
      {/* Sticky Header */}
      <div
        className="sticky top-0 bg-[#2B2E2E]/80 backdrop-blur-sm pb-3 pt-1 z-10"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Necesitan tu criterio ahora</h3>
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="rounded-full bg-[#F6F4D2]/10 border border-[#F6F4D2]/20 px-2.5 py-1 text-xs font-medium text-[#F6F4D2]"
          >
            {activeExceptions.length} esperando
          </motion.span>
        </div>
        <p className="text-sm text-[#A8AFAF] mt-1">Prioriza por impacto económico</p>
      </div>

      {/* Scrollable List */}
      <motion.div
        className="flex-1 overflow-y-auto min-h-0 space-y-3"
        variants={getListVariants(hasMounted)}
        initial="hidden"
        animate="visible"
      >
        {activeExceptions.slice(0, 6).map((agent) => {
          const Icon = typeIcons[agent.type];
          const impactColor = getImpactColor(agent.economic_risk.amount);

          // Type colors for impact bar
          const typeColors: Record<string, string> = {
            sales: "#FBBF24",
            maintenance: "#F87171",
            asset_mgmt: "#D7FEFA",
            screening: "#A78BFA",
          };
          const barColor = typeColors[agent.type] || "#6B7272";
          const barWidth = (agent.economic_risk.amount / maxImpact) * 100;

          return (
            <motion.div
              key={agent.id}
              variants={itemVariants}
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex flex-col gap-2 rounded-xl p-3 cursor-pointer"
              onClick={onViewExceptions}
            >
              {/* Impact Bar */}
              <div className="w-full h-0.5 bg-[#3D4141] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="flex items-start gap-3">
                {/* Icon with urgency indicator */}
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: barColor + "14" }}>
                  <Icon className="h-4 w-4" style={{ color: barColor }} />
                  {agent.status === "circuit_open" && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#F87171] animate-pulse" />
                  )}
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{humanAgentName(agent)}</p>
                  <p className="mt-0.5 truncate text-xs text-[#A8AFAF]">{humanDescription(agent)}</p>
                </div>

                {/* Economic Impact - Prominent */}
                <span
                  className="flex-shrink-0 text-base font-bold font-mono"
                  style={{ color: impactColor }}
                >
                  ${economicImpactK(agent)}K
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onViewExceptions}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-[#F6F4D2] hover:text-[#EDEBBF] transition-colors"
      >
        Revisar y aprobar
        <ArrowRight className="h-3.5 w-3.5" />
      </motion.button>
    </section>
  );
}

// Main Component
export function OperatorSummary({ agents, onViewExceptions }: { agents: Agent[]; onViewExceptions: () => void }) {
  const [time, setTime] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHasMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="h-full min-h-0 overflow-y-auto bg-[#1A1D1D] px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasMounted ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fila 1: Header — delay 0s */}
      <motion.header
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : -10 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
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
      </motion.header>

      {/* Fila 2: Fleet Health Strip — delay 0.15s */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : -10 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <FleetHealthStrip agents={agents} hasMounted={hasMounted} />
      </motion.div>

      {/* Fila 3: Top Stats Bar — 4 inline metric pills */}
      <motion.div
        className="mb-6 flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : -8 }}
        transition={{ duration: 0.4, delay: 0.28 }}
      >
        {[
          { label: "Flota activa", value: `${agents.filter(a => a.status === "running" || a.status === "idle").length} / ${agents.length}`, color: "#34D399" },
          { label: "Tasa autónoma", value: `${agents.length > 0 ? (100 - (agents.filter(a => a.status === "intervention_required" || a.status === "circuit_open" || a.status === "suspended").length / agents.length) * 100).toFixed(1) : "100.0"}%`, color: "#D7FEFA" },
          { label: "Riesgo acumulado", value: `$${agents.reduce((s, a) => s + (a.economic_risk?.amount ?? 0), 0).toLocaleString()}`, color: "#FBBF24" },
          { label: "Alertas activas", value: `${agents.filter(a => a.status === "intervention_required" || a.status === "circuit_open").length}`, color: "#F87171" },
        ].map((pill) => (
          <div
            key={pill.label}
            className="flex items-center gap-3 rounded-[12px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] px-4 py-2.5 flex-1"
          >
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: pill.color }}
            />
            <span className="text-[10px] text-[#6B7272] uppercase tracking-wider flex-1">{pill.label}</span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: pill.color }}
            >{pill.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Fila 4: Grid principal 3 columnas */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "240px 1fr 320px" }}>
        {/* Columna izquierda — Sidebar stats */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: hasMounted ? 1 : 0, x: hasMounted ? 0 : -20 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Fleet type breakdown */}
          <div className="rounded-[16px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-4 flex flex-col gap-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272]">Por tipo</p>
            {(["sales", "asset_mgmt", "maintenance", "screening"] as const).map((type) => {
              const count = agents.filter(a => a.type === type).length;
              const typeLabels: Record<string, string> = { sales: "Ventas", asset_mgmt: "Activos", maintenance: "Mant.", screening: "Eval." };
              const typeColors: Record<string, string> = { sales: "#FBBF24", asset_mgmt: "#D7FEFA", maintenance: "#F87171", screening: "#A78BFA" };
              const pct = agents.length > 0 ? (count / agents.length) * 100 : 0;
              return (
                <div key={type} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A8AFAF]">{typeLabels[type]}</span>
                    <span className="font-mono text-xs text-white">{count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-[#3D4141] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: typeColors[type] }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status distribution */}
          <div className="rounded-[16px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-4 flex flex-col gap-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272]">Por estado</p>
            {([
              { key: "running", label: "Trabajando", color: "#34D399" },
              { key: "idle", label: "En espera", color: "#34D399" },
              { key: "monitoring", label: "Observando", color: "#FBBF24" },
              { key: "intervention_required", label: "Alerta", color: "#F87171" },
            ] as { key: string; label: string; color: string }[]).map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-[#A8AFAF]">{s.label}</span>
                </div>
                <span className="font-mono text-xs text-white">{agents.filter(a => a.status === s.key).length}</span>
              </div>
            ))}
          </div>

          {/* Clock card */}
          <div className="rounded-[16px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-4 flex flex-col gap-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272]">Tiempo operativo</p>
            <span className="font-mono text-lg font-bold text-[#D7FEFA]">{formatTime(time)}</span>
            <span className="text-xs text-[#6B7272]">6h sin interrupciones</span>
          </div>
        </motion.div>

        {/* Columna central — main content */}
        <div className="flex flex-col gap-5">
          {/* HeroActivityCard — delay 0.3s */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : 20 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <HeroActivityCard hasMounted={hasMounted} />
          </motion.div>

          {/* KpiCardsRow — base delay 0.5s + 0.1s stagger per card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : 20 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <KpiCardsRow onViewExceptions={onViewExceptions} hasMounted={hasMounted} />
          </motion.div>
        </div>

        {/* Columna derecha — ExceptionsPanel delay 0.25s */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: hasMounted ? 1 : 0, x: hasMounted ? 0 : 30 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <ExceptionsPanel agents={agents} onViewExceptions={onViewExceptions} hasMounted={hasMounted} />
        </motion.div>
      </div>
    </motion.div>
  );
}
