"use client";

import { motion } from "framer-motion";
import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agent";

interface AgentGridProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  onPauseResume: (agentId: string) => Promise<void>;
}

export function AgentGrid({ agents, onAgentClick, onPauseResume }: AgentGridProps) {
  // Limitar a los primeros 8 agentes
  const visibleAgents = agents.slice(0, 8);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {visibleAgents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onClick={() => onAgentClick(agent)}
          onPauseResume={() => onPauseResume(agent.id)}
        />
      ))}
    </motion.div>
  );
}
