"use client";

import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agent";

interface AgentGridProps {
  featuredAgent: Agent | null;
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
  onPauseResume: (agentId: string) => Promise<void>;
  expanded?: boolean;
}

// Memoized single agent wrapper - no nested motion containers
const AgentItem = memo(function AgentItem({
  agent,
  index,
  onClick,
  onPauseResume,
  featured = false
}: {
  agent: Agent;
  index: number;
  onClick: () => void;
  onPauseResume: () => Promise<void>;
  featured?: boolean;
}) {
  return (
    <AgentCard
      agent={agent}
      onClick={onClick}
      onPauseResume={onPauseResume}
      featured={featured}
      index={index}
    />
  );
});

export const AgentGrid = memo(function AgentGrid({ 
  featuredAgent,
  agents, 
  onAgentClick, 
  onPauseResume,
  expanded = false
}: AgentGridProps) {
  // Memoize callbacks to prevent unnecessary re-renders
  const handleAgentClick = useMemo(() => 
    (agent: Agent) => () => onAgentClick(agent),
  [onAgentClick]);

  const handlePauseResume = useMemo(() => 
    (agentId: string) => () => onPauseResume(agentId),
  [onPauseResume]);

  return (
    <div className="space-y-3">
      {/* Cinematic Layout: Featured (left) + Grid (right) on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: '0.75rem' }}>
        
        {/* Featured Agent - Takes 5/12 on large screens */}
        <AnimatePresence mode="wait">
          {featuredAgent && (
            <motion.div
              key="featured"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:col-span-5"
            >
              <AgentItem
                agent={featuredAgent}
                index={0}
                onClick={handleAgentClick(featuredAgent)}
                onPauseResume={handlePauseResume(featuredAgent.id)}
                featured
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal Grid - Takes 7/12 on large screens */}
        <div className="lg:col-span-7">
          <motion.div 
            layout
            className="grid grid-cols-1"
            style={{ gap: '0.5rem' }}
          >
            <AnimatePresence mode="popLayout">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ 
                    duration: 0.35, 
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  <AgentItem
                    agent={agent}
                    index={index + 1}
                    onClick={handleAgentClick(agent)}
                    onPauseResume={handlePauseResume(agent.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
});
