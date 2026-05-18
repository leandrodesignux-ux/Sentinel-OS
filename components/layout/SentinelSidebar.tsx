"use client";

import { Bell, BookOpen, ClipboardList, LayoutDashboard, Menu, Settings, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
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
                "relative overflow-hidden flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                active
                  ? "bg-[#2B2E2E] text-[#D7FEFA] font-medium"
                  : "text-[#A8AFAF] hover:bg-[#2B2E2E]"
              )}
            >
              {/* Left active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D7FEFA] rounded-full" />
              )}
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

const allSections = [...mainSections, ...managementSections, ...systemSections];

function SidebarContent({ activeSection, nominalCount, exceptionCount, onSectionChange }: { activeSection: SentinelSection; nominalCount: number; exceptionCount: number; onSectionChange: (s: SentinelSection) => void }) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-1 px-2">
        <SentinelLogo variant="isotipo" size="sm" hoverAnimation={true} />
        <p className="ml-9 text-[10px] text-[#6B7272]">by Leandro Balbián</p>
      </div>

      <div className="mx-2 mb-5 rounded-xl border border-[#3D4141] bg-[#2B2E2E] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-[#34D399]" />
          <span className="text-sm font-bold text-white">{nominalCount}</span>
          <span className="text-[11px] text-[#6B7272]">activos</span>
          <span className="ml-auto text-[10px] text-[#6B7272]">/ 12</span>
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-[#3D4141] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#34D399] transition-all duration-700"
            style={{ width: `${Math.min((nominalCount / 12) * 100, 100)}%` }}
          />
        </div>
      </div>

      <NavigationGroup title="Principal" sections={mainSections} activeSection={activeSection} exceptionCount={exceptionCount} onSectionChange={onSectionChange} />
      <div className="mt-4">
        <NavigationGroup title="Gestión" sections={managementSections} activeSection={activeSection} exceptionCount={exceptionCount} onSectionChange={onSectionChange} />
      </div>
      <div className="mt-4">
        <NavigationGroup title="Sistema" sections={systemSections} activeSection={activeSection} exceptionCount={exceptionCount} onSectionChange={onSectionChange} />
      </div>

      <div className="mt-auto pt-4 border-t border-[#3D4141]">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#2B2E2E] transition-colors cursor-pointer">
          <div className="relative flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F4D2]/10 text-xs font-bold text-[#F6F4D2]">
              V
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#34D399] ring-2 ring-[#1A1D1D]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Operador Vega</p>
            <p className="text-xs text-[#6B7272]">Turno activo</p>
            <p className="text-[10px] text-[#6B7272]">Portfolio · Leandro Balbián</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function SentinelSidebar({ activeSection, nominalCount = 47, exceptionCount = 38 }: { activeSection: SentinelSection; nominalCount?: number; exceptionCount?: number; fleetStopped?: boolean }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function onSectionChange(section: SentinelSection) {
    router.push(`/?section=${section}`);
    setMobileOpen(false);
  }

  const activeSectionLabel = allSections.find((s) => s.id === activeSection)?.label ?? "";

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[240px] flex-col bg-[#1A1D1D] border-r border-[#3D4141] px-6 py-6">
        <SidebarContent
          activeSection={activeSection}
          nominalCount={nominalCount}
          exceptionCount={exceptionCount}
          onSectionChange={onSectionChange}
        />
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-[#1A1D1D] border-b border-[#3D4141] px-4 py-3">
        <SentinelLogo variant="isotipo" size="sm" />
        <span className="text-sm font-medium text-white">{activeSectionLabel}</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-[#2B2E2E] transition-colors"
        >
          <Menu className="h-5 w-5 text-[#A8AFAF]" />
        </button>
      </div>

      {/* ── MOBILE DRAWER + BACKDROP ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-30 bg-black/50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 z-40 w-[280px] bg-[#1A1D1D] border-r border-[#3D4141] flex flex-col px-6 py-6"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#2B2E2E] transition-colors"
              >
                <X className="h-5 w-5 text-[#A8AFAF]" />
              </button>

              <SidebarContent
                activeSection={activeSection}
                nominalCount={nominalCount}
                exceptionCount={exceptionCount}
                onSectionChange={onSectionChange}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
