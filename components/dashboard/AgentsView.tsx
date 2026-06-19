"use client";

import { useState, useMemo, memo } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { AgentGrid } from "@/components/fleet/AgentGrid";
import { AgentDetailPanel } from "@/components/fleet/AgentDetailPanel";
import { FleetHealthBar } from "@/components/charts/FleetHealthBar";
import { KPITicker } from "@/components/charts/KPITicker";
import { useAgentStore } from "@/store/agentStore";
import type { Agent, AgentType } from "@/types/agent";

const typeTabs: { id: AgentType | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "sales", label: "Ventas" },
  { id: "asset_mgmt", label: "Activos" },
  { id: "maintenance", label: "Mant." },
  { id: "screening", label: "Eval." },
];

function AgentsViewInner({ agents }: { agents: Agent[] }) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AgentType | "all">("all");
  const [alertOnly, setAlertOnly] = useState(false);

  // Selected agent from store
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  // Filter logic
  const visibleAgents = useMemo(() => {
    let filtered = agents;
    if (alertOnly) {
      filtered = filtered.filter(
        (a) => a.status === "intervention_required" || a.status === "circuit_open"
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [agents, alertOnly, typeFilter, searchQuery]);

  // Count active agents
  const activeCount = agents.filter(
    (a) => a.status === "running" || a.status === "idle"
  ).length;
  const totalCount = agents.length;

  return (
    <div className="h-full flex flex-col gap-3 p-4 bg-transparent">
      {/* ROW 1 — Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Title + Counter */}
        <div className="flex items-center gap-3">
          <h1 className="font-accent text-xl text-white">Mis agentes</h1>
          <span className="text-[#6B7272] text-sm">
            {activeCount} activos de {totalCount}
          </span>
        </div>

        {/* Center: Type Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {typeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[11px] md:text-xs font-medium transition-colors ${
                typeFilter === tab.id
                  ? "bg-[#D7FEFA]/10 text-[#D7FEFA] border border-[#D7FEFA]/20"
                  : "bg-[#2B2E2E] text-[#A8AFAF] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Alert Toggle + Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setAlertOnly(!alertOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
              alertOnly
                ? "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40"
                : "bg-[#2B2E2E] text-[#A8AFAF] hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Solo con alerta</span>
          </button>

          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7272]" />
            <input
              type="text"
              placeholder="Buscar agente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#2B2E2E] border border-[#3D4141] rounded-lg text-sm placeholder-[#6B7272] text-white focus:outline-none focus:border-[#4A5050] w-full md:w-48"
            />
          </div>
        </div>
      </header>

      {/* ROW 2 — Fleet Health + KPI Ticker */}
      <div className="flex flex-col gap-2">
        <FleetHealthBar agents={agents} />
        <KPITicker agents={agents} />
      </div>

      {/* ROW 3 — Agent Grid + Detail Panel */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
        {/* Left: Agent Grid */}
        <div className="flex-1 md:flex-[2] overflow-y-auto min-h-0 md:pr-1">
          <AgentGrid
            agents={agents}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
          />
        </div>

        {/* Right: Detail Panel — hidden on mobile when no agent selected */}
        {selectedAgent && (
          <div className="w-full md:flex-1 md:min-h-0 md:overflow-y-auto md:max-w-[320px]">
            <AgentDetailPanel agent={selectedAgent} />
          </div>
        )}
      </div>

    </div>
  );
}

export const AgentsView = memo(AgentsViewInner);
