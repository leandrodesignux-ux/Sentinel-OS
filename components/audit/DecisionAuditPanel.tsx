"use client";

import { useState } from "react";
import { AlertTriangle, Building2, Home, Search, Users, Wrench } from "lucide-react";
import { useAgentStore } from "@/store/agentStore";
import { cn } from "@/lib/utils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import type { Agent, AgentType } from "@/types/agent";

const typeIcons: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const typeLabels: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mantenimiento",
  screening: "Evaluación",
};

const typeAccentColors: Record<AgentType, { bg: string; accent: string }> = {
  sales: { bg: "#EBF8FF", accent: "#2E90FA" },
  asset_mgmt: { bg: "#ECFDF3", accent: "#12B76A" },
  maintenance: { bg: "#FFF7ED", accent: "#F79009" },
  screening: { bg: "#F5F3FF", accent: "#8B5CF6" },
};

function humanActionLabel(action: string) {
  const map: Record<string, string> = {
    "Evaluated tenant credit score": "Revisó el crédito del inquilino",
    "Checked lease compliance policy": "Verificó cumplimiento del contrato",
    "Queried property maintenance ledger": "Consultó historial de mantenimiento",
    "Scored economic exposure": "Calculó exposición económica",
    "Validated regional operating constraint": "Validó restricciones de la zona",
    "Generated recommended containment action": "Generó plan de acción",
    "Compared anomaly against historical baseline": "Comparó con datos históricos",
    "Resolved dependency state from upstream agent": "Verificó estado de agentes relacionados",
  };
  return map[action] ?? action;
}

function humanDataSource(source: string) {
  return source.replace(/_/g, " ").replace("api", "API").replace("v2", "");
}

function humanExceptionReason(reason: string) {
  const map: Record<string, string> = {
    "Price anomaly detected across dependent agents": "Detectó precios anormales en varios agentes relacionados",
    "Statistical bias detected in tenant screening": "Encontró patrón inusual en evaluaciones de inquilinos",
    "Budget consumption accelerating beyond normal rate": "Gastando presupuesto más rápido de lo normal",
    "Confidence dropped below operational threshold": "Su nivel de confianza bajó del mínimo aceptable",
  };
  return map[reason] ?? reason;
}

function humanName(agent: Agent) {
  return agent.name;
}

function confColor(confidence: number) {
  if (confidence >= 0.9) return "#12B76A";
  if (confidence >= 0.8) return "#F79009";
  return "#F04438";
}

function confidenceColor(confidence: number) {
  if (confidence >= 90) return "#12B76A";
  if (confidence >= 80) return "#F79009";
  return "#F04438";
}

function minutesAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  return Math.floor(diff / 60000);
}

export function DecisionAuditPanel({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const selectedAgent = agents.find((agent) => agent.id === (localSelectedId ?? selectedAgentId)) ?? agents[0];

  const filteredAgents = agents.filter((agent) => {
    if (query && !agent.name.toLowerCase().includes(query.toLowerCase()) && !agent.id.toLowerCase().includes(query.toLowerCase())) return false;
    return agent.decision_path.length > 0;
  });

  return (
    <div className="flex h-full gap-4">
      <aside className="w-[35%] bg-white rounded-[20px] border border-[#E4E7EC] p-6 h-full overflow-y-auto" style={{boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"}}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">
          Agentes con actividad
        </h3>
        <input placeholder="Buscar agente..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-[var(--bg-border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm mb-3 outline-none" />
        {filteredAgents.map((agent) => {
          const Icon = typeIcons[agent.type];
          const isSelected = agent.id === (localSelectedId ?? selectedAgentId);
          const minutes = minutesAgo(agent.metadata.last_human_touch);
          return (
            <button key={agent.id} onClick={() => setLocalSelectedId(agent.id)} className={cn("w-full text-left rounded-xl p-3 mb-2 transition-colors", isSelected ? "bg-[var(--status-accent)]/10 border border-[var(--status-accent)]/30" : "hover:bg-[var(--bg-canvas)] border border-transparent")}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeAccentColors[agent.type].bg }}>
                  <Icon className="h-4 w-4" style={{ color: typeAccentColors[agent.type].accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{humanName(agent)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{agent.decision_path.length} pasos · hace {minutes} min</p>
                </div>
                {agent.status === "intervention_required" && <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />}
              </div>
            </button>
          );
        })}
      </aside>

      <div className="w-[65%] overflow-y-auto">
        {selectedAgent && (
          <>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: typeAccentColors[selectedAgent.type].bg }}>
                {(() => {
                  const Icon = typeIcons[selectedAgent.type];
                  return <Icon className="h-6 w-6" style={{ color: typeAccentColors[selectedAgent.type].accent }} />;
                })()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{humanName(selectedAgent)}</h2>
                <p className="text-sm text-[var(--text-muted)]">Última actividad hace {minutesAgo(selectedAgent.metadata.last_human_touch)} · {typeLabels[selectedAgent.type]}</p>
              </div>
              <div className="ml-auto flex gap-3">
                <div className="rounded-xl bg-[var(--bg-canvas)] px-4 py-2 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Dinero en juego</p>
                  <p className="font-bold text-red-600">${economicImpactK(selectedAgent)}K</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-canvas)] px-4 py-2 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Seguridad</p>
                  <p className="font-bold" style={{ color: confidenceColor(selectedAgent.confidence_score * 100) }}>{Math.round(selectedAgent.confidence_score * 100)}%</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-canvas)] px-4 py-2 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Propiedades</p>
                  <p className="font-bold text-[var(--text-primary)]">{selectedAgent.economic_risk.affected_assets}</p>
                </div>
              </div>
            </div>

            {selectedAgent.exception_reason && (
              <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">¿Por qué te lo mostramos?</p>
                    <p className="mt-1 text-sm text-amber-700">{humanExceptionReason(selectedAgent.exception_reason)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">¿Cómo llegó a esta decisión?</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--bg-border)]" />
                {selectedAgent.decision_path.map((step, index) => (
                  <div key={step.id} className="relative flex gap-4 mb-4 last:mb-0">
                    <div className={cn("relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2", step.confidence > 0.9 ? "border-green-200 bg-green-50" : step.confidence >= 0.8 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50")}>
                      <span className="text-xs font-bold" style={{ color: confColor(step.confidence) }}>{index + 1}</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-[#E4E7EC] bg-white p-4" style={{boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"}}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{humanActionLabel(step.action)}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--text-muted)]">{new Date(step.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-16 rounded-full bg-[var(--bg-border)]">
                              <div className="h-1.5 rounded-full" style={{ width: `${Math.round(step.confidence * 100)}%`, background: confColor(step.confidence) }} />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: confColor(step.confidence) }}>{Math.round(step.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">Fuente: {humanDataSource(step.data_source)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#E4E7EC] bg-white p-6" style={{boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"}}>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">¿En qué información se basó?</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Fuentes consultadas</p>
                  <p className="font-medium text-[var(--text-primary)] mt-0.5">{selectedAgent.decision_path.length} fuentes distintas</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Última actualización</p>
                  <p className="font-medium text-[var(--text-primary)] mt-0.5">{selectedAgent.metadata.last_human_touch}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Agentes que dependen de este</p>
                  <p className="font-medium text-[var(--text-primary)] mt-0.5">{selectedAgent.dependencies.length} agentes</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Intervenciones hoy</p>
                  <p className="font-medium text-[var(--text-primary)] mt-0.5">{selectedAgent.metadata.exceptions_today}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
