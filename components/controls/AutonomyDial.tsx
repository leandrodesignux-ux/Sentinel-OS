"use client";

import { Slider } from "@/components/ui/slider";

export function AutonomyDial({ value = 72, onChange }: { value?: number; onChange?: (value: number) => void }) {
  const expectedExceptions = Math.max(2, Math.round((100 - value) * 0.48));
  const humanTouches = Math.max(1, Math.round((100 - value) * 0.32));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-display text-[10px] uppercase tracking-[0.18em]">
        <span className="text-critical">Restrictivo</span>
        <span className="text-ok">Autónomo</span>
      </div>
      <Slider value={[value]} min={0} max={100} step={1} onValueChange={(next: number[]) => onChange?.(next[0])} />
      <div className="grid grid-cols-3 gap-2 font-display text-xs">
        <div className="rounded-data border bg-background/50 p-2">
          <span className="text-foreground/45">Autonomía</span>
          <p className="text-primary">{value}%</p>
        </div>
        <div className="rounded-data border bg-background/50 p-2">
          <span className="text-foreground/45">Exc/hora</span>
          <p className="text-warn">~{expectedExceptions}</p>
        </div>
        <div className="rounded-data border bg-background/50 p-2">
          <span className="text-foreground/45">Human/1k</span>
          <p className="text-critical">~{humanTouches}</p>
        </div>
      </div>
    </div>
  );
}
