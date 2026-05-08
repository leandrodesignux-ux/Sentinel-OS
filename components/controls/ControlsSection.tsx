"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, Home, Loader2, Power, Search, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore, type CircuitBreakerLevel, type EmergencyScope } from "@/store/agentStore";
import type { Agent, AgentType } from "@/types/agent";

const cbLevels: { level: CircuitBreakerLevel; label: string; tone: string }[] = [
  { level: 1, label: "Solo leer", tone: "border-amber-300 bg-amber-50 text-amber-700" },
  { level: 2, label: "Congelar", tone: "border-yellow-300 bg-yellow-50 text-yellow-700" },
  { level: 3, label: "Sin acceso", tone: "border-orange-300 bg-orange-50 text-orange-700" },
  { level: 4, label: "Suspender", tone: "border-red-200 bg-red-50 text-red-700" },
];

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

const typeHumanLabels: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mantenimiento",
  screening: "Evaluación",
};

const statusLabels: Record<Agent["status"], { label: string; bg: string; color: string }> = {
  idle: { label: "En espera", bg: "bg-gray-100", color: "text-gray-600" },
  running: { label: "Activo", bg: "bg-green-100", color: "text-green-700" },
  monitoring: { label: "Monitoreando", bg: "bg-yellow-100", color: "text-yellow-700" },
  intervention_required: { label: "Intervención", bg: "bg-red-100", color: "text-red-700" },
  circuit_open: { label: "Cortacircuito", bg: "bg-red-100", color: "text-red-700" },
  suspended: { label: "Inactivo", bg: "bg-gray-100", color: "text-gray-600" },
};

const scenarios = [
  { id: "price_loop", label: "Agente con precios incorrectos 💰", description: "Un agente empieza a poner precios erróneos y otros lo copian", color: "#F79009", action: "activatePriceLoopScenario" },
  { id: "screening_bias", label: "Posible discriminación detectada ⚖️", description: "Un agente rechaza solicitudes con un patrón inusual", color: "#8B5CF6", action: "activateScreeningBiasScenario" },
  { id: "retry_storm", label: "Agente gastando presupuesto de más 💸", description: "Un agente de mantenimiento gasta mucho más de lo normal", color: "#F04438", action: "activateRetryStormScenario" },
];

