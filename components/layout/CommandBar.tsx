"use client";

import { FleetHealthBar } from "@/components/charts/FleetHealthBar";
import { KPITicker } from "@/components/charts/KPITicker";
import { Badge } from "@/components/ui/badge";
import { SentinelLogo } from "@/components/brand/SentinelLogo";
import type { Agent } from "@/types/agent";

export function CommandBar({ agents }: { agents: Agent[] }) {
  return (
    <header className="flex flex-col gap-3 rounded-data border border-[#3D4141] bg-[#1A1D1D] p-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-[320px]">
        <div className="flex items-center gap-3">
          <SentinelLogo variant="isotipo" size="xs" hoverAnimation={false} />
          <h1 className="font-accent text-3xl font-semibold tracking-tight text-white">Sentinel OS</h1>
          <Badge className="bg-[#F6F4D2]/10 text-[#F6F4D2] border-[#F6F4D2]/20">SUPERVISION BY EXCEPTION</Badge>
        </div>
        <p className="mt-2 text-sm text-[#A8AFAF]">One human operator supervising 50 autonomous PropTech agents.</p>
      </div>
      <div className="w-full max-w-5xl space-y-3">
        <FleetHealthBar agents={agents} />
        <KPITicker agents={agents} />
      </div>
      <button className="border border-[#F87171]/40 bg-transparent hover:bg-[#F87171]/10 text-[#F87171] rounded-lg px-3 py-2 text-sm font-medium transition-colors">
        Pausar toda la flota
      </button>
    </header>
  );
}
