"use client";

import { Bell, BookOpen, ClipboardList, Command, LayoutDashboard, Settings, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type SentinelSection = "resumen" | "flota" | "excepciones" | "auditoria" | "controles" | "docs";

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
  { id: "docs", label: "Cómo lo construí", icon: BookOpen },
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
                "relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                active
                  ? "bg-[#EBF5FF] text-[#2E90FA] font-medium border border-[#BDDEFF]"
                  : "text-[#475467] hover:bg-[#F5F6F5] border border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" style={{ color: active ? "#2E90FA" : "#98A2B3" }} />
                {section.label}
              </span>
              <span className="flex items-center gap-2">
                {section.id === "excepciones" && exceptionCount > 0 && (
                  <motion.span
                    key={exceptionCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="rounded-full bg-[var(--status-warning)] text-white text-[10px] font-semibold min-w-[18px] h-[18px] flex items-center justify-center"
                  >
                    {exceptionCount}
                  </motion.span>
                )}
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
      <div className="mb-6 flex flex-col gap-1 px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--status-accent)]">
            <Command className="h-7 w-7 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            Sentinel OS
          </span>
        </div>
        <p className="ml-9.5 text-[10px] text-[var(--text-muted)]">by Leandro Balbián</p>
      </div>

      <div className="mx-2 mb-5 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
          <span className="text-sm font-bold text-green-700">
            {nominalCount}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            agentes activos
          </span>
        </div>
        <p className="ml-4 mt-0.5 text-[11px] text-[var(--text-muted)]">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--status-accent)]/10 text-xs font-bold text-[var(--status-accent)]">
            V
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Operador Vega
            </p>
            <p className="text-xs text-[var(--text-muted)]">Turno activo</p>
            <p className="text-[10px] text-[var(--text-muted)]">Portfolio · Leandro Balbián</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
