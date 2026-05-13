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
      <DialogContent className="max-w-3xl bg-[#2B2E2E] border-[#3D4141]">
        <DialogTitle className="font-accent text-xl text-red-300">Emergency Stop Confirmation</DialogTitle>
        <DialogDescription className="text-[#A8AFAF]">Esta acción afectará {affectedAgents.length} agentes activos con {activeTasks.length} tareas en curso.</DialogDescription>
        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] text-[#6B7272]">Scope</label>
            {[
              ["all", "Detener TODO"],
              ["critical", "Detener agentes críticos"],
              ["sales", "Detener familia Aria-S"],
              ["asset_mgmt", "Detener familia Rex-A"],
              ["maintenance", "Detener familia Orion-M"],
              ["screening", "Detener familia Nova-N"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setScope(value as EmergencyScope)} className={`w-full rounded-badge border px-3 py-2 text-left font-display text-xs transition-colors ${scope === value ? "border-red-600/50 bg-red-900/30 text-red-300" : "border-[#3D4141] bg-[#2B2E2E] text-[#A8AFAF] hover:bg-[#333737]"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
              <p className="font-accent text-sm text-white">Consecuencias inmediatas</p>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto font-display text-xs text-[#A8AFAF]">
                {affectedAgents.slice(0, 12).map((agent) => (
                  <div key={agent.id} className="grid grid-cols-[70px_1fr] gap-2">
                    <span className="text-red-300">{agent.id}</span>
                    <span>{agent.current_task.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-[#6B7272]">Escribe CONFIRM para continuar</label>
              <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-data border border-[#3D4141] bg-[#1A1D1D] px-3 py-2 font-display text-sm text-white outline-none focus:border-[#D7FEFA]/40 placeholder:text-[#6B7272]" placeholder="CONFIRM" />
            </div>
            <button disabled={!canConfirm} onClick={() => triggerEmergencyHalt(scope)} className="w-full rounded-badge border border-red-600/50 bg-red-900/30 px-3 py-2 font-display text-xs text-red-300 shadow-danger disabled:cursor-not-allowed disabled:opacity-40 hover:bg-red-900/40 transition-colors">
              CONFIRMAR PARADA DE EMERGENCIA
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
