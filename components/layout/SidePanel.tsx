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
      <div className="rounded-data border bg-white p-3">
        <div className="flex items-center justify-between"><h2 className="font-accent text-lg">Autopilot envelope</h2><ShieldCheck className="h-5 w-5 text-green-700" /></div>
        <div className="mt-3 grid grid-cols-2 gap-2 font-display text-xs">
          <div className="rounded-data border bg-white p-3"><span className="text-[var(--text-muted)]">MONITOR</span><p className="text-2xl text-yellow-700">{monitoring}</p></div>
          <div className="rounded-data border bg-white p-3"><span className="text-[var(--text-muted)]">SUSP</span><p className="text-2xl text-[var(--status-accent)]">{suspended}</p></div>
        </div>
      </div>
      <div className="rounded-data border bg-white p-3">
        <h2 className="font-accent text-lg">Live signals</h2>
        <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
          {["Lease fraud anomaly detected", "Maintenance SLA drift contained", "Pricing agent confidence recovered", "Tenant intent classifier under watch"].map((signal, index) => (
            <div key={signal} className="flex items-center gap-2 rounded-data border bg-background/45 p-2">
              {index === 0 ? <Siren className="h-4 w-4 animate-signal-blink text-red-600" /> : <RadioTower className="h-4 w-4 animate-status-pulse text-[var(--status-accent)]" />}
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>
      {agents.length > 0 && (
        <div className="max-h-[520px] overflow-y-auto rounded-data border bg-white p-3">
          <DecisionAuditPanel agents={agents} />
        </div>
      )}
      <div className="rounded-data border bg-white p-3">
        <div className="flex items-center gap-3"><Bot className="h-5 w-5 text-[var(--status-accent)]" /><h2 className="font-accent text-lg">Operator mandate</h2></div>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Intervene only when confidence, anomaly score, policy exposure, or cascade risk crosses the operating envelope.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--status-accent)]"><Zap className="h-4 w-4" /> Autopilot remains the default state.</div>
      </div>
    </aside>
  );
}
