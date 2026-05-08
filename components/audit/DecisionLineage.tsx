"use client";

import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

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

function confColor(confidence: number) {
  if (confidence >= 0.9) return "#12B76A";
  if (confidence >= 0.8) return "#F79009";
  return "#F04438";
}

export function DecisionLineage({ agent }: { agent: Agent }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--bg-border)]" />
      {agent.decision_path.map((step, index) => (
        <div key={step.id} className="relative flex gap-4 mb-4 last:mb-0">
          <div className={cn("relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2", step.confidence > 0.9 ? "border-green-200 bg-green-50" : step.confidence >= 0.8 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50")}>
            <span className="text-xs font-bold" style={{ color: confColor(step.confidence) }}>{index + 1}</span>
          </div>
          <div className="flex-1 rounded-xl border border-[var(--bg-border)] bg-white p-3 shadow-sm">
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
  );
}
