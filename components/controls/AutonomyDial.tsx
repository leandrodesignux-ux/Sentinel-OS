"use client";

import { Slider } from "@/components/ui/slider";

export function AutonomyDial({ value = 72, onChange }: { value?: number; onChange?: (value: number) => void }) {
  const expectedExceptions = Math.max(2, Math.round((100 - value) * 0.48));
  const humanTouches = Math.max(1, Math.round((100 - value) * 0.32));
  const supervisionLabel = value <= 30
    ? "Alta supervisión — tus agentes te piden permiso para casi todo"
    : value <= 70
      ? "Balance óptimo — solo ves lo que importa"
      : "Alta autonomía — mínima intervención tuya";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-display text-[10px] uppercase tracking-[0.18em]">
        <span className="text-red-600">Tú decides todo</span>
        <span className="text-green-700">El sistema decide solo</span>
      </div>
      <Slider value={[value]} min={0} max={100} step={1} onValueChange={(next: number[]) => onChange?.(next[0])} />
      <p className="text-sm text-[var(--text-secondary)]">{supervisionLabel}</p>
      <div className="grid grid-cols-3 gap-2 font-display text-xs">
        <div className="rounded-data border bg-background/50 p-2">
          <span className="text-[var(--text-muted)]">Autonomía</span>
          <p className="text-[var(--status-accent)]">{value}%</p>
        </div>
        <div className="rounded-data border bg-background/50 p-2">
          <span className="text-[var(--text-muted)]">Alertas por hora</span>
          <p className="text-yellow-700">~{expectedExceptions}</p>
        </div>
        <div className="rounded-data border bg-background/50 p-2">
          <span className="text-[var(--text-muted)]">Intervenciones por 1.000 tareas</span>
          <p className="text-red-600">~{humanTouches}</p>
        </div>
      </div>
    </div>
  );
}
