"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Users, Activity, Shield, Bot } from "lucide-react";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { AgentModal } from "@/components/agents/AgentModal";
import { AgentsTable } from "@/components/agents/AgentsTable";
import { useAgentStore } from "@/store/agentStore";
import { cn } from "@/lib/utils";
import type { Agent, AgentType } from "@/types/agent";

const typeTabs: { id: AgentType | "all"; label: string; icon: typeof Users }[] = [
  { id: "all", label: "All", icon: Users },
  { id: "sales", label: "Sales", icon: Activity },
  { id: "asset_mgmt", label: "Assets", icon: Shield },
  { id: "maintenance", label: "Maint.", icon: Activity },
  { id: "screening", label: "Screening", icon: Shield },
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

  const handleAgentClick = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  }, []);

  const handlePauseResume = useCallback(async (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    
    const newStatus = agent.status === "suspended" ? "idle" : "suspended";
    updateAgent(agentId, { status: newStatus });
  }, [agents, updateAgent]);

  const handleModalPauseResume = useCallback(async () => {
    if (!selectedAgent) return;
    await handlePauseResume(selectedAgent.id);
    // Update selected agent reference after state change
    const updated = agents.find((a) => a.id === selectedAgent.id);
    if (updated) {
      setSelectedAgent(updated);
    }
  }, [selectedAgent, agents, handlePauseResume]);

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

        {/* Compact KPI Cards - Linear/Vercel Style */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6 overflow-x-auto pb-1"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900/40 border border-white/[0.06] backdrop-blur-sm shrink-0">
            <div className="w-8 h-8 rounded-md bg-indigo-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Total</p>
              <p className="text-lg font-semibold text-white leading-tight">{agents.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900/40 border border-white/[0.06] backdrop-blur-sm shrink-0">
            <div className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Active</p>
              <p className="text-lg font-semibold text-emerald-400 leading-tight">{activeCount}</p>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg border backdrop-blur-sm shrink-0",
            alertCount > 0 
              ? "bg-rose-500/10 border-rose-500/20" 
              : "bg-slate-900/40 border-white/[0.06]"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              alertCount > 0 ? "bg-rose-500/20" : "bg-slate-500/20"
            )}>
              <AlertTriangle className={cn("w-4 h-4", alertCount > 0 ? "text-rose-400" : "text-slate-400")} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Alerts</p>
              <p className={cn("text-lg font-semibold leading-tight", alertCount > 0 ? "text-rose-400" : "text-slate-400")}>
                {alertCount}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900/40 border border-white/[0.06] backdrop-blur-sm shrink-0">
            <div className="w-8 h-8 rounded-md bg-slate-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Paused</p>
              <p className="text-lg font-semibold text-slate-400 leading-tight">{pausedCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Agent Cards Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-300">Active Agents</h2>
            <span className="text-xs text-slate-500">
              {gridAgents.length} shown
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-300">Agent Fleet</h2>
            <span className="text-xs text-slate-500">{tableAgents.length} total</span>
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
