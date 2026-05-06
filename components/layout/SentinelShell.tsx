"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmergencyStop } from "@/components/controls/EmergencyStop";
import { ControlsSection } from "@/components/controls/ControlsSection";
import { DecisionAuditPanel } from "@/components/audit/DecisionAuditPanel";
import { OperatorSummary } from "@/components/dashboard/OperatorSummary";
import { ExceptionsWorkbench } from "@/components/exceptions/ExceptionsWorkbench";
import { FleetMapSection } from "@/components/fleet/FleetMapSection";
import type { SentinelSection } from "@/components/layout/SentinelSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAgentSimulation } from "@/lib/hooks/useAgentSimulation";
import { useAgentStore } from "@/store/agentStore";

const sectionTitles: Record<SentinelSection, string> = {
  resumen: "Resumen operativo",
  flota: "Mapa de flota",
  excepciones: "Excepciones",
  auditoria: "Auditoría de decisiones",
  controles: "Controles globales",
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", { hour12: false });
}

export function SentinelShell({ initialSection }: { initialSection: SentinelSection }) {
  const [activeSection, setActiveSection] = useState<SentinelSection>(initialSection);
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
      {emergencyHalt.active && (
        <div className="fixed left-3 top-[72px] z-40 flex w-[196px] items-center gap-2 rounded-data border border-critical/30 bg-critical/15 px-3 py-2 font-display text-xs text-critical">
          <span className="h-2 w-2 animate-status-pulse rounded-full bg-critical" />
          <span>FLOTA DETENIDA</span>
        </div>
      )}
      <main className="ml-[220px] flex h-screen flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#1E2235] bg-background/85 px-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <h2 className="font-accent text-xl text-foreground">{sectionTitles[activeSection]}</h2>
            {emergencyHalt.active && <span className="inline-flex items-center gap-2 rounded-badge border border-critical/40 bg-critical/15 px-3 py-1 font-display text-xs text-critical"><AlertTriangle className="h-3.5 w-3.5" /> Parada de flota activa</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-sm text-foreground/55">{formatTime(now)}</span>
            {hasCriticalAgents && <EmergencyStop />}
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-hidden p-4">
          {activeSection === "resumen" && (
            <OperatorSummary agents={agents} onViewExceptions={() => navigateSection("excepciones")} />
          )}
          {activeSection === "flota" && <FleetMapSection agents={agents} onOpenAudit={() => navigateSection("auditoria")} />}
          {activeSection === "excepciones" && <ExceptionsWorkbench agents={agents} onOpenAudit={(agentId) => { selectAgent(agentId); navigateSection("auditoria"); }} />}
          {activeSection === "auditoria" && <DecisionAuditPanel agents={agents} />}
          {activeSection === "controles" && <ControlsSection agents={agents} />}
        </section>
      </main>
    </TooltipProvider>
  );
}
