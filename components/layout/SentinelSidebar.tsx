import { AlertTriangle, Command, FileSearch, LayoutDashboard, LogOut, Map, Settings } from "lucide-react";
import Link from "next/link";
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
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-[#1E2235] bg-[#0D0F1A] px-3 py-4">
      <div>
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-data border border-primary/30 bg-primary/10 text-primary"><Command className="h-4 w-4" /></div>
          <h1 className="font-accent text-lg font-semibold text-foreground">Sentinel OS</h1>
        </div>
        <div className={cn("mt-4 flex items-center gap-2 rounded-data border px-3 py-2 font-display text-xs", fleetStopped ? "border-critical/30 bg-critical/15 text-critical" : "border-ok/20 bg-ok/10 text-ok")}>
          <span className={cn("h-2 w-2 animate-status-pulse rounded-full", fleetStopped ? "bg-critical" : "bg-ok")} />
          <span>{fleetStopped ? "FLOTA DETENIDA" : `${nominalCount}/50 agentes nominales`}</span>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;

          return (
            <div key={section.id} className={section.separated ? "border-t border-[#1E2235] pt-3" : undefined}>
              <Link href={`/?section=${section.id}`} className={cn("flex w-full items-center justify-between rounded-data px-3 py-2 text-left font-display text-sm transition", active ? "bg-primary/15 text-primary" : "text-foreground/58 hover:bg-white/5 hover:text-foreground")}>
                <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{section.label}</span>
                {section.id === "excepciones" && exceptionCount > 0 && <span className="rounded-full bg-critical px-1.5 py-0.5 text-[10px] text-white">{exceptionCount}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-data border border-[#1E2235] bg-white/[0.03] p-3">
        <p className="font-display text-sm text-foreground">Operador Vega</p>
        <div className="mt-2 inline-flex rounded-badge border border-ok/30 px-2 py-1 font-display text-[10px] text-ok">Turno activo</div>
        <button className="mt-3 flex w-full items-center gap-2 rounded-badge border border-[#1E2235] px-3 py-2 font-display text-xs text-foreground/60 hover:text-foreground">
          <LogOut className="h-3.5 w-3.5" /> Salir
        </button>
      </div>
    </aside>
  );
}
