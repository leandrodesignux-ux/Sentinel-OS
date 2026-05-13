"use client";

import { useState, useMemo } from "react";
import { Eye, Pause, Check } from "lucide-react";
import { useAgentStore } from "@/store/agentStore";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import type { Agent, AgentType, AgentStatus } from "@/types/agent";

const TYPE_COLORS: Record<AgentType, string> = {
  sales: "#FBBF24",
  asset_mgmt: "#D7FEFA",
  maintenance: "#F87171",
  screening: "#A78BFA",
};

const TYPE_LABELS: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mant.",
  screening: "Eval.",
};

const STATUS_COLORS: Record<AgentStatus, { bg: string; text: string }> = {
  idle: { bg: "#34D39920", text: "#34D399" },
  running: { bg: "#34D39920", text: "#34D399" },
  monitoring: { bg: "#FBBF2420", text: "#FBBF24" },
  intervention_required: { bg: "#F8717120", text: "#F87171" },
  circuit_open: { bg: "#F8717120", text: "#F87171" },
  suspended: { bg: "#6B727220", text: "#6B7272" },
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Idle",
  running: "Running",
  monitoring: "Monitoring",
  intervention_required: "Alerta",
  circuit_open: "Alerta",
  suspended: "Pausado",
};

export function AgentsTable({ agents }: { agents: Agent[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const selectAgent = useAgentStore((state) => state.selectAgent);

  const displayedAgents = useMemo(() => {
    return showAll ? agents : agents.slice(0, 15);
  }, [agents, showAll]);

  const allSelected = displayedAgents.length > 0 && selectedIds.length === displayedAgents.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < displayedAgents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedAgents.map((a) => a.id));
    }
  };

  const toggleSelect = (agentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handlePauseSelected = () => {
    console.log("Pausar seleccionados:", selectedIds);
  };

  return (
    <div className="bg-[#1A1D1D] border border-[#3D4141] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* Header */}
          <thead>
            <tr className="bg-[#2B2E2E]">
              <th className="px-4 py-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[#3D4141] bg-[#1A1D1D] text-[#34D399] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">Estado</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">Confianza</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">Riesgo</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider">Tarea actual</th>
              <th className="px-4 py-2 text-[#6B7272] text-xs uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {displayedAgents.map((agent) => {
              const confidence = confidencePercent(agent);
              const confidenceStroke = confidence > 90 ? "#34D399" : confidence >= 80 ? "#FBBF24" : "#F87171";
              const riskHigh = agent.risk_level === "critical" || agent.risk_level === "high";
              const taskShort = agent.current_task.description.length > 40
                ? agent.current_task.description.slice(0, 40) + "..."
                : agent.current_task.description;

              return (
                <tr
                  key={agent.id}
                  className="border-b border-[#3D4141]/50 hover:bg-[#2B2E2E] transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(agent.id)}
                      onChange={() => toggleSelect(agent.id)}
                      className="h-4 w-4 rounded border-[#3D4141] bg-[#1A1D1D] text-[#34D399] focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="font-mono text-xs text-[#6B7272]"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {agent.id.replace("AGT-", "#")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-white">{agent.name}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: TYPE_COLORS[agent.type] + "20",
                        color: TYPE_COLORS[agent.type],
                      }}
                    >
                      {TYPE_LABELS[agent.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        backgroundColor: STATUS_COLORS[agent.status].bg,
                        color: STATUS_COLORS[agent.status].text,
                      }}
                    >
                      {STATUS_LABELS[agent.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white">{confidence}%</span>
                      <div className="w-16 h-1 rounded-full overflow-hidden bg-[#3D4141]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${confidence}%`, background: confidenceStroke }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-2.5 text-sm font-mono ${riskHigh ? "text-[#F87171]" : "text-[#A8AFAF]"}`}>
                    ${economicImpactK(agent)}K
                  </td>
                  <td className="px-4 py-2.5 text-sm text-[#A8AFAF] max-w-[200px] truncate">{taskShort}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => selectAgent(agent.id)}
                        title="Ver detalle"
                        className="p-1.5 rounded hover:bg-[#3D4141] text-[#A8AFAF] hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log("Pausar:", agent.id)}
                        title="Pausar agente"
                        className="p-1.5 rounded hover:bg-[#3D4141] text-[#A8AFAF] hover:text-[#F87171] transition-colors"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show all button */}
      {agents.length > 15 && !showAll && (
        <div className="px-4 py-2 border-t border-[#3D4141] bg-[#2B2E2E]">
          <button
            onClick={() => setShowAll(true)}
            className="text-xs text-[#6B7272] hover:text-[#A8AFAF] transition-colors"
          >
            Ver todos ({agents.length})
          </button>
        </div>
      )}

      {/* Selection bar */}
      {selectedIds.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 px-4 py-3 bg-[#2B2E2E] border-t border-[#3D4141] flex items-center justify-between">
          <span className="text-sm text-[#A8AFAF]">
            {selectedIds.length} agente{selectedIds.length > 1 ? "s" : ""} seleccionado
            {selectedIds.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePauseSelected}
              className="text-sm font-medium text-[#F87171] hover:text-[#F87171]/80 transition-colors"
            >
              Pausar selección
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-[#6B7272] hover:text-[#A8AFAF] transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
