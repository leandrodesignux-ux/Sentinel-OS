"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EmergencyStop } from "@/components/controls/EmergencyStop";
import { ControlsSection } from "@/components/controls/ControlsSection";
import { DecisionAuditPanel } from "@/components/audit/DecisionAuditPanel";
import { DocsSection } from "@/components/docs/DocsSection";
import { OperatorSummary } from "@/components/dashboard/OperatorSummary";
import { ExceptionsWorkbench } from "@/components/exceptions/ExceptionsWorkbench";
import { FleetMapSection } from "@/components/fleet/FleetMapSection";
import { AgentsView } from "@/components/dashboard/AgentsView";
import type { SentinelSection } from "@/components/layout/SentinelSidebar";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAgentSimulation } from "@/lib/hooks/useAgentSimulation";
import { useAgentStore } from "@/store/agentStore";

const sectionTitles: Record<SentinelSection, string> = {
  resumen: "Panel principal",
  flota: "Mis agentes",
  excepciones: "Para revisar",
  auditoria: "Historial de decisiones",
  controles: "Configuración",
  docs: "Cómo lo construí",
};

const sectionSubtitles: Record<SentinelSection, string> = {
  resumen: "Resumen de actividad de tu flota de IA",
  flota: "50 agentes trabajando en tiempo real",
  excepciones: "Decisiones que necesitan tu criterio",
  auditoria: "Rastro completo de cada acción tomada",
  controles: "Ajusta el comportamiento de tus agentes",
  docs: "El proceso detrás de Sentinel OS — de problema a producto",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", { hour12: false });
}

export function SentinelShell({ initialSection }: { initialSection: SentinelSection }) {
  const [activeSection, setActiveSection] = useState<SentinelSection>(initialSection);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const router = useRouter();
  const agents = useAgentStore((state) => state.agents);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const emergencyHalt = useAgentStore((state) => state.emergencyHalt);
  const hasCriticalAgents = agents.some((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical");
  useAgentSimulation({
    tickInterval: 2000,
    volatility: "medium",
    scenarioMode: "normal",
  });
  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  function navigateSection(section: SentinelSection) {
    setActiveSection(section);
    router.push(`/?section=${section}`);
  }

  return (
    <TooltipProvider>
      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      {emergencyHalt.active && (
        <div className="fixed left-3 top-[72px] z-40 flex w-[196px] items-center gap-2 rounded-data border border-[#F87171]/30 bg-[#F87171]/15 px-3 py-2 font-display text-xs text-[#F87171]">
          <span className="h-2 w-2 animate-status-pulse rounded-full bg-[#F87171]" />
          <span>FLOTA DETENIDA</span>
        </div>
      )}
      <main className="ml-[240px] flex min-h-screen flex-col overflow-hidden bg-[#1A1D1D]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#3D4141] bg-[#1A1D1D] px-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {sectionTitles[activeSection]}
            </h2>
            <p className="mt-0.5 text-xs text-[#A8AFAF]">
              {sectionSubtitles[activeSection]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white font-mono">{formatTime(now)}</span>
            {hasCriticalAgents && <EmergencyStop />}
          </div>
        </header>

        <section className="bg-[#1A1D1D] min-h-0 flex-1 overflow-hidden p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === "resumen" && (
                <OperatorSummary agents={agents} onViewExceptions={() => navigateSection("excepciones")} />
              )}
              {activeSection === "flota" && <AgentsView agents={agents} />}
              {activeSection === "excepciones" && <ExceptionsWorkbench agents={agents} onOpenAudit={(agentId) => { selectAgent(agentId); navigateSection("auditoria"); }} />}
              {activeSection === "auditoria" && <DecisionAuditPanel agents={agents} />}
              {activeSection === "controles" && <ControlsSection agents={agents} />}
              {activeSection === "docs" && <DocsSection />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </TooltipProvider>
  );
}
