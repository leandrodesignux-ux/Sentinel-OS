"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { ExceptionCard } from "@/components/exceptions/ExceptionCard";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

type Tab = "todas" | "pendiente" | "seguimiento";

export function ExceptionsWorkbench({ agents, onOpenAudit }: {
  agents: Agent[];
  onOpenAudit: (agentId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("pendiente");
  const [toast, setToast] = useState<string | null>(null);
  const approveAgent = useAgentStore((s) => s.approveAgent);

  const exceptions = agents.filter(
    (a) => a.status === "intervention_required" || a.status === "circuit_open" || a.status === "suspended"
  );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "todas", label: "Todas las alertas", count: exceptions.length },
    { id: "pendiente", label: "Pendiente revisión", count: exceptions.filter(a => a.status === "intervention_required").length },
    { id: "seguimiento", label: "En seguimiento", count: exceptions.filter(a => a.status === "circuit_open" || a.status === "suspended").length },
  ];

  const filtered = activeTab === "todas" ? exceptions
    : activeTab === "pendiente" ? exceptions.filter(a => a.status === "intervention_required")
    : exceptions.filter(a => a.status === "circuit_open" || a.status === "suspended");

  const handleApprove = (agentId: string, agentName: string) => {
    approveAgent?.(agentId);
    setToast(`${agentName} aprobado y reactivado`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#1A1D1D]">
      {/* Toast de confirmación */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-5 left-3 right-3 md:left-auto md:right-6 md:w-auto z-50 flex items-center gap-2.5 rounded-2xl bg-[#2B2E2E] border border-[#3D4141] px-4 py-3 shadow-lg"
          >
            <div className="h-6 w-6 rounded-full bg-[#34D399]/20 flex items-center justify-center">
              <CheckCircle className="h-3.5 w-3.5 text-[#34D399]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">Excepción resuelta</p>
              <p className="text-[11px] text-[#6B7272]">{toast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header con tabs */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-white mb-1">Para revisar</h1>
        <p className="text-[13px] text-[#A8AFAF]">Decisiones que necesitan tu criterio, ordenadas por impacto económico</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap md:flex-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#2B2E2E] border border-[#D7FEFA]/30 text-[#D7FEFA]"
                : "bg-transparent border border-[#3D4141] text-[#A8AFAF] hover:bg-[#2B2E2E]"
            }`}
          >
            <span className="md:hidden">{tab.id === "todas" ? "Todas" : tab.id === "pendiente" ? "Pendiente" : "Seguimiento"}</span>
            <span className="hidden md:inline">{tab.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              activeTab === tab.id
                ? "bg-[#D7FEFA]/20 text-[#D7FEFA]"
                : "bg-[#3D4141] text-[#A8AFAF]"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid 3 columnas */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-12 w-12 rounded-2xl bg-[#34D399]/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-[#34D399]" />
          </div>
          <p className="text-[15px] font-medium text-white mb-1">Todo al día</p>
          <p className="text-[13px] text-[#6B7272]">No hay excepciones en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((agent, i) => (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <ExceptionCard
                  agent={agent}
                  onApprove={() => handleApprove(agent.id, agent.name)}
                  onViewDetail={() => onOpenAudit(agent.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
