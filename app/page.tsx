"use client";

import { motion } from "framer-motion";
import { ExceptionFeed } from "@/components/exceptions/ExceptionFeed";
import { FleetMonitor } from "@/components/fleet/FleetMonitor";
import { CommandBar } from "@/components/layout/CommandBar";
import { SidePanel } from "@/components/layout/SidePanel";
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
        <section className="mx-auto flex max-w-[1800px] flex-col gap-3">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <CommandBar agents={agents} />
          </motion.div>
          <div className="grid gap-3 xl:grid-cols-[340px_1fr_400px]">
            <SidePanel agents={agents} />
            <FleetMonitor agents={agents} />
            <aside className="space-y-3">
              <ExceptionFeed />
            </aside>
          </div>
        </section>
      </main>
    </TooltipProvider>
  );
}
