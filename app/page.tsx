"use client";

import { motion } from "framer-motion";
import { DecisionAuditPanel } from "@/components/audit/DecisionAuditPanel";
import { GlobalControls } from "@/components/controls/GlobalControls";
import { ExceptionFeed } from "@/components/exceptions/ExceptionFeed";
import { FleetMonitor } from "@/components/fleet/FleetMonitor";
import { CommandBar } from "@/components/layout/CommandBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAgentSimulation } from "@/lib/hooks/useAgentSimulation";
import { useAgentStore } from "@/store/agentStore";

export default function Home() {
  const agents = useAgentStore((state) => state.agents);

  useAgentSimulation({
    tickInterval: 2000,
    volatility: "medium",
    scenarioMode: "normal",
  });

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-grid bg-[size:42px_42px] p-3 lg:p-4">
        <section className="mx-auto grid h-[calc(100vh-32px)] max-w-[1900px] grid-rows-[auto_1fr_auto] gap-3 overflow-hidden">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <CommandBar agents={agents} />
          </motion.div>
          <div className="grid min-h-0 gap-3 xl:grid-cols-[1.15fr_0.85fr_1fr]">
            <div className="min-h-0">
              <FleetMonitor agents={agents} />
            </div>
            <aside className="min-h-0 overflow-hidden">
              <ExceptionFeed />
            </aside>
            <DecisionAuditPanel agents={agents} />
          </div>
          <footer className="min-h-0 rounded-data border bg-card/70 p-3 backdrop-blur">
            <GlobalControls />
          </footer>
        </section>
      </main>
    </TooltipProvider>
  );
}
