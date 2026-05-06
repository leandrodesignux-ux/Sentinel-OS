"use client";

import { Bell, ClipboardList, Command, LayoutDashboard, Settings, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type SentinelSection = "resumen" | "flota" | "excepciones" | "auditoria" | "controles";

const mainSections: { id: SentinelSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "resumen", label: "Panel principal", icon: LayoutDashboard },
  { id: "flota", label: "Mis agentes", icon: Users },
];

const managementSections: { id: SentinelSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "excepciones", label: "Para revisar", icon: Bell },
  { id: "auditoria", label: "Historial", icon: ClipboardList },
];

const systemSections: { id: SentinelSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "controles", label: "Configuración", icon: Settings },
];

function NavigationGroup({ title, sections, activeSection, exceptionCount, onSectionChange }: { title: string; sections: { id: SentinelSection; label: string; icon: typeof LayoutDashboard }[]; activeSection: SentinelSection; exceptionCount: number; onSectionChange: (section: SentinelSection) => void }) {
  return (
    <>
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {title}
      </p>
      <nav className="space-y-0.5">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;

          return (
            <motion.button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "relative flex w-full items-center justify-between rounded-data px-3 py-2.5 text-left text-sm transition-colors",
                active
                  ? "bg-[var(--status-accent)]/10 font-medium text-[var(--status-accent)]"
                  : "text-[var(--text-secondary)] hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {section.label}
              </span>
              <span className="flex items-center gap-2">
                {section.id === "excepciones" && exceptionCount > 0 && (
                  <motion.span
                    key={exceptionCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="rounded-pill bg-[var(--status-critical)] px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  >
                    {exceptionCount}
                  </motion.span>
                )}
                {active && <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-warning)]" />}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}

export function SentinelSidebar({ activeSection, nominalCount = 47, exceptionCount = 38 }: { activeSection: SentinelSection; nominalCount?: number; exceptionCount?: number; fleetStopped?: boolean }) {
  const router = useRouter();

  function onSectionChange(section: SentinelSection) {
    router.push(`/?section=${section}`);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-[var(--bg-border)] bg-white px-4 py-5">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--status-accent)]">
          <Command className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-[var(--text-primary)]">
          Sentinel OS
        </span>
      </div>

      <div className="mx-2 mb-5 rounded-xl border border-[var(--status-nominal)]/20 bg-[var(--status-nominal)]/10 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-nominal)]" />
          <span className="text-sm font-medium text-[var(--status-nominal)]">
            {nominalCount} agentes activos
          </span>
        </div>
        <p className="ml-4 mt-0.5 text-xs text-gray-400">
          de 50 en tu flota
        </p>
      </div>

      <NavigationGroup title="Principal" sections={mainSections} activeSection={activeSection} exceptionCount={exceptionCount} onSectionChange={onSectionChange} />
      <div className="mt-4">
        <NavigationGroup title="Gestión" sections={managementSections} activeSection={activeSection} exceptionCount={exceptionCount} onSectionChange={onSectionChange} />
      </div>
      <div className="mt-4">
        <NavigationGroup title="Sistema" sections={systemSections} activeSection={activeSection} exceptionCount={exceptionCount} onSectionChange={onSectionChange} />
      </div>

      <div className="mt-auto border-t border-[var(--bg-border)] px-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--status-accent)] to-blue-600 text-xs font-bold text-white">
            V
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Operador Vega
            </p>
            <p className="text-xs text-[var(--text-muted)]">Turno activo</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
