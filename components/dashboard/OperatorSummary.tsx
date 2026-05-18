"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bell, Bot, Building2, ChevronDown, Clock, Home, Pause, Settings, Timer, TrendingUp, Users, Wrench, X, Zap } from "lucide-react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

const activityDataHoy = [
  { hora: "-600m", resueltas: 5, nuevas: 2 },
  { hora: "-540m", resueltas: 8, nuevas: 3 },
  { hora: "-480m", resueltas: 12, nuevas: 5 },
  { hora: "-420m", resueltas: 16, nuevas: 6 },
  { hora: "-360m", resueltas: 21, nuevas: 8 },
  { hora: "-300m", resueltas: 26, nuevas: 9 },
  { hora: "-240m", resueltas: 30, nuevas: 11 },
  { hora: "-180m", resueltas: 35, nuevas: 13 },
  { hora: "-120m", resueltas: 38, nuevas: 14 },
  { hora: "-100m", resueltas: 40, nuevas: 15 },
  { hora: "-80m", resueltas: 42, nuevas: 16 },
  { hora: "-60m", resueltas: 44, nuevas: 17 },
  { hora: "-20m", resueltas: 46, nuevas: 17 },
  { hora: "ahora", resueltas: 48, nuevas: 18 },
];

const activityDataTodo = [
  { hora: "-7d", resueltas: 80, nuevas: 30 },
  { hora: "-6d", resueltas: 120, nuevas: 44 },
  { hora: "-5d", resueltas: 160, nuevas: 55 },
  { hora: "-4d", resueltas: 195, nuevas: 63 },
  { hora: "-3d", resueltas: 230, nuevas: 72 },
  { hora: "-2d", resueltas: 268, nuevas: 82 },
  { hora: "hoy", resueltas: 310, nuevas: 90 },
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

// Sparkline data for KPI metrics (module scope — used by FleetHealthStrip and KpiCard)
const sparklineData = {
  escalation: [14, 12, 11, 9, 8.3],
  autonomous: [88, 89, 90, 91, 91.7],
  time: [5.1, 4.8, 4.5, 4.3, 4.2],
  agents: [48, 47, 49, 47, 47],
};

// Subcomponent: Mini Donut SVG
function MiniDonut({ running, monitoring, critical, total }: { running: number; monitoring: number; critical: number; total: number }) {
  const size = 40;
  const r = 15;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const safe = Math.max(total, 1);

  const runningDash = (running / safe) * circumference;
  const monitoringDash = (monitoring / safe) * circumference;
  const criticalDash = (critical / safe) * circumference;

  const runningOffset = 0;
  const monitoringOffset = -runningDash;
  const criticalOffset = -(runningDash + monitoringDash);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ border: "1px solid #34D399" }}
      />
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3D4141" strokeWidth={5} />
      {/* Running — green */}
      {running > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#34D399" strokeWidth={5}
          strokeDasharray={`${runningDash} ${circumference}`}
          strokeDashoffset={runningOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Monitoring — yellow */}
      {monitoring > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FBBF24" strokeWidth={5}
          strokeDasharray={`${monitoringDash} ${circumference}`}
          strokeDashoffset={monitoringOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Critical — red */}
      {critical > 0 && (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F87171" strokeWidth={5}
          strokeDasharray={`${criticalDash} ${circumference}`}
          strokeDashoffset={criticalOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      {/* Center count */}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF" fontFamily="monospace">
        {total}
      </text>
    </svg>
    </div>
  );
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

  const activeCount = runningCount + idleCount;
  const escalationRate = totalCount > 0 ? ((criticalCount / totalCount) * 100).toFixed(1) : "0.0";
  const autonomousRate = totalCount > 0 ? (100 - parseFloat(escalationRate)).toFixed(1) : "100.0";
  const tasksCompleted = agents.reduce((sum, a) => sum + (a.metadata?.exceptions_today || 0) * 12, 4750);

  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  const metrics: { label: string; value: string; sparkline: number[]; trend: string; trendColor: string; meta: string }[] = [
    { label: "Escalación", value: `${escalationRate}%`, sparkline: sparklineData.escalation, trend: "Tendencia: bajando ↓", trendColor: "#34D399", meta: "Meta operativa: <10%" },
    { label: "Autónomo", value: `${autonomousRate}%`, sparkline: sparklineData.autonomous, trend: "Tendencia: subiendo ↑", trendColor: "#34D399", meta: "Meta operativa: >90%" },
    { label: "MTTR", value: "4.2s", sparkline: sparklineData.time, trend: "Tendencia: mejorando ↓", trendColor: "#34D399", meta: "Meta operativa: <5s" },
    { label: "Tareas", value: tasksCompleted.toLocaleString(), sparkline: sparklineData.agents, trend: "Tendencia: estable →", trendColor: "#D7FEFA", meta: "Acumulado del turno" },
  ];

  return (
    <div className="relative flex items-center gap-4 bg-[#2B2E2E] border border-[#3D4141] rounded-[16px] px-5 py-4 hover:border-[#4A5050] transition-colors duration-200">
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

      {/* Mini Donut */}
      <MiniDonut running={runningCount + idleCount} monitoring={monitoringCount} critical={criticalCount} total={totalCount} />

      {/* Active label */}
      <div className="flex flex-col shrink-0">
        <span className="text-sm font-semibold text-white">{activeCount} <span className="text-[#6B7272] font-normal">activos</span></span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="flex items-center gap-1 text-[10px] text-[#6B7272]"><span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />{runningCount + idleCount}</span>
          <span className="flex items-center gap-1 text-[10px] text-[#6B7272]"><span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />{monitoringCount}</span>
          <span className="flex items-center gap-1 text-[10px] text-[#6B7272]"><span className="h-1.5 w-1.5 rounded-full bg-[#F87171]" />{criticalCount}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-[#3D4141] mx-1" />

      {/* Metric pills */}
      <div className="flex items-center gap-2 flex-1">
        {metrics.map((m) => {
          const isActive = activeMetric === m.label;
          const chartData = m.sparkline.map((val, idx) => ({ idx, val }));
          return (
            <div key={m.label} className="relative">
              <div
                className={`flex flex-col items-center px-3 py-2 rounded-xl cursor-pointer transition-colors duration-150 ${
                  isActive ? "bg-[#4A5050]" : "bg-[#3D4141] hover:bg-[#4A5050]"
                }`}
                onClick={() => setActiveMetric(isActive ? null : m.label)}
              >
                <span className="font-mono text-sm font-bold text-white">{m.value}</span>
                <span className="text-[10px] text-[#6B7272] uppercase tracking-wide mt-0.5">{m.label}</span>
              </div>

              {/* Dropdown popover */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[180px] rounded-xl border border-[#4A5050] bg-[#1A1D1D] p-3 shadow-xl"
                  >
                    <p className="text-xs font-medium text-white mb-2">{m.label}</p>
                    <LineChart width={156} height={48} data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke="#D7FEFA"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium" style={{ color: m.trendColor }}>{m.trend}</span>
                      <span className="text-[10px] text-[#6B7272]">{m.meta}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Subcomponent: Hero Activity Card (Nivel 3)
function HeroActivityCard({ hasMounted }: { hasMounted?: boolean }) {
  const [activeTab, setActiveTab] = useState<"2h" | "hoy" | "todo">("2h");

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

  const tabs = [
    { id: "2h" as const, label: "Últimas 2h" },
    { id: "hoy" as const, label: "Hoy" },
    { id: "todo" as const, label: "Todo" },
  ];

  const currentData = activeTab === "2h" ? activityData : activeTab === "hoy" ? activityDataHoy : activityDataTodo;

  const lastEntry = currentData[currentData.length - 1];
  const totalResueltas = currentData.reduce((s, d) => s + d.resueltas, 0);
  const totalNuevas = currentData.reduce((s, d) => s + d.nuevas, 0);
  const tasa = totalResueltas + totalNuevas > 0
    ? ((totalResueltas / (totalResueltas + totalNuevas)) * 100).toFixed(0)
    : "0";

  return (
    <section className="rounded-[20px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-6 flex flex-col h-[340px] hover:border-[#4A5050] transition-colors duration-200">
      {/* Top row: title left + pill toggle right */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Trabajo completado</h3>
        {/* Pill toggle */}
        <div className="flex items-center gap-1 rounded-full border border-[#3D4141] bg-[#1A1D1D] p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#34D399]/20 text-[#34D399]"
                  : "text-[#6B7272] hover:text-[#A8AFAF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero KPI top-left */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <motion.span
            className="font-mono font-bold text-[#D7FEFA] leading-none"
            style={{ fontSize: "52px" }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {animatedValue}
          </motion.span>
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse flex-shrink-0 mb-1" />
          <span className="text-sm text-[#A8AFAF]">tareas autónomas</span>
        </div>

        {/* Secondary metric row */}
        <div className="mt-2 flex items-center gap-4">
          {[
            { label: "NUEVAS", value: String(lastEntry.nuevas), color: "#FBBF24" },
            { label: "RESUELTAS", value: String(lastEntry.resueltas), color: "#34D399" },
            { label: "TASA", value: `${tasa}%`, color: "#D7FEFA" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stat.color }} />
              <span className="font-mono text-sm font-semibold" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-[10px] text-[#6B7272] uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart fills remaining space */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{ width: "100%", height: "100%" }}
          >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
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
              itemStyle={{ fontFamily: "monospace" }}
              formatter={(value, name) => [
                <span key={String(name)} style={{ color: name === "Resueltas" ? "#34D399" : "#FBBF24", fontFamily: "monospace" }}>{String(value)}</span>,
                name,
              ]}
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
          </motion.div>
        </AnimatePresence>
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

// Subcomponent: KPI Card (for KpiCardsRow)
function KpiCard({
  label,
  value,
  badge,
  accentColor,
  Icon,
  sparklineData: sparkline,
  sparklineColor,
  detailStats,
  isExpanded,
  onToggle,
}: {
  label: string;
  value: string;
  subtitle?: string;
  badge?: string;
  accentColor: string;
  Icon: typeof Zap;
  sparklineData: number[];
  sparklineColor: string;
  detailStats: { label: string; value: string }[];
  isExpanded: boolean;
  onToggle: (label: string) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

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
      className="relative flex flex-col border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] rounded-[12px] flex-1 min-h-[88px] cursor-pointer overflow-hidden hover:border-[#4A5050] transition-colors duration-200"
      variants={cardVariants}
      whileHover={{ y: -1, boxShadow: "0 6px 24px rgba(0,0,0,0.3)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ borderColor: isExpanded ? accentColor + "40" : "#3D4141", transition: "border-color 0.2s, box-shadow 0.2s" }}
      onClick={() => onToggle(label)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + "40";
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accentColor}40, 0 4px 20px ${accentColor}14`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isExpanded ? accentColor + "40" : "#3D4141";
        e.currentTarget.style.boxShadow = isExpanded ? `0 0 0 1px ${accentColor}40, 0 4px 20px ${accentColor}14` : "none";
      }}
    >
      {/* Main row */}
      <div className="flex flex-row items-center gap-3 px-3 py-3">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[12px]"
        style={{ backgroundColor: accentColor }}
      />

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ml-1"
        style={{ backgroundColor: accentColor + "14" }}
      >
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
      </div>

      {/* Center: label + value */}
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272] truncate">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <motion.span
            className="font-mono font-bold leading-none text-white"
            style={{ fontSize: "24px" }}
          >
            {display}
          </motion.span>
          {/* Badge dot with hover tooltip */}
          {badge && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <span
                className="h-2 w-2 rounded-full block flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              {showTooltip && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg border border-[#3D4141] bg-[#1A1D1D] px-2 py-1 text-[10px] font-medium z-50"
                  style={{ color: accentColor }}
                >
                  {badge}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        {/* Sparkline right */}
        <div className="flex-shrink-0">
          <LineChart width={60} height={32} data={chartData}>
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
      </div>

      {/* Expandable detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Full-width sparkline */}
            <div className="px-3 pb-1">
              <LineChart width={220} height={60} data={chartData} style={{ width: "100%" }}>
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                />
              </LineChart>
            </div>
            {/* Divider */}
            <div className="mx-3 h-px bg-[#3D4141]" />
            {/* Mini stats */}
            <div className="px-3 py-2 flex flex-col gap-1">
              {detailStats.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A8AFAF]">{s.label}</span>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: accentColor }}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Subcomponent: KPI Cards Row (Nivel 4)
function KpiCardsRow({ onViewExceptions, hasMounted }: { onViewExceptions: () => void; hasMounted?: boolean }) {
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);

  function handleToggle(label: string) {
    setExpandedKpi((prev) => (prev === label ? null : label));
  }

  return (
    <motion.div
      className="grid grid-cols-4 gap-2 items-start"
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
        isExpanded={expandedKpi === "Piloto automático"}
        onToggle={handleToggle}
        detailStats={[
          { label: "Promedio 7d", value: "11.2%" },
          { label: "Meta", value: "<10%" },
        ]}
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
        isExpanded={expandedKpi === "Sin intervención"}
        onToggle={handleToggle}
        detailStats={[
          { label: "Promedio 7d", value: "90.4%" },
          { label: "Meta", value: ">90%" },
        ]}
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
        isExpanded={expandedKpi === "Tiempo decisión"}
        onToggle={handleToggle}
        detailStats={[
          { label: "Promedio 7d", value: "4.8s" },
          { label: "Meta", value: "<5s" },
        ]}
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
        isExpanded={expandedKpi === "Agentes activos"}
        onToggle={handleToggle}
        detailStats={[
          { label: "Promedio 7d", value: "46 / 50" },
          { label: "En revisión", value: "3" },
        ]}
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeExceptions = agents
    .filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended")
    .sort((left, right) => right.economic_risk.amount - left.economic_risk.amount);

  const [badgeCount, setBadgeCount] = useState(activeExceptions.length);
  useEffect(() => {
    setBadgeCount(activeExceptions.length);
  }, [activeExceptions.length]);
  useEffect(() => {
    const cap = activeExceptions.length + 2;
    const interval = setInterval(() => {
      setBadgeCount(prev => prev < cap ? prev + 1 : prev);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeExceptions.length]);

  return (
    <section className="flex flex-col rounded-[20px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-6 h-full hover:border-[#4A5050] transition-colors duration-200">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[#2B2E2E]/80 backdrop-blur-sm pb-3 pt-1 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Excepciones</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-[#6B7272] hover:text-[#A8AFAF] transition-colors">
              Recientes
              <ChevronDown className="h-3 w-3" />
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={badgeCount}
                className="rounded-full bg-[#F6F4D2]/10 border border-[#F6F4D2]/20 px-2.5 py-1 text-xs font-medium"
                initial={{ scale: 1.3, color: "#F87171" }}
                animate={{ scale: 1, color: "#F6F4D2" }}
                transition={{ duration: 0.4 }}
              >
                {badgeCount}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <p className="text-sm text-[#A8AFAF] mt-1">Prioriza por impacto económico</p>
      </div>

      {/* Scrollable List */}
      <motion.div
        className="flex-1 overflow-y-auto min-h-0"
        variants={getListVariants(hasMounted)}
        initial="hidden"
        animate="visible"
      >
        {activeExceptions.slice(0, 6).map((agent) => {
          const Icon = typeIcons[agent.type];
          const impactColor = getImpactColor(agent.economic_risk.amount);

          const typeColors: Record<string, string> = {
            sales: "#FBBF24",
            maintenance: "#F87171",
            asset_mgmt: "#D7FEFA",
            screening: "#A78BFA",
          };
          const avatarColor = typeColors[agent.type] || "#6B7272";

          const isHovered = hoveredId === agent.id;

          return (
            <motion.div
              key={agent.id}
              variants={itemVariants}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-3 py-3 px-1 cursor-pointer border-b border-[#3D4141] last:border-b-0 transition-all duration-200"
              onClick={onViewExceptions}
              onMouseEnter={() => setHoveredId(agent.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Avatar icon — 36px rounded-full */}
              <div
                className="relative h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full"
                style={{ backgroundColor: avatarColor + "18" }}
              >
                <Icon className="h-4 w-4" style={{ color: avatarColor }} />
                {agent.status === "circuit_open" && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#F87171] animate-pulse" />
                )}
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white leading-tight">{humanAgentName(agent)}</p>
                <p className="mt-0.5 truncate text-xs text-[#A8AFAF]">{humanDescription(agent)}</p>
              </div>

              {/* Right: pill when idle, action buttons when hovered */}
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <AnimatePresence mode="wait">
                  {isHovered ? (
                    <motion.div
                      key="actions"
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewExceptions(); }}
                        className="bg-[#34D399]/15 text-[#34D399] px-2 py-1 rounded-lg text-[10px] font-medium hover:bg-[#34D399]/25 transition-colors"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#3D4141] text-[#6B7272] px-2 py-1 rounded-lg text-[10px] hover:bg-[#4A5050] transition-colors"
                      >
                        Ignorar
                      </button>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="pill"
                      className="px-2 py-0.5 rounded-full font-mono text-sm font-bold"
                      style={{ backgroundColor: impactColor + "1A", color: impactColor }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      ${economicImpactK(agent)}K
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Connect CTA — full width */}
      <button
        onClick={onViewExceptions}
        className="mt-4 w-full bg-[#34D399] text-black font-semibold rounded-xl py-2.5 hover:bg-[#2EBB85] transition-colors text-sm"
      >
        Conectar y resolver
      </button>
    </section>
  );
}

// Main Component
export function OperatorSummary({ agents, onViewExceptions }: { agents: Agent[]; onViewExceptions: () => void }) {
  const [time, setTime] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showRiskBreakdown, setShowRiskBreakdown] = useState(false);
  const riskRef = useRef<HTMLDivElement>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [flashedRate, setFlashedRate] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const base = agents.length > 0
        ? 100 - (agents.filter(a => a.status === "intervention_required" || a.status === "circuit_open" || a.status === "suspended").length / agents.length) * 100
        : 100;
      const jitter = (Math.random() * 4 - 2);
      setFlashedRate(`${Math.min(100, Math.max(0, base + jitter)).toFixed(1)}%`);
      setFlashKey(k => k + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [agents]);

  useEffect(() => {
    if (!showRiskBreakdown) return;
    function handleMouseDown(e: MouseEvent) {
      if (riskRef.current && !riskRef.current.contains(e.target as Node)) {
        setShowRiskBreakdown(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showRiskBreakdown]);

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
      className="h-full min-h-0 overflow-y-auto bg-[#1A1D1D] px-4 py-4 md:px-8 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasMounted ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fila 1: Header — delay 0s */}
      <motion.header
        className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : -10 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        {/* Left: two-line greeting */}
        <div>
          <p className="text-sm text-[#A8AFAF] mb-0.5">¡Bienvenido de vuelta!</p>
          <h1 className="text-2xl font-semibold text-white">
            Operador <span className="text-[#D7FEFA]">Vega</span>
          </h1>
          <p className="mt-1 text-xs text-[#6B7272]">
            {todayLabel()}
          </p>
        </div>

        {/* Right: clock chip + bell + settings + pause */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live clock chip */}
          <span className="font-mono text-xs text-[#A8AFAF] bg-[#2B2E2E] border border-[#3D4141] px-3 py-1 rounded-full">
            {formatTime(time)}
          </span>
          {/* Bell icon */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2B2E2E] border border-[#3D4141] text-[#6B7272] hover:text-white hover:border-[#4A5050] transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          {/* Settings icon */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2B2E2E] border border-[#3D4141] text-[#6B7272] hover:text-white hover:border-[#4A5050] transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          {/* Pause fleet */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#F87171]/40 text-[#F87171] bg-[#F87171]/5 hover:bg-[#F87171]/10 transition-colors text-sm font-medium">
            <Pause className="h-4 w-4" />
            <span className="hidden sm:inline">Pausar flota</span>
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
        className="mb-4 md:mb-6 grid grid-cols-2 gap-2 md:flex md:items-center md:gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: hasMounted ? 1 : 0, y: hasMounted ? 0 : -8 }}
        transition={{ duration: 0.4, delay: 0.28 }}
      >
        {[
          { label: "Flota activa", value: `${agents.filter(a => a.status === "running" || a.status === "idle").length} / ${agents.length}`, color: "#34D399" },
          { label: "Tasa autónoma", value: flashedRate ?? `${agents.length > 0 ? (100 - (agents.filter(a => a.status === "intervention_required" || a.status === "circuit_open" || a.status === "suspended").length / agents.length) * 100).toFixed(1) : "100.0"}%`, color: "#D7FEFA", flashKey },
          { label: "Alertas activas", value: `${agents.filter(a => a.status === "intervention_required" || a.status === "circuit_open").length}`, color: "#F87171" },
        ].map((pill) => (
          <div
            key={pill.label}
            className="flex items-center gap-3 rounded-[12px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] px-4 py-2.5 md:flex-1"
          >
            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: pill.color }} />
            <span className="text-[10px] text-[#6B7272] uppercase tracking-wider flex-1">{pill.label}</span>
            {"flashKey" in pill ? (
              <motion.span
                key={(pill as { flashKey: number }).flashKey}
                className="font-mono text-sm font-semibold"
                style={{ color: pill.color }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {pill.value}
              </motion.span>
            ) : (
              <span className="font-mono text-sm font-semibold" style={{ color: pill.color }}>{pill.value}</span>
            )}
          </div>
        ))}

        {/* Riesgo acumulado — interactive pill with breakdown popover */}
        {(() => {
          const totalRisk = agents.reduce((s, a) => s + (a.economic_risk?.amount ?? 0), 0);
          const typeColors: Record<string, string> = { sales: "#FBBF24", asset_mgmt: "#D7FEFA", maintenance: "#F87171", screening: "#A78BFA" };
          const typeLabels: Record<string, string> = { sales: "Ventas", asset_mgmt: "Activos", maintenance: "Mant.", screening: "Eval." };
          const byType = (["sales", "asset_mgmt", "maintenance", "screening"] as const).map((type) => ({
            type,
            label: typeLabels[type],
            color: typeColors[type],
            amount: agents.filter(a => a.type === type).reduce((s, a) => s + (a.economic_risk?.amount ?? 0), 0),
          }));
          return (
            <div ref={riskRef} className="relative flex-1">
              <div
                className={`flex items-center gap-3 rounded-[12px] border backdrop-blur-sm bg-white/[0.02] px-4 py-2.5 cursor-pointer transition-colors ${
                  showRiskBreakdown ? "border-[#FBBF24]/40 bg-[#FBBF24]/5" : "border-[#3D4141] hover:border-[#4A5050]"
                }`}
                onClick={() => setShowRiskBreakdown((v) => !v)}
              >
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 bg-[#FBBF24]" />
                <span className="text-[10px] text-[#6B7272] uppercase tracking-wider flex-1">Riesgo acumulado</span>
                <span className="font-mono text-sm font-semibold text-[#FBBF24]">${totalRisk.toLocaleString()}</span>
              </div>

              <AnimatePresence>
                {showRiskBreakdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-2 z-50 w-full min-w-[220px] rounded-xl border border-[#4A5050] bg-[#1A1D1D] p-4 shadow-2xl"
                  >
                    <p className="text-xs font-semibold text-white mb-3">Desglose de riesgo</p>
                    <div className="flex flex-col gap-2.5">
                      {byType.map((row) => (
                        <div key={row.type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-[#A8AFAF]">{row.label}</span>
                            <span className="font-mono text-xs" style={{ color: row.color }}>
                              ${row.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-0.5 rounded-full bg-[#3D4141] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: row.color }}
                              initial={{ width: 0 }}
                              animate={{ width: totalRisk > 0 ? `${(row.amount / totalRisk) * 100}%` : "0%" }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={onViewExceptions}
                      className="mt-3 text-[10px] text-[#D7FEFA] cursor-pointer hover:underline"
                    >
                      Ver auditoría completa →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}
      </motion.div>

      {/* Fila 4: Grid principal 3 columnas */}
      <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-[240px_1fr_320px]">
        {/* Columna izquierda — Sidebar stats */}
        <motion.div
          className="flex flex-col gap-4 order-2 md:order-1"
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
              const isActive = typeFilter === type;
              const color = typeColors[type];
              // TODO: wire typeFilter to actual data filtering downstream
              return (
                <div
                  key={type}
                  className="flex flex-col gap-1 cursor-pointer rounded-lg px-2 -mx-2 py-1 transition-colors duration-150"
                  style={isActive ? { border: `1px solid ${color}30`, background: `${color}08` } : {}}
                  onClick={() => setTypeFilter(isActive ? null : type)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A8AFAF]">{typeLabels[type]}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-white">{count}</span>
                      {isActive && <X className="h-3 w-3" style={{ color }} />}
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-[#3D4141] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      animate={{ width: typeFilter && !isActive ? "0%" : `${pct}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
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
            ] as { key: string; label: string; color: string }[]).map((s) => {
              const isActive = statusFilter === s.key;
              const count = agents.filter(a => a.status === s.key).length;
              const pct = agents.length > 0 ? (count / agents.length) * 100 : 0;
              // TODO: wire statusFilter to actual data filtering downstream
              return (
                <div
                  key={s.key}
                  className="flex flex-col gap-1 cursor-pointer rounded-lg px-2 -mx-2 py-1 transition-colors duration-150"
                  style={isActive ? { border: `1px solid ${s.color}30`, background: `${s.color}08` } : {}}
                  onClick={() => setStatusFilter(isActive ? null : s.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-[#A8AFAF]">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-white">{count}</span>
                      {isActive && <X className="h-3 w-3" style={{ color: s.color }} />}
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-[#3D4141] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                      animate={{ width: statusFilter && !isActive ? "0%" : `${pct}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clock card */}
          <div className="rounded-[16px] border border-[#3D4141] backdrop-blur-sm bg-white/[0.02] p-4 flex flex-col gap-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#6B7272]">Tiempo operativo</p>
            <span className="font-mono text-lg font-bold text-[#D7FEFA]">{formatTime(time)}</span>
            <span className="text-xs text-[#6B7272]">6h sin interrupciones</span>
          </div>
        </motion.div>

        {/* Columna central — main content */}
        <div className="flex flex-col gap-5 order-1 md:order-2">
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
          className="order-3"
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
