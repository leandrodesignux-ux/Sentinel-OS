"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, Home, Loader2, Power, Search, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore, type CircuitBreakerLevel, type EmergencyScope } from "@/store/agentStore";
import type { Agent, AgentType } from "@/types/agent";

const cbLevels: { level: CircuitBreakerLevel; label: string; tone: string }[] = [
  { level: 1, label: "Solo leer", tone: "border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24]" },
  { level: 2, label: "Congelar", tone: "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]" },
  { level: 3, label: "Sin acceso", tone: "border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]" },
  { level: 4, label: "Suspender", tone: "border-red-600/50 bg-red-900/30 text-red-300" },
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
  idle: { label: "En espera", bg: "bg-[#6B7272]/10", color: "text-[#6B7272]" },
  running: { label: "Activo", bg: "bg-[#34D399]/10", color: "text-[#34D399]" },
  monitoring: { label: "Monitoreando", bg: "bg-[#FBBF24]/10", color: "text-[#FBBF24]" },
  intervention_required: { label: "Intervención", bg: "bg-[#F87171]/10", color: "text-[#F87171]" },
  circuit_open: { label: "Cortacircuito", bg: "bg-[#F87171]/10", color: "text-[#F87171]" },
  suspended: { label: "Inactivo", bg: "bg-[#6B7272]/10", color: "text-[#6B7272]" },
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
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[55fr_45fr] gap-4 overflow-hidden">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="mt-4 font-semibold text-xl text-white">Enviando señal de parada...</p>
        </div>
      )}

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <section className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] p-6">
          <h2 className="font-semibold text-white mb-1">Control individual de agentes</h2>
          <p className="text-sm text-[#A8AFAF] mb-4">Ajusta el nivel de independencia de cada agente</p>
          
          <div className="flex items-center gap-2 rounded-xl border border-[#3D4141] bg-[#1A1D1D] px-3 py-2 mb-4">
            <Search className="h-4 w-4 text-[#6B7272]" />
            <input placeholder="Buscar agente..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent text-sm outline-none w-full text-white placeholder:text-[#6B7272]" />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
            {listedAgents.map((agent) => {
              const Icon = typeIcons[agent.type];
              const activeLevel = circuitBreakers[agent.id] ?? 0;
              const status = statusLabels[agent.status];
              return (
                <div key={agent.id} className="rounded-xl border border-[#3D4141] bg-[#2B2E2E] p-3 mb-2 hover:border-[#D7FEFA]/20 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-[#1A1D1D] flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#A8AFAF]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-[#6B7272]">{typeLabels[agent.type]}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium border" style={{ background: status.bg, color: status.color, borderColor: status.color.replace('text-', '').replace('[', '').replace(']', '') + '/20' }}>{status.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cbLevels.map((item) => (
                      <button key={item.level} onClick={() => confirmCB(agent, item.level)} className={cn("flex-1 rounded-lg py-1.5 text-[10px] font-medium border transition-colors", activeLevel === item.level ? item.tone : "border-[#3D4141] bg-[#1A1D1D] text-[#6B7272] hover:bg-[#333737] hover:text-[#A8AFAF]")}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {pendingBreaker && (
            <div className="mt-3 rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-3">
              <p className="text-sm font-medium text-[#FBBF24]">¿Confirmar nivel "{cbLevels.find((l) => l.level === pendingBreaker.level)?.label}" para {pendingBreaker.agent.name}?</p>
              <div className="mt-2 flex gap-2">
                <button onClick={executeCB} className="rounded-xl bg-[#F6F4D2] px-4 py-2 text-sm font-semibold text-[#1A1D1D] hover:bg-[#EDEBBF] transition-colors">Sí, confirmar</button>
                <button onClick={() => setPendingBreaker(null)} className="rounded-xl bg-[#2B2E2E] border border-[#3D4141] px-4 py-2 text-sm font-medium text-[#A8AFAF] hover:bg-[#333737] hover:text-white transition-colors">Cancelar</button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] p-6 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">Demostración en vivo</h3>
            <span className="text-xs bg-[#D7FEFA]/10 text-[#D7FEFA] border border-[#D7FEFA]/20 rounded-full px-2 py-0.5">Solo para demo</span>
          </div>
          <p className="text-sm text-[#A8AFAF] mb-3">Activa una situación de riesgo para ver cómo responde el sistema</p>
          
          {scenarios.map((scenario) => {
            const active = activeScenario?.mode === scenario.id;
            return (
              <div key={scenario.id} className={cn("rounded-xl border border-[#3D4141] p-3 mb-2 hover:border-[#D7FEFA]/40 hover:bg-[#D7FEFA]/5 transition-colors cursor-pointer", active && "border-[#FBBF24]/50 bg-[#FBBF24]/10")} style={{ borderLeft: `3px solid ${active ? "#FBBF24" : scenario.color}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{scenario.label}</p>
                    <p className="text-xs text-[#A8AFAF] mt-0.5">{scenario.description}</p>
                  </div>
                  <button onClick={() => active ? containScenarioFamily() : activateScenario(scenario.id)} className="ml-3 flex-shrink-0 rounded-lg border border-[#3D4141] bg-[#1A1D1D] px-3 py-1.5 text-xs font-medium text-[#A8AFAF] hover:bg-[#333737] hover:text-white transition-colors">
                    {active ? "Detener" : "Activar"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <section className="rounded-[20px] border border-[#F87171]/30 bg-[#F87171]/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#F87171]/20 flex items-center justify-center">
              <Power className="h-5 w-5 text-[#F87171]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Pausar toda la flota</h3>
              <p className="text-xs text-[#A8AFAF]">Solo para emergencias</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-[#1A1D1D] border border-[#3D4141] p-3 text-center">
              <p className="text-2xl font-bold text-white">{affectedAgents.length}</p>
              <p className="text-xs text-[#6B7272] leading-tight">agentes se detendrán</p>
            </div>
            <div className="rounded-xl bg-[#1A1D1D] border border-[#3D4141] p-3 text-center">
              <p className="text-2xl font-bold text-white">{activeTasks}</p>
              <p className="text-xs text-[#6B7272] leading-tight">tareas en pausa</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {[
              { value: "all", label: "Pausar toda la flota", desc: "Todos los agentes activos" },
              { value: "critical", label: "Solo los que dan error", desc: `${criticalCount} agentes con alertas activas` },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-[#3D4141] bg-[#1A1D1D] cursor-pointer hover:bg-[#333737] transition-colors">
                <input type="radio" name="scope" value={opt.value} checked={scope === opt.value} onChange={() => setScope(opt.value as EmergencyScope)} className="accent-[#D7FEFA]" />
                <div>
                  <p className="text-sm font-medium text-white">{opt.label}</p>
                  <p className="text-xs text-[#6B7272]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          
          <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder='Escribe "PAUSAR" para confirmar' className="w-full rounded-xl border border-[#3D4141] bg-[#1A1D1D] px-3 py-2.5 text-sm text-white mb-3 outline-none focus:border-[#D7FEFA]/40 placeholder:text-[#6B7272]" />
          
          <button disabled={confirmation !== "PAUSAR"} onClick={executeStop} className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed">
            Pausar la flota
          </button>

          {toastCountdown !== null && <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 p-3 text-sm text-[#34D399]"><CheckCircle2 className="h-4 w-4" /> Parada aplicada · Deshacer ({toastCountdown}s)</div>}
          
          {emergencyHalt.active && (
            <div className="mt-4 rounded-xl bg-[#1A1D1D] border border-[#3D4141] p-3">
              <p className="font-semibold text-sm text-red-400">Estado de parada</p>
              <p className="mt-2 text-xs text-[#6B7272]">Ejecutada: {new Date(emergencyHalt.startedAt ?? "").toLocaleString("es-ES")}</p>
              <p className="text-xs text-[#6B7272]">Agentes detenidos: {emergencyHalt.affectedAgentIds.length} / {agents.length}</p>
              <input value={reactivationConfirmation} onChange={(e) => setReactivationConfirmation(e.target.value)} placeholder='Escribe "PAUSAR" para reactivar' className="mt-3 w-full rounded-xl border border-[#3D4141] bg-[#2B2E2E] px-3 py-2 text-sm text-white outline-none focus:border-[#D7FEFA]/40 placeholder:text-[#6B7272]" />
              <button disabled={reactivationConfirmation !== "PAUSAR"} onClick={executeReactivation} className="mt-2 w-full rounded-xl bg-[#34D399] py-2 text-sm font-semibold text-[#1A1D1D] disabled:opacity-40 hover:bg-[#2ecc71] transition-colors">Reactivar flota</button>
            </div>
          )}
        </section>

        <section className="bg-[#2B2E2E] rounded-[20px] border border-[#3D4141] p-6 mt-4">
          <h3 className="font-semibold text-white mb-3">Umbrales de aprobación por tipo</h3>
          <p className="text-sm text-[#A8AFAF] mb-4">Cuánta seguridad necesita un agente para actuar solo</p>
          
          {Object.entries(thresholds).map(([type, value]) => (
            <div key={type} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-white">{typeHumanLabels[type as AgentType]}</span>
                <span className="text-[#D7FEFA] font-bold">{value}%</span>
              </div>
              <div className="relative h-2 bg-[#3D4141] rounded-full">
                <div className="absolute h-full bg-[#D7FEFA] rounded-full" style={{ width: `${((value - 70) / 29) * 100}%` }} />
                <input type="range" min={70} max={99} value={value} onChange={(e) => updateThreshold(type, +e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B7272] mt-0.5">
                <span>Más supervisión</span>
                <span>Más autonomía</span>
              </div>
            </div>
          ))}
          
          <button className="mt-2 w-full rounded-xl bg-[#F6F4D2] py-2 text-sm font-semibold text-[#1A1D1D] hover:bg-[#EDEBBF] transition-colors">
            Guardar cambios
          </button>
        </section>
      </div>
    </div>
  );
}
