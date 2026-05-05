"use client";

import { Siren } from "lucide-react";

export function EmergencyStop() {
  return (
    <button className="flex items-center gap-2 rounded-badge border border-critical/50 bg-critical/15 px-3 py-2 font-display text-xs text-critical shadow-danger transition hover:bg-critical/25">
      <Siren className="h-4 w-4 animate-signal-blink" /> EMERGENCY STOP
    </button>
  );
}
