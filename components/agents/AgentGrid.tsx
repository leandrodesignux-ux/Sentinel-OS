"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AgentCard } from "./AgentCard";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agent";

interface AgentGridProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  onPauseResume: (agentId: string) => Promise<void>;
  maxDisplay?: number;
}

export function AgentGrid({ 
  agents, 
  onAgentClick, 
  onPauseResume,
  maxDisplay = 8 
}: AgentGridProps) {
  const [page, setPage] = useState(0);
  
  // Calculate pagination
  const totalPages = Math.ceil(agents.length / maxDisplay);
  const startIndex = page * maxDisplay;
  const visibleAgents = agents.slice(startIndex, startIndex + maxDisplay);
  
  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div className="w-full">
      {/* Grid - Fixed 4 columns on desktop, responsive on smaller screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AgentCard
              agent={agent}
              onClick={() => onAgentClick(agent)}
              onPauseResume={() => onPauseResume(agent.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <p className="text-lg">No hay agentes disponibles</p>
          <p className="text-sm mt-2">Los agentes aparecerán aquí cuando estén activos</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={!canGoPrevious}
            className={cn(
              "p-2 rounded-lg transition-colors",
              canGoPrevious 
                ? "bg-white/10 hover:bg-white/20 text-white" 
                : "bg-white/5 text-slate-500 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-slate-400">
            Página {page + 1} de {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={!canGoNext}
            className={cn(
              "p-2 rounded-lg transition-colors",
              canGoNext 
                ? "bg-white/10 hover:bg-white/20 text-white" 
                : "bg-white/5 text-slate-500 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Agent count indicator */}
      <div className="text-center mt-4">
        <span className="text-xs text-slate-500">
          Mostrando {visibleAgents.length} de {agents.length} agentes
        </span>
      </div>
    </div>
  );
}
