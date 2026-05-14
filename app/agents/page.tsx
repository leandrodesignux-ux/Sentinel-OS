"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, Users, Activity, Shield, Bot, ChevronDown, ChevronUp } from "lucide-react";
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
  const [showAllAgents, setShowAllAgents] = useState(false);

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

  // Featured agent (first) + remaining for grid
  const featuredAgent = filteredAgents[0] || null;
  const remainingAgents = filteredAgents.slice(1);
  
  // Agents to show in grid (limit when collapsed)
  const gridLimit = showAllAgents ? remainingAgents.length : 3;
  const visibleAgents = remainingAgents.slice(0, gridLimit);
  
  // Table shows all agents (for detailed view)
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
    <div className="min-h-screen" style={{ background: 'var(--bg-void)' }}>
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
              <p className="text-[#A8AFAF]">
                {activeCount} activos de {agents.length} agentes
                {alertCount > 0 && (
                  <span className="ml-2" style={{ color: 'var(--status-critical)' }}>
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
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all",
                  alertOnly
                    ? "border bg-[#F87171]/10 text-[#F87171]"
                    : "border bg-[#1A1D1D] text-[#A8AFAF] hover:bg-[#2B2E2E]"
                )}
                style={{ borderRadius: 'var(--radius-inner)', borderColor: alertOnly ? 'rgba(248, 113, 113, 0.2)' : '#3D4141' }}
              >
                <AlertTriangle className="w-4 h-4" />
                Solo alertas
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8AFAF]" />
                <input
                  type="text"
                  placeholder="Buscar agente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 pr-4 py-2 w-48 text-sm",
                    "text-white placeholder-[#A8AFAF]",
                    "focus:outline-none focus:ring-1",
                    "transition-all"
                  )}
                  style={{ 
                    backgroundColor: '#1A1D1D', 
                    borderRadius: 'var(--radius-inner)',
                    border: '1px solid #3D4141'
                  }}
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
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                    typeFilter === tab.id
                      ? "bg-[#D7FEFA]/10 text-[#D7FEFA]"
                      : "bg-[#1A1D1D] text-[#A8AFAF] hover:bg-[#2B2E2E] hover:text-white"
                  )}
                  style={{ 
                    borderRadius: 'var(--radius-inner)',
                    border: `1px solid ${typeFilter === tab.id ? 'rgba(215, 254, 250, 0.2)' : '#3D4141'}`
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.header>

        {/* KPI Stats - Premium Compact */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide"
        >
          <div 
            className="flex items-center gap-3 px-4 py-2.5 border backdrop-blur-sm shrink-0"
            style={{ backgroundColor: '#1A1D1D', borderRadius: 'var(--radius-inner)', borderColor: '#3D4141' }}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(215, 254, 250, 0.1)', borderRadius: 'var(--radius-inner)' }}
            >
              <Bot className="w-4 h-4" style={{ color: '#D7FEFA' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#6B7272' }}>Total</p>
              <p className="text-lg font-semibold leading-tight text-white" style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{agents.length}</p>
            </div>
          </div>
          
          <div 
            className="flex items-center gap-3 px-4 py-2.5 border backdrop-blur-sm shrink-0"
            style={{ backgroundColor: '#1A1D1D', borderRadius: 'var(--radius-inner)', borderColor: '#3D4141' }}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: 'var(--radius-inner)' }}
            >
              <Activity className="w-4 h-4" style={{ color: '#34D399' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#6B7272' }}>Active</p>
              <p className="text-lg font-semibold leading-tight" style={{ color: '#34D399', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{activeCount}</p>
            </div>
          </div>
          
          <div 
            className="flex items-center gap-3 px-4 py-2.5 border backdrop-blur-sm shrink-0"
            style={{ 
              backgroundColor: alertCount > 0 ? 'rgba(248, 113, 113, 0.1)' : '#1A1D1D', 
              borderRadius: 'var(--radius-inner)', 
              borderColor: alertCount > 0 ? 'rgba(248, 113, 113, 0.2)' : '#3D4141'
            }}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ 
                backgroundColor: alertCount > 0 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(107, 114, 114, 0.2)', 
                borderRadius: 'var(--radius-inner)' 
              }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: alertCount > 0 ? '#F87171' : '#6B7272' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#6B7272' }}>Alerts</p>
              <p 
                className="text-lg font-semibold leading-tight" 
                style={{ color: alertCount > 0 ? '#F87171' : '#6B7272', fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {alertCount}
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-center gap-3 px-4 py-2.5 border backdrop-blur-sm shrink-0"
            style={{ backgroundColor: '#1A1D1D', borderRadius: 'var(--radius-inner)', borderColor: '#3D4141' }}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(107, 114, 114, 0.2)', borderRadius: 'var(--radius-inner)' }}
            >
              <Shield className="w-4 h-4" style={{ color: '#6B7272' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#6B7272' }}>Paused</p>
              <p className="text-lg font-semibold leading-tight" style={{ color: '#6B7272', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{pausedCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Cinematic Agent Layout - Featured + Horizontal Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A8AFAF' }}>Agent Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tabular-nums" style={{ color: '#6B7272' }}>
                {filteredAgents.length} agents
              </span>
              {remainingAgents.length > 3 && (
                <button
                  onClick={() => setShowAllAgents(!showAllAgents)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors hover:bg-[#D7FEFA]/10"
                  style={{ color: '#D7FEFA', borderRadius: 'var(--radius-inner)' }}
                >
                  {showAllAgents ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      View all
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          <AgentGrid
            featuredAgent={featuredAgent}
            agents={visibleAgents}
            onAgentClick={handleAgentClick}
            onPauseResume={handlePauseResume}
            expanded={showAllAgents}
          />
        </motion.section>

        {/* Detailed Fleet Table */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-medium uppercase tracking-wider" style={{ color: '#A8AFAF' }}>Fleet Details</h2>
            <span className="text-[10px] tabular-nums" style={{ color: '#6B7272' }}>{tableAgents.length} total</span>
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
