"use client";

import { Bot, RadioTower, ShieldCheck, Siren, Zap } from "lucide-react";
import { DecisionAuditPanel } from "@/components/audit/DecisionAuditPanel";
import { GlobalControls } from "@/components/controls/GlobalControls";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

export function SidePanel({ agents }: { agents: Agent[] }) {
  const monitoring = agents.filter((agent) => agent.status === "monitoring").length;
  const suspended = agents.filter((agent) => agent.status === "suspended").length;
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];

  return (
    <aside className="space-y-3">
      <GlobalControls />
      <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
        <div className="flex items-center justify-between"><h2 className="font-accent text-lg text-white">Autopilot envelope</h2><ShieldCheck className="h-5 w-5 text-[#34D399]" /></div>
        <div className="mt-3 grid grid-cols-2 gap-2 font-display text-xs">
          <div className="rounded-data border border-[#3D4141] bg-[#1A1D1D] p-3"><span className="text-[#6B7272]">MONITOR</span><p className="text-2xl text-[#FBBF24]">{monitoring}</p></div>
          <div className="rounded-data border border-[#3D4141] bg-[#1A1D1D] p-3"><span className="text-[#6B7272]">SUSP</span><p className="text-2xl text-[#D7FEFA]">{suspended}</p></div>
        </div>
      </div>
      <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
        <h2 className="font-accent text-lg text-white">Live signals</h2>
        <div className="mt-3 space-y-2 text-sm text-[#A8AFAF]">
          {["Lease fraud anomaly detected", "Maintenance SLA drift contained", "Pricing agent confidence recovered", "Tenant intent classifier under watch"].map((signal, index) => (
            <div key={signal} className="flex items-center gap-2 rounded-data border border-[#3D4141] bg-[#1A1D1D] p-2">
              {index === 0 ? <Siren className="h-4 w-4 animate-signal-blink text-[#F87171]" /> : <RadioTower className="h-4 w-4 animate-status-pulse text-[#D7FEFA]" />}
              <span className="text-[#A8AFAF]">{signal}</span>
            </div>
          ))}
        </div>
      </div>
      {agents.length > 0 && (
        <div className="max-h-[520px] overflow-y-auto rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
          <DecisionAuditPanel agents={agents} />
        </div>
      )}
      <div className="rounded-data border border-[#3D4141] bg-[#2B2E2E] p-3">
        <div className="flex items-center gap-3"><Bot className="h-5 w-5 text-[#D7FEFA]" /><h2 className="font-accent text-lg text-white">Operator mandate</h2></div>
        <p className="mt-3 text-sm leading-6 text-[#A8AFAF]">Intervene only when confidence, anomaly score, policy exposure, or cascade risk crosses the operating envelope.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-[#D7FEFA]"><Zap className="h-4 w-4" /> Autopilot remains the default state.</div>
      </div>
    </aside>
  );
}
