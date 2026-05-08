"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { getExceptionLabel, type ExceptionKind } from "@/lib/utils/exceptionUtils";
import type { Agent } from "@/types/agent";

export function BatchApproval({ kind, agents }: { kind: ExceptionKind; agents: Agent[] }) {
  const [applyCount, setApplyCount] = useState(agents.length);
  const [confirmed, setConfirmed] = useState(false);
  const totalImpact = Math.round(agents.reduce((sum, agent) => sum + agent.economic_risk.amount, 0) / 1000);

  return (
    <Dialog>
      <DialogTrigger className="rounded-badge border border-warn/40 px-2 py-1 font-display text-xs text-yellow-700">Resolver todos con una acción</DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-accent text-xl">Batch approval: {getExceptionLabel(kind)}</DialogTitle>
        <DialogDescription>{agents.length} agentes comparten el mismo patrón de excepción. Impacto agregado: ${totalImpact}K.</DialogDescription>
        <div className="space-y-4">
          <div className="rounded-data border bg-white p-3">
            <p className="font-accent text-sm">Resumen comparativo</p>
            <div className="mt-2 space-y-1 font-display text-xs text-[var(--text-secondary)]">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex justify-between">
                  <span>{agent.id}</span>
                  <span>{Math.round(agent.confidence_score * 100)}% / ${Math.round(agent.economic_risk.amount / 1000)}K</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between font-display text-xs"><span>Aplica a</span><span>{applyCount} de {agents.length} casos</span></div>
            <Slider value={[applyCount]} min={1} max={agents.length} step={1} onValueChange={(value: number[]) => setApplyCount(value[0])} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            Confirmo que revisé diferencias materiales entre casos.
          </label>
          <button disabled={!confirmed} className="rounded-badge border border-ok/40 px-3 py-2 font-display text-xs text-green-700 disabled:cursor-not-allowed disabled:opacity-40">Aprobar batch · Undo 30s disponible</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
