"use client";

import { Slider } from "@/components/ui/slider";

export function AutonomyDial({ value = 72, onChange }: { value?: number; onChange?: (value: number) => void }) {
  return <Slider value={[value]} min={40} max={95} step={1} onValueChange={(next: number[]) => onChange?.(next[0])} />;
}
