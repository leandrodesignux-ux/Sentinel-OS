"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileSearch, ShieldX, Undo2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getExceptionKind, getExceptionLabel, groupExceptionsByKind, type ExceptionKind } from "@/lib/utils/exceptionUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import type { Agent } from "@/types/agent";

type SortMode = "impacto" | "legal" | "propagacion" | "reciente";

const kindStyles: Record<ExceptionKind, { border: string; dot: string; badge: string }> = {
  critical: { border: "border-l-critical", dot: "bg-critical", badge: "border-critical/40 bg-critical/15 text-critical" },
  legal: { border: "border-l-orange-500", dot: "bg-orange-500", badge: "border-orange-500/40 bg-orange-500/15 text-orange-300" },
  cascade: { border: "border-l-purple-500", dot: "bg-purple-500", badge: "border-purple-500/40 bg-purple-500/15 text-purple-300" },
  uncertainty: { border: "border-l-warn", dot: "bg-warn", badge: "border-warn/40 bg-warn/15 text-warn" },
  operational: { border: "border-l-warn", dot: "bg-warn", badge: "border-warn/40 bg-warn/15 text-warn" },
};

function exceptionDescription(agent: Agent) {
  if (/retry|HVAC|Budget cap/i.test(agent.exception_reason ?? "")) return "Bucle de reintentos contra proveedor HVAC. $120k gastados en 40 minutos. Cortacircuito L2 activo.";
  if (/Fair Housing|rechazo/i.test(agent.exception_reason ?? "")) return "Posible violación de vivienda justa. Tasa de rechazo 73% contra línea base de 22%.";
  if (/CASCADA|Price feedback/i.test(agent.exception_reason ?? "")) return "Cascada de precios detectada. Dato corrupto propagado a agentes dependientes.";
  return agent.exception_reason ?? "La decisión excede el umbral operativo y requiere revisión humana.";
}

function timeAgo(agent: Agent) {
  const minutes = Math.max(1, Number(agent.id.replace("AGT-", "")) % 11);
  return `hace ${minutes} min`;
}

function sortAgents(agents: Agent[], sortMode: SortMode) {
  return [...agents].sort((left, right) => {
    if (sortMode === "legal") return Number(getExceptionKind(right) === "legal") - Number(getExceptionKind(left) === "legal") || right.economic_risk.amount - left.economic_risk.amount;
    if (sortMode === "propagacion") return (right.blast_radius?.length ?? right.dependencies.length) - (left.blast_radius?.length ?? left.dependencies.length);
    if (sortMode === "reciente") return right.id.localeCompare(left.id);
    return right.economic_risk.amount - left.economic_risk.amount;
  });
}

function BatchResolutionCard({ kind, agents, onResolve }: { kind: ExceptionKind; agents: Agent[]; onResolve: (agents: Agent[]) => void }) {
  const [confirmation, setConfirmation] = useState("");
  const [toastCountdown, setToastCountdown] = useState<number | null>(null);
  const canConfirm = confirmation === "CONFIRMAR";

  function confirmResolution() {
    if (!canConfirm) return;
    onResolve(agents);
    setToastCountdown(28);
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

  return (
    <div className="rounded-data border border-primary/30 bg-primary/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex rounded-badge border border-primary/40 px-2 py-1 font-display text-[10px] text-primary">{agents.length} agentes · mismo error</div>
          <p className="mt-2 font-accent text-lg">Grupo de excepciones {getExceptionLabel(kind).toLowerCase()}</p>
          <p className="text-sm text-foreground/55">Impacto agregado: <span className="text-critical">${Math.round(agents.reduce((sum, agent) => sum + agent.economic_risk.amount, 0) / 1000)}K</span></p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="rounded-badge border border-primary/50 bg-primary/15 px-4 py-2 font-display text-xs text-primary">Resolver todos con una acción</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirmar resolución en lote</DialogTitle>
            <DialogDescription>Esta acción aplicará la misma resolución a excepciones similares.</DialogDescription>
            <div className="space-y-4">
              <div className="rounded-data border bg-background/50 p-3">
                <p className="font-display text-xs text-foreground/45">Agentes afectados</p>
                <p className="mt-2 text-sm text-foreground/75">{agents.map((agent) => agent.id).join(", ")}</p>
              </div>
              <div className="rounded-data border bg-background/50 p-3">
                <p className="font-display text-xs text-foreground/45">Acción aplicada</p>
                <p className="mt-2 text-sm text-foreground/75">Marcar como resuelto y mantener auditoría disponible.</p>
              </div>
              <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Escribe CONFIRMAR para continuar" className="w-full rounded-data border bg-background px-3 py-2 text-sm outline-none" />
              <button disabled={!canConfirm} onClick={confirmResolution} className="rounded-badge border border-ok/40 bg-ok/10 px-4 py-2 font-display text-xs text-ok disabled:cursor-not-allowed disabled:opacity-40">Confirmar resolución</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {toastCountdown !== null && (
        <div className="mt-3 flex items-center gap-2 rounded-data border border-ok/40 bg-ok/10 p-2 text-sm text-ok">
          <CheckCircle2 className="h-4 w-4" /> Resolución aplicada · <button className="inline-flex items-center gap-1 underline"><Undo2 className="h-3 w-3" /> Deshacer ({toastCountdown}s)</button>
        </div>
      )}
    </div>
  );
}

function ExceptionWorkCard({ agent, resolved, onResolve, onReject, onAudit }: { agent: Agent; resolved: boolean; onResolve: () => void; onReject: () => void; onAudit: () => void }) {
  const kind = getExceptionKind(agent);
  const styles = kindStyles[kind];
  const canFreeze = agent.status !== "circuit_open" && (agent.risk_level === "critical" || agent.economic_risk.amount > 80000);

  return (
    <article className={cn("rounded-data border border-[#1E2235] border-l-4 bg-[#131625] p-4 transition", styles.border, resolved && "opacity-45")}> 
      <div className="flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 animate-status-pulse rounded-full", styles.dot)} />
        <p className="font-display text-sm text-foreground">{agent.id} · {agent.name}</p>
        <span className={cn("rounded-badge border px-2 py-1 font-display text-[10px]", styles.badge)}>{getExceptionLabel(kind)}</span>
        <span className="ml-auto inline-flex items-center gap-1 font-display text-xs text-foreground/45"><Clock3 className="h-3.5 w-3.5" /> {timeAgo(agent)}</span>
        <span className="font-display text-sm text-critical">${economicImpactK(agent)}K</span>
      </div>
      <p className="mt-3 truncate text-sm text-foreground/68">{exceptionDescription(agent)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={onResolve} className="rounded-badge border border-ok/40 bg-ok/10 px-3 py-2 font-display text-xs text-ok"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Aprobar</button>
        <button onClick={onReject} className="rounded-badge border border-critical/40 bg-critical/10 px-3 py-2 font-display text-xs text-critical"><XCircle className="mr-1 inline h-3.5 w-3.5" /> Rechazar</button>
        <button onClick={onAudit} className="rounded-badge border border-primary/40 bg-primary/10 px-3 py-2 font-display text-xs text-primary"><FileSearch className="mr-1 inline h-3.5 w-3.5" /> Ver auditoría →</button>
        {canFreeze && <button className="rounded-badge border border-warn/40 bg-warn/10 px-3 py-2 font-display text-xs text-warn"><ShieldX className="mr-1 inline h-3.5 w-3.5" /> Congelar agente</button>}
      </div>
    </article>
  );
}

