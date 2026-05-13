"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { KPITicker } from "@/components/charts/KPITicker";
import type { Agent, AgentType } from "@/types/agent";

type FilterTab = "todos" | "ventas" | "activos" | "mantenimiento" | "evaluacion";

const tabs: { id: FilterTab; label: string; type?: AgentType }[] = [
  { id: "todos", label: "Todos" },
  { id: "ventas", label: "Ventas", type: "sales" },
  { id: "activos", label: "Activos", type: "asset_mgmt" },
  { id: "mantenimiento", label: "Mant.", type: "maintenance" },
  { id: "evaluacion", label: "Eval.", type: "screening" },
];

export function AgentsView({ agents }: { agents: Agent[] }) {
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Filter agents based on active tab, search query, and alert filter
  const filteredAgents = useMemo(() => {
    let result = agents;

    // Filter by type tab
    if (activeTab !== "todos") {
      const tabConfig = tabs.find((t) => t.id === activeTab);
      if (tabConfig?.type) {
        result = result.filter((a) => a.type === tabConfig.type);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          a.current_task.description.toLowerCase().includes(query)
      );
    }

    // Filter by alerts only
    if (showOnlyAlerts) {
      result = result.filter(
        (a) =>
          a.status === "intervention_required" ||
          a.status === "circuit_open" ||
          a.status === "suspended"
      );
    }

    return result;
  }, [agents, activeTab, searchQuery, showOnlyAlerts]);

  // Count active agents (running or idle)
  const activeCount = agents.filter(
    (a) => a.status === "running" || a.status === "idle"
  ).length;
  const totalCount = agents.length;

  return (
    <div className="flex flex-col h-full bg-[#1A1D1D] overflow-hidden">
      {/* Header Row */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#3D4141]">
        {/* Title + Counter */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">Mis agentes</h1>
          <span className="text-sm text-[#6B7272]">
            {activeCount} activos de {totalCount}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#2B2E2E] text-white border border-[#4A5050]"
                  : "text-[#6B7272] hover:text-[#A8AFAF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Alert Filter */}
        <div className="flex items-center gap-3">
          {/* Solo con alerta */}
          <button
            onClick={() => setShowOnlyAlerts(!showOnlyAlerts)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showOnlyAlerts
                ? "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40"
                : "text-[#6B7272] hover:text-[#A8AFAF] border border-[#3D4141]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Solo con alerta
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7272]" />
            <input
              type="text"
              placeholder="Buscar agente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#2B2E2E] border border-[#3D4141] rounded-full text-sm text-white placeholder:text-[#6B7272] focus:outline-none focus:border-[#4A5050] w-40"
            />
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="px-6 py-3 border-b border-[#3D4141]">
        <KPITicker agents={agents} />
      </div>

      {/* Body — 2 Column Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column — Agent Grid */}
        <div className="flex-[2] p-6 overflow-y-auto">
          {/* AGENT_GRID */}
        </div>

        {/* Right Column — Detail Panel */}
        <div className="flex-1 p-6 pl-0 overflow-y-auto border-l border-[#3D4141]">
          {/* DETAIL_PANEL */}
        </div>
      </div>

      {/* Footer — Agents Table */}
      <div className="px-6 py-4 border-t border-[#3D4141]">
        {/* AGENTS_TABLE */}
      </div>
    </div>
  );
}
