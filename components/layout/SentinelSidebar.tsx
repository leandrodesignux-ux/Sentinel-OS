"use client";

import { Bell, BookOpen, ClipboardList, LayoutDashboard, Settings, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SentinelLogo } from "@/components/brand/SentinelLogo";

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
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B7272]">
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
                "relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                active
                  ? "bg-[#2B2E2E] border border-[#D7FEFA]/30 text-[#D7FEFA] font-medium"
                  : "text-[#A8AFAF] hover:bg-[#2B2E2E] border border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" style={{ color: active ? "#D7FEFA" : "#6B7272" }} />
                {section.label}
              </span>
              <span className="flex items-center gap-2">
                {section.id === "excepciones" && exceptionCount > 0 && (
                  <motion.span
                    key={exceptionCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="rounded-full bg-[#F6F4D2] text-[#1A1D1D] text-[10px] font-semibold min-w-[18px] h-[18px] flex items-center justify-center"
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
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col bg-[#1A1D1D] border-r border-[#3D4141] px-6 py-6">
      <div className="mb-6 flex flex-col gap-1 px-2">
        <SentinelLogo variant="isotipo" size="sm" hoverAnimation={true} />
        <p className="ml-9 text-[10px] text-[#6B7272]">by Leandro Balbián</p>
      </div>

      <div className="mx-2 mb-5 rounded-xl border border-[#3D4141] bg-[#2B2E2E] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#34D399]" />
          <span className="text-sm font-bold text-[#D7FEFA]">
            {nominalCount}
          </span>
          <span className="text-[11px] text-[#6B7272]">
            agentes activos
          </span>
        </div>
        <p className="ml-4 mt-0.5 text-[11px] text-[#6B7272]">
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

      <div className="mt-auto pt-4 border-t border-[#3D4141]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F4D2]/10 text-xs font-bold text-[#F6F4D2]">
            V
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Operador Vega
            </p>
            <p className="text-xs text-[#6B7272]">Turno activo</p>
            <p className="text-[10px] text-[#6B7272]">Portfolio · Leandro Balbián</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
