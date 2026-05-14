"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Users, Activity, Shield } from "lucide-react";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { AgentModal } from "@/components/agents/AgentModal";
import { AgentsTable } from "@/components/agents/AgentsTable";
import { useAgentStore } from "@/store/agentStore";
import { cn } from "@/lib/utils";
import type { Agent, AgentType } from "@/types/agent";

const typeTabs: { id: AgentType | "all"; label: string; icon: typeof Users }[] = [
  { id: "all", label: "Todos", icon: Users },
  { id: "sales", label: "Ventas", icon: Activity },
  { id: "asset_mgmt", label: "Activos", icon: Shield },
  { id: "maintenance", label: "Mant.", icon: Activity },
  { id: "screening", label: "Eval.", icon: Shield },
];

export default function AgentsPage() {
  // Global state
  const agents = useAgentStore((s) => s.agents);
  const updateAgent = useAgentStore((s) => s.updateAgent);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AgentType | "all">("all");
  const [alertOnly, setAlertOnly] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter logic
  const filteredAgents = useMemo(() => {
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

  // Split agents for grid (top 8) and table (remaining)
  const gridAgents = filteredAgents.slice(0, 8);
  const tableAgents = filteredAgents;

  // Stats
  const activeCount = agents.filter(
    (a) => a.status === "running" || a.status === "idle"
  ).length;
  const alertCount = agents.filter(
    (a) => a.status === "intervention_required" || a.status === "circuit_open"
  ).length;
  const pausedCount = agents.filter((a) => a.status === "suspended").length;

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handlePauseResume = async (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    
    const newStatus = agent.status === "suspended" ? "idle" : "suspended";
    updateAgent(agentId, { status: newStatus });
  };

  const handleModalPauseResume = async () => {
    if (!selectedAgent) return;
    await handlePauseResume(selectedAgent.id);
    // Update selected agent reference after state change
    const updated = agents.find((a) => a.id === selectedAgent.id);
    if (updated) {
      setSelectedAgent(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Subtle dot pattern background */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Mis Agentes</h1>
              <p className="text-slate-400">
                {activeCount} activos de {agents.length} agentes
                {alertCount > 0 && (
                  <span className="ml-2 text-rose-400">
                    · {alertCount} requieren atención
                  </span>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Alert Toggle */}
              <button
                onClick={() => setAlertOnly(!alertOnly)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  alertOnly
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                Solo alertas
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar agente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 pr-4 py-2 w-48 rounded-xl text-sm",
                    "bg-white/5 border border-white/10 text-white placeholder-slate-400",
                    "focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50",
                    "transition-all"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {typeTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    typeFilter === tab.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.header>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Agentes</p>
            <p className="text-2xl font-bold text-white mt-1">{agents.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Activos</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Alertas</p>
            <p className={cn("text-2xl font-bold mt-1", alertCount > 0 ? "text-rose-400" : "text-slate-400")}>
              {alertCount}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Pausados</p>
            <p className="text-2xl font-bold text-slate-400 mt-1">{pausedCount}</p>
          </div>
        </motion.div>

        {/* Agent Cards Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Agentes Principales</h2>
            <span className="text-sm text-slate-400">
              {gridAgents.length} de {filteredAgents.length}
            </span>
          </div>
          
          <AgentGrid
            agents={gridAgents}
            onAgentClick={handleAgentClick}
            onPauseResume={handlePauseResume}
          />
        </motion.section>

        {/* Detailed Table - positioned immediately after grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Todos los Agentes</h2>
            <span className="text-sm text-slate-400">{tableAgents.length} agentes</span>
          </div>
          
          <AgentsTable
            agents={tableAgents}
            onRowClick={handleAgentClick}
            onPauseResume={handlePauseResume}
          />
        </motion.section>
      </div>

      {/* Agent Detail Modal */}
      <AgentModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPauseResume={handleModalPauseResume}
      />
    </div>
  );
}
