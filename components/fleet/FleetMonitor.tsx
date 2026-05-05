"use client";

import { Eye } from "lucide-react";
import { AgentGrid } from "@/components/fleet/AgentGrid";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Agent } from "@/types/agent";

export function FleetMonitor({ agents }: { agents: Agent[] }) {
  return (
    <section className="overflow-x-auto rounded-data border bg-card/60 p-3 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-accent text-xl">Fleet tactical map</h2>
          <p className="text-sm text-foreground/50">Mission-control grid: 50 agents, 64px x 80px, selected card opens full audit in side panel.</p>
        </div>
        <Tooltip>
          <TooltipTrigger><Eye className="h-5 w-5 text-primary" /></TooltipTrigger>
          <TooltipContent>Click any agent tile to inspect the exception packet.</TooltipContent>
        </Tooltip>
      </div>
      <AgentGrid agents={agents} />
    </section>
  );
}