export function ControlsSection({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [pendingBreaker, setPendingBreaker] = useState<{ agent: Agent; level: CircuitBreakerLevel } | null>(null);
  const [scope, setScope] = useState<EmergencyScope>("all");
  const [confirmation, setConfirmation] = useState("");
  const [reactivationConfirmation, setReactivationConfirmation] = useState("");
  const [overlay, setOverlay] = useState(false);
  const [toastCountdown, setToastCountdown] = useState<number | null>(null);
  const [thresholds, setThresholds] = useState({ ventas: 82, activos: 86, mantenimiento: 78, evaluación: 91 });
  const circuitBreakers = useAgentStore((state) => state.circuitBreakers);
  const activeScenario = useAgentStore((state) => state.activeScenario);
  const setCircuitBreakerLevel = useAgentStore((state) => state.setCircuitBreakerLevel);
  const activatePriceLoopScenario = useAgentStore((state) => state.activatePriceLoopScenario);
  const activateScreeningBiasScenario = useAgentStore((state) => state.activateScreeningBiasScenario);
  const activateRetryStormScenario = useAgentStore((state) => state.activateRetryStormScenario);
  const containScenarioFamily = useAgentStore((state) => state.containScenarioFamily);
  const emergencyHalt = useAgentStore((state) => state.emergencyHalt);
  const triggerEmergencyHalt = useAgentStore((state) => state.triggerEmergencyHalt);
  const reactivateFleet = useAgentStore((state) => state.reactivateFleet);

  const listedAgents = useMemo(() => agents.filter((agent) => !query || `${agent.id} ${agent.name}`.toLowerCase().includes(query.toLowerCase())), [agents, query]);
  const affectedAgents = agents.filter((agent) => {
    if (scope === "all") return agent.status !== "suspended";
    if (scope === "critical") return agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical";
    return agent.status !== "suspended";
  });
  const activeTasks = affectedAgents.reduce((sum, agent) => sum + Math.max(1, agent.dependencies.length + 1), 0);
  const criticalCount = agents.filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical").length;

  function startCountdown() {
    setToastCountdown(30);
    const interval = setInterval(() => {
      setToastCountdown((value) => {
        if (!value || value <= 1) {
          clearInterval(interval);
          return null;
        }
        return value - 1;
      });
    }, 1000);
  }

  function confirmCB(agent: Agent, level: CircuitBreakerLevel) {
    setPendingBreaker({ agent, level });
  }

  function executeCB() {
    if (!pendingBreaker) return;
    setCircuitBreakerLevel(pendingBreaker.agent.id, pendingBreaker.level);
    setPendingBreaker(null);
  }

  function activateScenario(id: string) {
    if (id === "price_loop") activatePriceLoopScenario();
    else if (id === "screening_bias") activateScreeningBiasScenario();
    else if (id === "retry_storm") activateRetryStormScenario();
  }

  function executeStop() {
    if (confirmation !== "PAUSAR") return;
    setOverlay(true);
    setTimeout(() => {
      triggerEmergencyHalt(scope === "all" || scope === "critical" ? scope : "sales");
      setOverlay(false);
      setConfirmation("");
      startCountdown();
    }, 1500);
  }

  function executeReactivation() {
    if (reactivationConfirmation !== "PAUSAR") return;
    reactivateFleet();
    setReactivationConfirmation("");
  }

  function updateThreshold(type: string, value: number) {
    setThresholds((current) => ({ ...current, [type]: value }));
  }

  useEffect(() => () => setOverlay(false), []);

  return (
    <div className="grid h-full min-h-0 grid-cols-[55fr_45fr] gap-4 overflow-hidden">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="mt-4 font-semibold text-xl text-red-600">Enviando señal de parada...</p>
        </div>
      )}

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <section className="rounded-2xl border border-[var(--bg-border)] bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Control individual de agentes</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Ajusta el nivel de independencia de cada agente</p>
          
          <div className="flex items-center gap-2 rounded-xl border border-[var(--bg-border)] bg-white px-3 py-2 mb-4">
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
            <input placeholder="Buscar agente..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent text-sm outline-none w-full" />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
            {listedAgents.map((agent) => {
              const Icon = typeIcons[agent.type];
              const activeLevel = circuitBreakers[agent.id] ?? 0;
              const status = statusLabels[agent.status];
              return (
                <div key={agent.id} className="rounded-xl border border-[var(--bg-border)] bg-white p-3 mb-2 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-[var(--bg-canvas)] flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{agent.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{typeLabels[agent.type]}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {cbLevels.map((item) => (
                      <button key={item.level} onClick={() => confirmCB(agent, item.level)} className={cn("flex-1 rounded-lg py-1.5 text-[10px] font-medium border transition-colors", activeLevel === item.level ? item.tone : "border-[var(--bg-border)] bg-[var(--bg-canvas)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]")}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {pendingBreaker && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-900">¿Confirmar nivel "{cbLevels.find((l) => l.level === pendingBreaker.level)?.label}" para {pendingBreaker.agent.name}?</p>
              <div className="mt-2 flex gap-2">
                <button onClick={executeCB} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Sí, confirmar</button>
                <button onClick={() => setPendingBreaker(null)} className="rounded-xl bg-white border border-[var(--bg-border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">Cancelar</button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--bg-border)] bg-white p-4 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)]">Demostración en vivo</h3>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">Solo para demo</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-3">Activa una situación de riesgo para ver cómo responde el sistema</p>
          
          {scenarios.map((scenario) => {
            const active = activeScenario?.mode === scenario.id;
            return (
              <div key={scenario.id} className={cn("rounded-xl border border-[var(--bg-border)] p-3 mb-2 hover:border-[var(--status-accent)]/40 hover:bg-blue-50/30 transition-colors cursor-pointer", active && "border-amber-300 bg-amber-50")} style={{ borderLeft: `3px solid ${active ? "#F79009" : scenario.color}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{scenario.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{scenario.description}</p>
                  </div>
                  <button onClick={() => active ? containScenarioFamily() : activateScenario(scenario.id)} className="ml-3 flex-shrink-0 rounded-lg border border-[var(--bg-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                    {active ? "Detener" : "Activar"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Power className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Pausar toda la flota</h3>
              <p className="text-xs text-[var(--text-muted)]">Solo para emergencias</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-white border border-[var(--bg-border)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{affectedAgents.length}</p>
              <p className="text-xs text-[var(--text-muted)]">agentes se detendrán</p>
            </div>
            <div className="rounded-xl bg-white border border-[var(--bg-border)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{activeTasks}</p>
              <p className="text-xs text-[var(--text-muted)]">tareas en pausa</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {[
              { value: "all", label: "Pausar toda la flota", desc: "Todos los agentes activos" },
              { value: "critical", label: "Solo los que dan error", desc: `${criticalCount} agentes con alertas activas` },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--bg-border)] bg-white cursor-pointer hover:bg-[var(--bg-hover)]">
                <input type="radio" name="scope" value={opt.value} checked={scope === opt.value} onChange={() => setScope(opt.value as EmergencyScope)} className="text-[var(--status-accent)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          
          <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder='Escribe "PAUSAR" para confirmar' className="w-full rounded-xl border border-[var(--bg-border)] bg-white px-3 py-2.5 text-sm mb-3 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" />
          
          <button disabled={confirmation !== "PAUSAR"} onClick={executeStop} className="w-full rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed">
            Pausar la flota
          </button>

          {toastCountdown !== null && <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" /> Parada aplicada · Deshacer ({toastCountdown}s)</div>}
          
          {emergencyHalt.active && (
            <div className="mt-4 rounded-xl bg-white border border-red-200 p-3">
              <p className="font-semibold text-sm text-red-700">Estado de parada</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">Ejecutada: {new Date(emergencyHalt.startedAt ?? "").toLocaleString("es-ES")}</p>
              <p className="text-xs text-[var(--text-muted)]">Agentes detenidos: {emergencyHalt.affectedAgentIds.length} / {agents.length}</p>
              <input value={reactivationConfirmation} onChange={(e) => setReactivationConfirmation(e.target.value)} placeholder='Escribe "PAUSAR" para reactivar' className="mt-3 w-full rounded-xl border border-[var(--bg-border)] bg-white px-3 py-2 text-sm outline-none" />
              <button disabled={reactivationConfirmation !== "PAUSAR"} onClick={executeReactivation} className="mt-2 w-full rounded-xl bg-green-600 py-2 text-sm font-semibold text-white disabled:opacity-40">Reactivar flota</button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--bg-border)] bg-white p-4 shadow-sm mt-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Umbrales de aprobación por tipo</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">Cuánta seguridad necesita un agente para actuar solo</p>
          
          {Object.entries(thresholds).map(([type, value]) => (
            <div key={type} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-[var(--text-primary)]">{typeHumanLabels[type as AgentType]}</span>
                <span className="text-[var(--status-accent)] font-bold">{value}%</span>
              </div>
              <input type="range" min={70} max={99} value={value} onChange={(e) => updateThreshold(type, +e.target.value)} className="w-full accent-[var(--status-accent)]" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
                <span>Más supervisión</span>
                <span>Más autonomía</span>
              </div>
            </div>
          ))}
          
          <button className="mt-2 w-full rounded-xl border border-[var(--status-accent)]/30 bg-blue-50 py-2 text-sm font-medium text-[var(--status-accent)] hover:bg-blue-100 transition-colors">
            Guardar cambios
          </button>
        </section>
      </div>
    </div>
  );
}
