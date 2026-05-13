"use client";

import { useState } from "react";
import { AlertTriangle, Building2, DollarSign, Home, LayoutGrid, Search, Shield, Users, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import { cn } from "@/lib/utils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import type { Agent, AgentType } from "@/types/agent";

const typeIcons: Record<AgentType, typeof Building2> = {
  sales: Building2, asset_mgmt: Home, maintenance: Wrench, screening: Users,
};
const typeLabels: Record<AgentType, string> = {
  sales: "Ventas", asset_mgmt: "Activos", maintenance: "Mantenimiento", screening: "Evaluación",
};
const typeColors: Record<AgentType, { bg: string; accent: string; pill: string }> = {
  sales:       { bg: "rgba(215,254,250,0.08)", accent: "#D7FEFA", pill: "rgba(215,254,250,0.12)" },
  asset_mgmt:  { bg: "rgba(52,211,153,0.08)",  accent: "#34D399", pill: "rgba(52,211,153,0.12)" },
  maintenance: { bg: "rgba(251,191,36,0.08)",  accent: "#FBBF24", pill: "rgba(251,191,36,0.12)" },
  screening:   { bg: "rgba(167,139,250,0.08)", accent: "#A78BFA", pill: "rgba(167,139,250,0.12)" },
};

function confColor(c: number) {
  return c >= 0.9 ? "#34D399" : c >= 0.8 ? "#FBBF24" : "#F87171";
}
function humanLabel(action: string) {
  const m: Record<string, string> = {
    "Evaluated tenant credit score": "Revisó crédito del inquilino",
    "Checked lease compliance policy": "Verificó cumplimiento del contrato",
    "Queried property maintenance ledger": "Consultó historial de mantenimiento",
    "Scored economic exposure": "Calculó exposición económica",
    "Validated regional operating constraint": "Validó restricciones de la zona",
    "Generated recommended containment action": "Generó plan de acción",
    "Compared anomaly against historical baseline": "Comparó con datos históricos",
    "Resolved dependency state from upstream agent": "Verificó agentes relacionados",
  };
  return m[action] ?? action;
}
function humanSource(s: string) {
  return s.replace(/_/g, " ").replace("api", "API").replace("v2", "").trim();
}
function humanReason(r: string) {
  const m: Record<string, string> = {
    "Price anomaly detected across dependent agents": "Detectó precios anormales en agentes relacionados",
    "Statistical bias detected in tenant screening": "Patrón inusual en evaluaciones de inquilinos",
    "Budget consumption accelerating beyond normal rate": "Presupuesto gastándose más rápido de lo normal",
    "Confidence dropped below operational threshold": "Nivel de confianza bajo del mínimo aceptable",
  };
  return m[r] ?? r;
}
function minutesAgo(ts: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 60000));
}

