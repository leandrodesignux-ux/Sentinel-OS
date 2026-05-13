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
        <span className="text-[#F87171]">Tú decides todo</span>
        <span className="text-[#34D399]">El sistema decide solo</span>
      </div>
      <div className="relative h-2 bg-[#3D4141] rounded-full">
        <div 
          className="absolute h-full bg-[#D7FEFA] rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
        <input 
          type="range" 
          min={0} 
          max={100} 
          value={value} 
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-[#F6F4D2] rounded-full shadow-lg transition-all"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>
      <p className="text-sm text-[#A8AFAF]">{supervisionLabel}</p>
      <div className="grid grid-cols-3 gap-2 font-display text-xs">
        <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-2">
          <span className="text-[#6B7272]">Autonomía</span>
          <p className="text-[#D7FEFA]">{value}%</p>
        </div>
        <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-2">
          <span className="text-[#6B7272]">Alertas por hora</span>
          <p className="text-[#FBBF24]">~{expectedExceptions}</p>
        </div>
        <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-2">
          <span className="text-[#6B7272]">Intervenciones por 1.000 tareas</span>
          <p className="text-[#F87171]">~{humanTouches}</p>
        </div>
      </div>
    </div>
  );
}
