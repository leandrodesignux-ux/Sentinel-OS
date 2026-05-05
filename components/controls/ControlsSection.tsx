"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Power, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentStore, type CircuitBreakerLevel, type EmergencyScope } from "@/store/agentStore";
import type { Agent, AgentType } from "@/types/agent";

const cbLevels: { level: CircuitBreakerLevel; label: string; tone: string }[] = [
  { level: 1, label: "Solo lectura", tone: "border-amber-300/40 bg-amber-300/10 text-amber-200" },
  { level: 2, label: "Congelar estado", tone: "border-warn/40 bg-warn/10 text-warn" },
  { level: 3, label: "Revocar acceso APIs", tone: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
  { level: 4, label: "Suspensión completa", tone: "border-critical/40 bg-critical/10 text-critical" },
];

const typeLabels: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mantenimiento",
  screening: "Screening",
};

export function ControlsSection({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [pendingBreaker, setPendingBreaker] = useState<{ agent: Agent; level: CircuitBreakerLevel } | null>(null);
  const [scope, setScope] = useState<EmergencyScope>("all");
  const [familyScope, setFamilyScope] = useState<AgentType>("sales");
  const [confirmation, setConfirmation] = useState("");
  const [reactivationConfirmation, setReactivationConfirmation] = useState("");
  const [overlay, setOverlay] = useState(false);
  const [toastCountdown, setToastCountdown] = useState<number | null>(null);
  const [thresholds, setThresholds] = useState({ ventas: 82, activos: 86, mantenimiento: 78, screening: 91 });
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
    return agent.type === familyScope;
  });
  const activeTasks = affectedAgents.reduce((sum, agent) => sum + Math.max(1, agent.dependencies.length + 1), 0);

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

  function executeStop() {
    if (confirmation !== "DETENER") return;
    setOverlay(true);
    setTimeout(() => {
      triggerEmergencyHalt(scope === "all" || scope === "critical" ? scope : familyScope);
      setOverlay(false);
      setConfirmation("");
      startCountdown();
    }, 1500);
  }

  function executeReactivation() {
    if (reactivationConfirmation !== "DETENER") return;
    reactivateFleet();
    setReactivationConfirmation("");
  }

  useEffect(() => () => setOverlay(false), []);

  return (
    <div className="grid h-full min-h-0 grid-cols-[55fr_45fr] gap-4 overflow-hidden">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/75 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-critical" />
          <p className="mt-4 font-accent text-xl text-critical">Enviando señal de parada...</p>
        </div>
      )}

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <section className="rounded-data border border-[#1E2235] bg-card/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-accent text-xl">Circuit breakers por agente</h2>
            <div className="flex items-center gap-2 rounded-badge border border-[#1E2235] bg-[#131625] px-3 py-2">
              <Search className="h-3.5 w-3.5 text-foreground/40" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar agente..." className="w-40 bg-transparent font-display text-xs outline-none placeholder:text-foreground/35" />
            </div>
          </div>
          <div className="mt-4 max-h-[330px] space-y-2 overflow-y-auto pr-1">
            {listedAgents.map((agent) => (
              <div key={agent.id} className="grid grid-cols-[72px_1fr_90px_auto] items-center gap-3 rounded-data border border-[#1E2235] bg-[#131625] p-2">
                <span className="font-display text-xs text-primary">{agent.id}</span>
                <span className="truncate text-sm text-foreground/70">{agent.name}</span>
                <span className="font-display text-xs text-foreground/45">L{circuitBreakers[agent.id] ?? 0}</span>
                <div className="flex flex-wrap gap-1">
                  {cbLevels.map((item) => <button key={item.level} onClick={() => setPendingBreaker({ agent, level: item.level })} className={cn("rounded-badge border px-2 py-1 font-display text-[10px]", item.tone)}>L{item.level}</button>)}
                </div>
              </div>
            ))}
          </div>
          {pendingBreaker && (
            <div className="mt-3 rounded-data border border-warn/40 bg-warn/10 p-3">
              <p className="font-display text-sm text-warn">¿Confirmar nivel L{pendingBreaker.level} para {pendingBreaker.agent.id}?</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => { setCircuitBreakerLevel(pendingBreaker.agent.id, pendingBreaker.level); setPendingBreaker(null); }} className="rounded-badge border border-ok/40 px-3 py-1 font-display text-xs text-ok">Sí</button>
                <button onClick={() => setPendingBreaker(null)} className="rounded-badge border border-foreground/20 px-3 py-1 font-display text-xs text-foreground/60">No</button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-data border border-[#1E2235] bg-card/70 p-4">
          <h2 className="font-accent text-xl">Simulación de fallos — solo para testing</h2>
          <div className="mt-3 flex gap-2 rounded-data border border-warn/40 bg-warn/15 p-3 text-sm text-warn"><AlertTriangle className="h-4 w-4 shrink-0" />Activar un escenario afectará datos reales de la flota. Usar solo en entorno de pruebas.</div>
          <div className="mt-4 grid gap-3">
            {[
              { mode: "price_loop", title: "Bucle de precios", description: "Propaga aumento corrupto de precio a dependientes.", action: activatePriceLoopScenario },
              { mode: "screening_bias", title: "Alerta Fair Housing", description: "Simula sesgo estadístico en screening.", action: activateScreeningBiasScenario },
              { mode: "retry_storm", title: "Tormenta de reintentos HVAC", description: "Dispara consumo acelerado de presupuesto.", action: activateRetryStormScenario },
            ].map((scenario) => {
              const active = activeScenario?.mode === scenario.mode;
              return <div key={scenario.mode} className={cn("rounded-data border border-[#1E2235] bg-[#131625] p-3", active && "border-warn")}> 
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-display text-sm text-foreground">{scenario.title}</p><p className="text-xs text-foreground/50">{scenario.description}</p></div>
                  <div className="flex items-center gap-2">{active && <span className="rounded-badge bg-warn/15 px-2 py-1 font-display text-[10px] text-warn">ACTIVO</span>}<button onClick={active ? containScenarioFamily : scenario.action} className="rounded-badge border border-warn/40 px-3 py-2 font-display text-xs text-warn">{active ? "Detener" : "Activar"}</button></div>
                </div>
              </div>;
            })}
          </div>
        </section>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        <section className="rounded-[8px] border border-[#7F1D1D] bg-[#1A0A0A] p-4">
          <div className="flex items-center gap-3"><Power className="h-5 w-5 text-critical" /><h2 className="font-accent text-xl text-critical">Parada de emergencia de flota</h2></div>
          <p className="mt-3 text-sm leading-6 text-foreground/65">Detiene todas las acciones de escritura de los agentes activos. Esta acción es reversible pero requiere revalidación manual para reanudar.</p>
          <div className="mt-4 grid gap-2 font-display text-xs">
            <div className="flex justify-between rounded-data border border-[#7F1D1D]/60 bg-background/30 p-2"><span>Agentes activos que se detendrán</span><span className="text-critical">{affectedAgents.length}</span></div>
            <div className="flex justify-between rounded-data border border-[#7F1D1D]/60 bg-background/30 p-2"><span>Tareas en curso que se pausarán</span><span className="text-critical">{activeTasks}</span></div>
            <div className="flex justify-between rounded-data border border-[#7F1D1D]/60 bg-background/30 p-2"><span>Tiempo estimado de reactivación</span><span className="text-critical">8-12 min</span></div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-foreground/70">
            <label className="flex gap-2"><input type="radio" checked={scope === "all"} onChange={() => setScope("all")} /> Detener toda la flota</label>
            <label className="flex gap-2"><input type="radio" checked={scope === "critical"} onChange={() => setScope("critical")} /> Solo agentes en estado crítico ({agents.filter((agent) => agent.risk_level === "critical" || agent.status === "intervention_required").length})</label>
            <label className="flex items-center gap-2"><input type="radio" checked={scope !== "all" && scope !== "critical"} onChange={() => setScope(familyScope)} /> Solo familia seleccionada <select value={familyScope} onChange={(event) => { const value = event.target.value as AgentType; setFamilyScope(value); setScope(value); }} className="rounded-badge border border-[#7F1D1D] bg-background px-2 py-1 text-xs">{Object.entries(typeLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>
          </div>
          <label className="mt-4 block font-display text-xs text-foreground/60">Para continuar, escribe DETENER</label>
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-data border border-[#7F1D1D] bg-background px-3 py-2 outline-none" />
          <button disabled={confirmation !== "DETENER"} onClick={executeStop} className="mt-3 w-full rounded-badge border border-critical bg-critical/20 px-4 py-3 font-display text-sm text-critical disabled:cursor-not-allowed disabled:opacity-40">Ejecutar parada</button>
          {toastCountdown !== null && <div className="mt-3 flex items-center gap-2 rounded-data border border-ok/40 bg-ok/10 p-2 text-sm text-ok"><CheckCircle2 className="h-4 w-4" /> Parada aplicada · Deshacer ({toastCountdown}s)</div>}
          {emergencyHalt.active && <div className="mt-4 rounded-data border border-critical/50 bg-critical/10 p-3"><p className="font-display text-sm text-critical">Estado de parada</p><p className="mt-2 text-xs text-foreground/60">Ejecutada: {new Date(emergencyHalt.startedAt ?? "").toLocaleString("es-ES")}</p><p className="text-xs text-foreground/60">Agentes detenidos: {emergencyHalt.affectedAgentIds.length} / {agents.length}</p><input value={reactivationConfirmation} onChange={(event) => setReactivationConfirmation(event.target.value)} placeholder="Escribe DETENER para reactivar" className="mt-3 w-full rounded-data border bg-background px-3 py-2 text-sm outline-none" /><button disabled={reactivationConfirmation !== "DETENER"} onClick={executeReactivation} className="mt-2 rounded-badge border border-ok/40 px-3 py-2 font-display text-xs text-ok disabled:opacity-40">Reactivar flota</button></div>}
        </section>

        <section className="rounded-data border border-[#1E2235] bg-card/70 p-4">
          <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary" /><h2 className="font-accent text-xl">Reglas de autonomía globales</h2></div>
          <div className="mt-4 space-y-2">
            {Object.entries(thresholds).map(([key, value]) => <div key={key} className="grid grid-cols-[1fr_80px] items-center gap-3 rounded-data border border-[#1E2235] bg-[#131625] p-2"><span className="capitalize text-sm text-foreground/70">{key}</span><input type="number" value={value} onChange={(event) => setThresholds((current) => ({ ...current, [key]: Number(event.target.value) }))} className="rounded-badge border border-[#1E2235] bg-background px-2 py-1 font-display text-xs" /></div>)}
          </div>
          <button className="mt-3 rounded-badge border border-primary/40 bg-primary/10 px-3 py-2 font-display text-xs text-primary">Guardar cambios</button>
        </section>
      </div>
    </div>
  );
}