export function DecisionAuditPanel({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [localId, setLocalId] = useState<string | null>(null);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const agentsWithSteps = agents.filter((a) => a.decision_path.length > 0);
  const filtered = agentsWithSteps.filter((a) =>
    !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase())
  );
  const selected = agents.find((a) => a.id === (localId ?? selectedAgentId)) ?? agentsWithSteps[0];
  const tc = selected ? typeColors[selected.type] : typeColors.sales;
  const Icon = selected ? typeIcons[selected.type] : Building2;

  return (
    <div className="flex h-full gap-4 overflow-hidden">

      {/* ── LISTA LATERAL ── */}
      <aside className="w-[300px] flex-shrink-0 flex flex-col bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] overflow-hidden">
        <div className="p-4 border-b border-[#3D4141]">
          <h3 className="text-[15px] font-semibold text-white mb-3">Agentes con actividad</h3>
          <div className="flex items-center gap-2 bg-[#1A1D1D] rounded-xl px-3 py-2 border border-[#3D4141]">
            <Search className="h-3.5 w-3.5 text-[#6B7272]" />
            <input placeholder="Buscar agente..." value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-[#6B7272] outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((agent) => {
            const AIcon = typeIcons[agent.type];
            const ac = typeColors[agent.type];
            const isSelected = agent.id === (localId ?? selectedAgentId) || (!localId && !selectedAgentId && agent === agentsWithSteps[0]);
            const mins = minutesAgo(agent.metadata.last_human_touch);
            const conf = Math.round(agent.confidence_score * 100);
            return (
              <motion.button key={agent.id} whileHover={{ scale: 1.01 }} onClick={() => setLocalId(agent.id)}
                className={cn("w-full text-left rounded-xl p-3 mb-1 transition-all",
                  isSelected ? "border border-[#D7FEFA]/30 bg-[#D7FEFA]/10" : "border border-transparent hover:bg-[#333737]")}>
                <div className="flex items-center gap-3">
                  {/* Ícono coloreado por tipo */}
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: ac.bg }}>
                    <AIcon className="h-4.5 w-4.5" style={{ color: ac.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-white truncate">{agent.name}</p>
                      {agent.status === "intervention_required" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F87171] flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7272]">{typeLabels[agent.type]} · {agent.decision_path.length} pasos</p>
                  </div>
                  {/* Badge confianza */}
                  <span className="text-[11px] font-mono font-bold flex-shrink-0"
                    style={{ color: confColor(agent.confidence_score) }}>
                    {conf}%
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </aside>

      {/* ── PANEL DERECHO ── */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {selected && (
          <AnimatePresence mode="wait">
            <motion.div key={selected.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Header del agente */}
              <div className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] p-5 mb-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: tc.bg }}>
                  <Icon className="h-6 w-6" style={{ color: tc.accent }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-[18px] font-semibold text-white">{selected.name}</h2>
                  <p className="text-[12px] text-[#A8AFAF]">
                    Última actividad hace {minutesAgo(selected.metadata.last_human_touch)} min · {typeLabels[selected.type]}
                  </p>
                </div>
                {/* Stats con ícono */}
                <div className="flex gap-2 ml-auto">
                  {[
                    { Icon: DollarSign, label: "En juego", value: `$${economicImpactK(selected)}K`, color: "#F87171" },
                    { Icon: Shield, label: "Seguridad", value: `${Math.round(selected.confidence_score * 100)}%`, color: confColor(selected.confidence_score) },
                    { Icon: LayoutGrid, label: "Activos", value: String(selected.economic_risk.affected_assets), color: "#FFFFFF" },
                  ].map(({ Icon: SIcon, label, value, color }) => (
                    <div key={label} className="flex flex-col items-center justify-center bg-[#1A1D1D] rounded-xl px-4 py-2.5 min-w-[80px] border border-[#3D4141]">
                      <SIcon className="h-3.5 w-3.5 mb-1" style={{ color }} />
                      <p className="text-[15px] font-bold font-mono leading-none" style={{ color }}>{value}</p>
                      <p className="text-[10px] text-[#6B7272] mt-0.5 uppercase tracking-wide">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerta si hay excepción */}
              {selected.exception_reason && (
                <div className="rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#FBBF24] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#FBBF24]">¿Por qué te lo mostramos?</p>
                    <p className="text-[12px] text-[#A8AFAF] mt-0.5">{humanReason(selected.exception_reason)}</p>
                  </div>
                </div>
              )}

              {/* Timeline de decisión */}
              <div className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] p-5 mb-4">
                <h3 className="text-[15px] font-semibold text-white mb-5">¿Cómo llegó a esta decisión?</h3>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-px border-l-2 border-[#3D4141]" />
                  {selected.decision_path.map((step, i) => {
                    const c = step.confidence;
                    const stepColor = confColor(c);
                    const stepBg = c >= 0.9 ? "rgba(52,211,153,0.1)" : c >= 0.8 ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)";
                    const stepBorder = c >= 0.9 ? "#34D399" : c >= 0.8 ? "#FBBF24" : "#F87171";
                    return (
                      <motion.div key={step.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="relative flex gap-4 mb-3 last:mb-0">
                        {/* Círculo numerado con color fuerte */}
                        <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 font-bold text-[13px]"
                          style={{ background: stepBg, borderColor: stepBorder, color: stepColor }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 rounded-xl border border-[#3D4141] bg-[#1A1D1D] p-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[13px] font-semibold text-white">{humanLabel(step.action)}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#6B7272]">
                                {new Date(step.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {/* Barra de confianza con color sólido */}
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-20 rounded-full bg-[#3D4141] overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${Math.round(c * 100)}%`, background: stepColor }} />
                                </div>
                                <span className="text-[11px] font-semibold font-mono" style={{ color: stepColor }}>
                                  {Math.round(c * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#6B7272]">Fuente: {humanSource(step.data_source)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de fuentes */}
              <div className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] p-5">
                <h3 className="text-[14px] font-semibold text-white mb-4">¿En qué información se basó?</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Fuentes consultadas", value: `${selected.decision_path.length} fuentes distintas` },
                    { label: "Última actualización", value: `Hace ${minutesAgo(selected.metadata.last_human_touch)} min` },
                    { label: "Agentes dependientes", value: `${selected.dependencies.length} agentes` },
                    { label: "Intervenciones hoy", value: String(selected.metadata.exceptions_today) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#1A1D1D] rounded-xl p-3 border border-[#3D4141]">
                      <p className="text-[11px] text-[#6B7272] uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-[14px] font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
