"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getExceptionLabel, type ExceptionKind } from "@/lib/utils/exceptionUtils";
import type { Agent } from "@/types/agent";

export function BatchApproval({ kind, agents }: { kind: ExceptionKind; agents: Agent[] }) {
  const [applyCount, setApplyCount] = useState(agents.length);
  const [confirmed, setConfirmed] = useState(false);
  const totalImpact = Math.round(agents.reduce((sum, agent) => sum + agent.economic_risk.amount, 0) / 1000);

  return (
    <Dialog>
      <DialogTrigger className="rounded-badge border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-2 py-1 font-display text-xs text-[#FBBF24] hover:bg-[#FBBF24]/20 transition-colors">Resolver todos con una acción</DialogTrigger>
      <DialogContent className="bg-[#2B2E2E] border-[#3D4141]">
        <DialogTitle className="font-accent text-xl text-white">Batch approval: {getExceptionLabel(kind)}</DialogTitle>
        <DialogDescription className="text-[#A8AFAF]">{agents.length} agentes comparten el mismo patrón de excepción. Impacto agregado: ${totalImpact}K.</DialogDescription>
        <div className="space-y-4">
          <div className="rounded-data border border-[#3D4141] bg-[#1A1D1D] p-3">
            <p className="font-accent text-sm text-white">Resumen comparativo</p>
            <div className="mt-2 space-y-1 font-display text-xs text-[#A8AFAF]">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex justify-between">
                  <span className="text-[#D7FEFA]">{agent.id}</span>
                  <span>{Math.round(agent.confidence_score * 100)}% / ${Math.round(agent.economic_risk.amount / 1000)}K</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between font-display text-xs text-[#A8AFAF]"><span>Aplica a</span><span className="text-white">{applyCount} de {agents.length} casos</span></div>
            <div className="relative h-2 bg-[#3D4141] rounded-full">
              <div className="absolute h-full bg-[#D7FEFA] rounded-full transition-all" style={{ width: `${(applyCount / agents.length) * 100}%` }} />
              <input type="range" min={1} max={agents.length} value={applyCount} onChange={(e) => setApplyCount(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#A8AFAF]">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="accent-[#D7FEFA]" />
            <span className="text-[#A8AFAF]">Confirmo que revisé diferencias materiales entre casos.</span>
          </label>
          <div className="flex gap-2">
            <button disabled={!confirmed} className="flex-1 rounded-badge bg-[#F6F4D2] px-3 py-2 font-display text-xs text-[#1A1D1D] font-semibold disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#EDEBBF] transition-colors">Aprobar batch · Undo 30s</button>
            <button className="rounded-badge border border-[#3D4141] px-3 py-2 font-display text-xs text-[#A8AFAF] hover:bg-[#333737] hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
