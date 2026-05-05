"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAgentStore, type EmergencyScope } from "@/store/agentStore";

export function ConfirmationGate({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = useState<EmergencyScope>("all");
  const [confirmation, setConfirmation] = useState("");
  const agents = useAgentStore((state) => state.agents);
  const triggerEmergencyHalt = useAgentStore((state) => state.triggerEmergencyHalt);
  const affectedAgents = useMemo(() => agents.filter((agent) => {
    if (scope === "all") return agent.status !== "suspended";
    if (scope === "critical") return agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical";
    return agent.type === scope;
  }), [agents, scope]);
  const activeTasks = affectedAgents.filter((agent) => agent.status === "running" || agent.status === "monitoring" || agent.status === "intervention_required");
  const canConfirm = confirmation === "CONFIRM" && affectedAgents.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="font-accent text-xl text-critical">Emergency Stop Confirmation</DialogTitle>
        <DialogDescription>Esta acción afectará {affectedAgents.length} agentes activos con {activeTasks.length} tareas en curso.</DialogDescription>
        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-foreground/45">Scope</label>
            {[
              ["all", "Detener TODO"],
              ["critical", "Detener agentes críticos"],
              ["sales", "Detener familia Aria-S"],
              ["asset_mgmt", "Detener familia Rex-A"],
              ["maintenance", "Detener familia Orion-M"],
              ["screening", "Detener familia Nova-N"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setScope(value as EmergencyScope)} className={`w-full rounded-badge border px-3 py-2 text-left font-display text-xs ${scope === value ? "border-critical bg-critical/15 text-critical" : "border-border bg-background/50 text-foreground/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div className="rounded-data border bg-background/60 p-3">
              <p className="font-accent text-sm">Consecuencias inmediatas</p>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto font-display text-xs text-foreground/65">
                {affectedAgents.slice(0, 12).map((agent) => (
                  <div key={agent.id} className="grid grid-cols-[70px_1fr] gap-2">
                    <span className="text-critical">{agent.id}</span>
                    <span>{agent.current_task.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-foreground/45">Escribe CONFIRM para continuar</label>
              <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-data border bg-background px-3 py-2 font-display text-sm text-foreground outline-none focus:border-critical" />
            </div>
            <button disabled={!canConfirm} onClick={() => triggerEmergencyHalt(scope)} className="w-full rounded-badge border border-critical/50 bg-critical/15 px-3 py-2 font-display text-xs text-critical shadow-danger disabled:cursor-not-allowed disabled:opacity-40">
              CONFIRMAR PARADA DE EMERGENCIA
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