export function ExceptionsWorkbench({ agents, onOpenAudit }: { agents: Agent[]; onOpenAudit: (agentId: string) => void }) {
  const [sortMode, setSortMode] = useState<SortMode>("impacto");
  const [showResolved, setShowResolved] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const activeExceptions = agents.filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended");
  const visibleExceptions = sortAgents(activeExceptions.filter((agent) => showResolved || !resolvedIds.includes(agent.id)), sortMode);
  const groups = Object.entries(groupExceptionsByKind(visibleExceptions)).filter(([, groupedAgents]) => groupedAgents.length > 3) as [ExceptionKind, Agent[]][];
  const groupedAgentIds = new Set(groups.flatMap(([, groupedAgents]) => groupedAgents.map((agent) => agent.id)));
  const standaloneExceptions = visibleExceptions.filter((agent) => !groupedAgentIds.has(agent.id));
  const pendingCount = activeExceptions.filter((agent) => !resolvedIds.includes(agent.id)).length;

  function resolveAgents(targets: Agent[]) {
    setResolvedIds((current) => Array.from(new Set([...current, ...targets.map((agent) => agent.id)])));
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex items-center gap-4">
        <h2 className="font-accent text-2xl">Cola de excepciones</h2>
        <span className="rounded-badge bg-critical px-2 py-1 font-display text-xs text-white">{pendingCount} pendientes</span>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 font-display text-xs text-foreground/55">
            Ordenar por:
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="rounded-badge border border-[#1E2235] bg-[#131625] px-3 py-2 text-foreground">
              <option value="impacto">Impacto económico</option>
              <option value="legal">Riesgo legal</option>
              <option value="propagacion">Propagación</option>
              <option value="reciente">Reciente</option>
            </select>
          </label>
          <button onClick={() => setShowResolved((value) => !value)} className={cn("rounded-badge border border-[#1E2235] px-3 py-2 font-display text-xs", showResolved ? "bg-primary/15 text-primary" : "bg-[#131625] text-foreground/60")}>Mostrar resueltas</button>
        </div>
      </header>

      <section className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {visibleExceptions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-data border border-[#1E2235] bg-[#131625] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ok/30 bg-ok/10"><CheckCircle2 className="h-8 w-8 text-ok" /></div>
            <h3 className="mt-4 font-accent text-xl">Flota operando en piloto automático</h3>
            <p className="mt-2 text-sm text-foreground/50">Última excepción registrada hace 12 minutos.</p>
          </div>
        ) : (
          <>
            {groups.map(([kind, groupedAgents]) => <BatchResolutionCard key={kind} kind={kind} agents={groupedAgents} onResolve={resolveAgents} />)}
            {standaloneExceptions.map((agent) => (
              <ExceptionWorkCard key={agent.id} agent={agent} resolved={resolvedIds.includes(agent.id)} onResolve={() => resolveAgents([agent])} onReject={() => resolveAgents([agent])} onAudit={() => onOpenAudit(agent.id)} />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
