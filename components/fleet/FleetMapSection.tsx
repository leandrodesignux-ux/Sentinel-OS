"use client";

import { useMemo, useState } from "react";
import { Building2, Home, Search, Users, Wrench } from "lucide-react";
import { AutonomyDial } from "@/components/controls/AutonomyDial";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { useAgentStore } from "@/store/agentStore";
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
  screening: "Screening",
};

function statusColor(agent: Agent) {
  if (agent.status === "intervention_required" || agent.status === "circuit_open") return "#EF4444";
  if (agent.status === "monitoring") return "#F59E0B";
  if (agent.status === "suspended" || agent.status === "idle") return "#374151";
  return "#00D4A1";
}

function statusLabel(agent: Agent) {
  if (agent.status === "intervention_required") return "Intervención";
  if (agent.status === "circuit_open") return "Cortacircuito";
  if (agent.status === "monitoring") return "Monitoreando";
  if (agent.status === "suspended") return "Inactivo";
  if (agent.status === "idle") return "En espera";
  return "Nominal";
}

function FleetMapCard({ agent, selected, onSelect }: { agent: Agent; selected: boolean; onSelect: () => void }) {
  const Icon = typeIcons[agent.type];
  const confidence = confidencePercent(agent);
  const intervention = agent.status === "intervention_required" || agent.status === "circuit_open";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onSelect} className={cn("flex h-20 w-16 flex-col justify-between rounded-[8px] border border-[var(--bg-border)] bg-white p-1.5 text-left transition hover:border-primary/60", intervention && "animate-critical-breach border-critical", selected && "ring-1 ring-primary")}> 
          <div className="flex items-start justify-between gap-1">
            <span className="font-display text-[10px] leading-none text-[var(--text-primary)]">{agent.id}</span>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor(agent) }} />
          </div>
          <Icon className="mx-auto h-4 w-4 text-[var(--text-secondary)]" />
          <span className={cn("font-display text-[11px] leading-none", confidence >= 90 ? "text-green-700" : confidence >= 80 ? "text-yellow-700" : "text-red-600")}>{confidence}%</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="w-72">
        <div className="space-y-2 text-xs">
          <p className="font-display text-[var(--status-accent)]">{agent.name}</p>
          <p><span className="text-[var(--text-muted)]">Tarea:</span> {agent.current_task.description}</p>
          <p><span className="text-[var(--text-muted)]">Riesgo económico:</span> <span className="text-red-600">${economicImpactK(agent)}K</span></p>
          <p><span className="text-[var(--text-muted)]">Última acción:</span> {agent.metadata.last_human_touch}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function FleetMapSection({ agents, onOpenAudit }: { agents: Agent[]; onOpenAudit: () => void }) {
  const [typeFilter, setTypeFilter] = useState<AgentType | "all">("all");
  const [alertOnly, setAlertOnly] = useState(false);
  const [query, setQuery] = useState("");
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const threshold = useAgentStore((state) => state.threshold);
  const setThreshold = useAgentStore((state) => state.setThreshold);

  const visibleAgents = useMemo(() => agents.filter((agent) => {
    if (typeFilter !== "all" && agent.type !== typeFilter) return false;
    if (alertOnly && !(agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical")) return false;
    if (query && !agent.id.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [agents, alertOnly, query, typeFilter]);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? visibleAgents[0] ?? agents[0];
  const estimatedExceptions = Math.max(4, Math.round((100 - threshold) * 0.47));
  const humanTouches = Math.max(3, Math.round((100 - threshold) * 0.3));

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-accent text-2xl">Mapa de flota</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Vista de misión — 50 agentes, cuadrícula 64×80px</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-badge border border-[var(--bg-border)] bg-white px-3 py-2 font-display text-xs" value="all" disabled><option>Todos</option></select>
          <select className="rounded-badge border border-[var(--bg-border)] bg-white px-3 py-2 font-display text-xs" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as AgentType | "all")}>
            <option value="all">Tipo</option>
            {Object.entries(typeLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
          </select>
          <button onClick={() => setAlertOnly((value) => !value)} className={cn("rounded-badge border border-[var(--bg-border)] px-3 py-2 font-display text-xs", alertOnly ? "bg-critical/15 text-red-600" : "bg-white text-foreground/70")}>Solo con alerta</button>
          <div className="flex items-center gap-2 rounded-badge border border-[var(--bg-border)] bg-white px-3 py-2">
            <Search className="h-3.5 w-3.5 text-foreground/40" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar AGT-..." className="w-28 bg-transparent font-display text-xs outline-none placeholder:text-foreground/35" />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_240px] gap-4">
        <section className="min-h-0 overflow-auto rounded-data border border-[var(--bg-border)] bg-white p-4">
          <div className="grid grid-cols-5 gap-2 xl:grid-cols-10">
            {visibleAgents.map((agent) => <FleetMapCard key={agent.id} agent={agent} selected={selectedAgent?.id === agent.id} onSelect={() => selectAgent(agent.id)} />)}
          </div>
        </section>

        <aside className="rounded-data border border-[var(--bg-border)] bg-white p-4">
          <h3 className="font-accent text-lg">Resumen del agente</h3>
          {selectedAgent && (
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-display text-[var(--status-accent)]">{selectedAgent.id}</p>
                <p className="text-[var(--text-secondary)]">{selectedAgent.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 font-display text-xs">
                <span className="text-[var(--text-muted)]">Tipo</span><span>{typeLabels[selectedAgent.type]}</span>
                <span className="text-[var(--text-muted)]">Estado</span><span>{statusLabel(selectedAgent)}</span>
                <span className="text-[var(--text-muted)]">Confianza</span><span>{confidencePercent(selectedAgent)}%</span>
                <span className="text-[var(--text-muted)]">Riesgo</span><span className="text-red-600">${economicImpactK(selectedAgent)}K</span>
              </div>
              <p className="text-xs leading-5 text-[var(--text-secondary)]">{selectedAgent.current_task.description}</p>
              <button onClick={onOpenAudit} className="w-full rounded-badge border border-primary/40 bg-primary/10 px-3 py-2 font-display text-xs text-[var(--status-accent)] transition hover:bg-primary/20">Ver auditoría completa</button>
            </div>
          )}
        </aside>
      </div>

      <section className="rounded-data border border-[var(--bg-border)] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-accent text-lg">Dial de autonomía</h3>
            <p className="text-xs text-[var(--text-muted)]">Restrictivo a la izquierda, autónomo a la derecha.</p>
          </div>
          <span className="font-display text-lg text-[var(--status-accent)]">{threshold}%</span>
        </div>
        <AutonomyDial value={threshold} onChange={setThreshold} />
        <div className="mt-3 flex gap-4 font-display text-xs text-[var(--text-secondary)]">
          <span>Exc/hora estimadas: ~{estimatedExceptions}</span>
          <span>Toques humanos/1k: ~{humanTouches}</span>
        </div>
      </section>
    </div>
  );
}
