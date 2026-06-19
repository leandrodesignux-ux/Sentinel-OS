"use client";

import { memo } from "react";
import { Eye } from "lucide-react";
import { AgentGrid } from "@/components/fleet/AgentGrid";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Agent } from "@/types/agent";

function FleetMonitorInner({ agents }: { agents: Agent[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-data border border-[#3D4141] bg-[#1A1D1D] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-accent text-xl text-white">Mapa táctico de flota</h2>
          <p className="text-sm text-[#A8AFAF]">Cuadrícula operativa: 50 agentes, selección por tarjeta y auditoría detallada.</p>
        </div>
        <Tooltip>
          <TooltipTrigger><Eye className="h-5 w-5 text-[#6B7272] hover:text-[#D7FEFA] transition-colors" /></TooltipTrigger>
          <TooltipContent className="bg-[#2B2E2E] border-[#3D4141] text-white">Selecciona una tarjeta para inspeccionar el paquete de decisión.</TooltipContent>
        </Tooltip>
      </div>
      <div className="min-h-0 overflow-hidden">
        <AgentGrid agents={agents} />
      </div>
    </section>
  );
}

export const FleetMonitor = memo(FleetMonitorInner);
