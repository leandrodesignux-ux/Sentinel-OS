"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agent";

interface AgentGridProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  onPauseResume: (agentId: string) => Promise<void>;
}

export const AgentGrid = memo(function AgentGrid({ 
  agents, 
  onAgentClick, 
  onPauseResume 
}: AgentGridProps) {
  // Memoize visible agents to prevent unnecessary re-renders
  const visibleAgents = useMemo(() => agents.slice(0, 8), [agents]);

  // Memoize callbacks for each agent
  const agentCallbacks = useMemo(() => {
    return visibleAgents.map(agent => ({
      onClick: () => onAgentClick(agent),
      onPauseResume: () => onPauseResume(agent.id)
    }));
  }, [visibleAgents, onAgentClick, onPauseResume]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
    >
      {visibleAgents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.03,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          <AgentCard
            agent={agent}
            onClick={agentCallbacks[index].onClick}
            onPauseResume={agentCallbacks[index].onPauseResume}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});
