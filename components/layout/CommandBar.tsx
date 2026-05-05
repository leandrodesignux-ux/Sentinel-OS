"use client";

import { Command } from "lucide-react";
import { EmergencyStop } from "@/components/controls/EmergencyStop";
import { FleetHealthBar } from "@/components/charts/FleetHealthBar";
import { KPITicker } from "@/components/charts/KPITicker";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/types/agent";

export function CommandBar({ agents }: { agents: Agent[] }) {
  return (
    <header className="flex flex-col gap-3 rounded-data border bg-card/70 p-3 shadow-glow backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="min-w-[320px]">
        <div className="flex items-center gap-3">
          <Command className="h-7 w-7 text-primary" />
          <h1 className="font-accent text-3xl font-semibold tracking-tight">Sentinel OS</h1>
          <Badge>SUPERVISION BY EXCEPTION</Badge>
        </div>
        <p className="mt-2 text-sm text-foreground/58">One human operator supervising 50 autonomous PropTech agents.</p>
      </div>
      <div className="w-full max-w-xl space-y-3">
        <FleetHealthBar agents={agents} />
        <KPITicker agents={agents} />
      </div>
      <EmergencyStop />
    </header>
  );
}
