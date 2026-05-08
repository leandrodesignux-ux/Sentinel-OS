"use client";

import { Eye } from "lucide-react";
import { AgentGrid } from "@/components/fleet/AgentGrid";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Agent } from "@/types/agent";

export function FleetMonitor({ agents }: { agents: Agent[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-data border bg-card/60 p-3 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-accent text-xl">Mapa táctico de flota</h2>
          <p className="text-sm text-[var(--text-muted)]">Cuadrícula operativa: 50 agentes, selección por tarjeta y auditoría detallada.</p>
        </div>
        <Tooltip>
          <TooltipTrigger><Eye className="h-5 w-5 text-[var(--status-accent)]" /></TooltipTrigger>
          <TooltipContent>Selecciona una tarjeta para inspeccionar el paquete de decisión.</TooltipContent>
        </Tooltip>
      </div>
      <div className="min-h-0 overflow-hidden">
        <AgentGrid agents={agents} />
      </div>
    </section>
  );
}
