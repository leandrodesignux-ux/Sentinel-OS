"use client";

import { AlertTriangle, Command, FileSearch, LayoutDashboard, LogOut, Map, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type SentinelSection = "resumen" | "flota" | "excepciones" | "auditoria" | "controles";

const sections: { id: SentinelSection; label: string; icon: typeof LayoutDashboard; separated?: boolean }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "flota", label: "Mapa de flota", icon: Map },
  { id: "excepciones", label: "Excepciones", icon: AlertTriangle },
  { id: "auditoria", label: "Auditoría", icon: FileSearch },
  { id: "controles", label: "Controles", icon: Settings, separated: true },
];

export function SentinelSidebar({ activeSection, nominalCount = 47, exceptionCount = 38, fleetStopped = false }: { activeSection: SentinelSection; nominalCount?: number; exceptionCount?: number; fleetStopped?: boolean }) {
  const router = useRouter();

  function onSectionChange(section: SentinelSection) {
    router.push(`/?section=${section}`);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-[var(--bg-border)] bg-[var(--bg-canvas)] px-4 py-6">
      <div>
        <div className="flex items-center gap-2 px-2">
          <Command className="h-5 w-5 text-[var(--status-accent)]" />
          <h1 className="font-accent text-lg font-semibold text-[var(--text-primary)]">Sentinel OS</h1>
        </div>
        <motion.div
          key={nominalCount}
          initial={{ opacity: 0.5, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-5 flex items-center gap-2.5 rounded-data px-3 py-2 font-display text-xs",
            fleetStopped
              ? "bg-[var(--status-critical)]/10 text-[var(--status-critical)]"
              : "bg-[var(--status-nominal)]/8 text-[var(--status-nominal)]"
          )}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              fleetStopped ? "bg-[var(--status-critical)]" : "bg-[var(--status-nominal)]"
            )}
          />
          <span>{fleetStopped ? "FLOTA DETENIDA" : `${nominalCount}/50 nominales`}</span>
        </motion.div>
      </div>

      <nav className="mt-6 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;

          return (
            <div key={section.id} className={section.separated ? "border-t border-[var(--bg-border)] pt-3" : undefined}>
              <motion.button
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-data px-3 py-2.5 text-left font-display text-sm transition-colors",
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 rounded-data bg-white/[0.06]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="activeBorder"
                    className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full"
                    style={{ background: "var(--status-nominal)" }}
                  />
                )}

                <span className="relative flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {section.label}
                </span>

                {section.id === "excepciones" && exceptionCount > 0 && (
                  <motion.span
                    key={exceptionCount}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    className="relative rounded-pill bg-[var(--status-critical)] px-1.5 py-0.5 font-display text-[10px] text-white"
                  >
                    {exceptionCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-data border border-[var(--bg-border)] bg-white/[0.03] p-3">
        <p className="font-display text-sm text-[var(--text-primary)]">Operador Vega</p>
        <div className="mt-2 inline-flex rounded-badge border border-[var(--status-nominal)]/30 px-2 py-1 font-display text-[10px] text-[var(--status-nominal)]">Turno activo</div>
        <button className="mt-3 flex w-full items-center gap-2 rounded-badge border border-[var(--bg-border)] px-3 py-2 font-display text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <LogOut className="h-3.5 w-3.5" /> Salir
        </button>
      </div>
    </aside>
  );
}
