"use client";

import { useMemo, useState } from "react";
import { Building2, Home, Plus, Search, Users, Wrench, CheckCircle2 } from "lucide-react";
import { AutonomyDial } from "@/components/controls/AutonomyDial";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { confidencePercent } from "@/lib/utils/confidenceUtils";
import { economicImpactK } from "@/lib/utils/riskUtils";
import { useAgentStore } from "@/store/agentStore";
import type { Agent, AgentType } from "@/types/agent";

const typeIcons: Record<AgentType, typeof Building2> = {
  sales: Building2,
  asset_mgmt: Home,
  maintenance: Wrench,
  screening: Users,
};

const typeLabels: Record<AgentType, string> = {
  sales: "Ventas",
  asset_mgmt: "Activos",
  maintenance: "Mantenimiento",
  screening: "Evaluación",
};

const typeAccentColors: Record<AgentType, { bg: string; accent: string }> = {
  sales: { bg: "#EBF8FF", accent: "#2E90FA" },
  asset_mgmt: { bg: "#ECFDF3", accent: "#12B76A" },
  maintenance: { bg: "#FFF7ED", accent: "#F79009" },
  screening: { bg: "#F5F3FF", accent: "#8B5CF6" },
};

const statusLabels: Record<Agent["status"], string> = {
  idle: "En espera",
  running: "Activo",
  monitoring: "Monitoreando",
  intervention_required: "Intervención",
  circuit_open: "Cortacircuito",
  suspended: "Inactivo",
};

function statusColor(agent: Agent) {
  if (agent.status === "intervention_required" || agent.status === "circuit_open") return "#EF4444";
  if (agent.status === "monitoring") return "#F59E0B";
  if (agent.status === "suspended" || agent.status === "idle") return "var(--text-muted)";
  return "#00D4A1";
}

function confidenceColor(confidence: number) {
  if (confidence >= 90) return "#12B76A";
  if (confidence >= 80) return "#F79009";
  return "#F04438";
}

function FleetMapCard({ agent, selected, onSelect, index = 0 }: { agent: Agent; selected: boolean; onSelect: () => void; index?: number }) {
  const Icon = typeIcons[agent.type];
  const confidence = confidencePercent(agent);
  const intervention = agent.status === "intervention_required" || agent.status === "circuit_open";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onSelect} className={cn("flex h-20 w-16 flex-col justify-between rounded-[8px] border border-[var(--bg-border)] bg-white p-1.5 text-left transition hover:border-[var(--status-accent)]/60", intervention && "animate-critical-breach border-red-200", selected && "ring-1 ring-[var(--status-accent)]")}> 
          <div className="flex items-start justify-between gap-1">
            <span className="font-display text-[10px] leading-none text-[var(--text-primary)]">{agent.id}</span>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColor(agent) }} />
          </div>
          <Icon className="mx-auto h-4 w-4 text-[var(--text-secondary)]" />
          <span className={cn("font-display text-[11px] leading-none", confidence >= 90 ? "text-green-700" : confidence >= 80 ? "text-yellow-700" : "text-red-600")}>{confidence}%</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="w-72">
        <div className="space-y-2 text-xs">
          <p className="font-display text-[var(--status-accent)]">{agent.name}</p>
          <p><span className="text-[var(--text-muted)]">Tarea:</span> {agent.current_task.description}</p>
          <p><span className="text-[var(--text-muted)]">Riesgo económico:</span> <span className="text-red-600">${economicImpactK(agent)}K</span></p>
          <p><span className="text-[var(--text-muted)]">Última acción:</span> {agent.metadata.last_human_touch}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function AddAgentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);
  const [agentName, setAgentName] = useState("");
  const [autonomy, setAutonomy] = useState(50);
  const [region, setRegion] = useState("MIA");
  const [dailyLimit, setDailyLimit] = useState("");

  const regions = ["MIA", "BOG", "CDMX", "SCL", "LIM", "MAD"];

  const typeCards = [
    { type: "sales" as AgentType, icon: Building2, title: "Agente de Ventas", desc: "Califica leads, prepara ofertas, gestiona pipeline", color: "blue" },
    { type: "asset_mgmt" as AgentType, icon: Home, title: "Agente de Activos", desc: "Monitorea portafolio, reconcilia NOI y varianzas", color: "green" },
    { type: "maintenance" as AgentType, icon: Wrench, title: "Agente de Mantenimiento", desc: "Coordina órdenes de trabajo con proveedores", color: "orange" },
    { type: "screening" as AgentType, icon: Users, title: "Agente de Evaluación", desc: "Evalúa solicitudes de inquilinos", color: "purple" },
  ];

  const handleNext = () => {
    if (step === 1 && selectedType) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleConfirm = () => {
    onClose();
    setStep(1);
    setSelectedType(null);
    setAgentName("");
    setAutonomy(50);
    setDailyLimit("");
    // Aquí se podría agregar lógica real de creación de agente
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[20px] border-[var(--bg-border)] bg-white shadow-[var(--shadow-card)]">
        {step === 1 && (
          <>
            <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">Elige el tipo de agente</DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-muted)]">Selecciona qué tipo de tareas realizará tu nuevo agente</DialogDescription>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {typeCards.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedType === card.type;
                return (
                  <button
                    key={card.type}
                    onClick={() => setSelectedType(card.type)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition",
                      isSelected ? "border-2 border-[var(--status-accent)] bg-blue-50" : "border-[var(--bg-border)] bg-white hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    <div className={cn("rounded-lg p-2", card.color === "blue" && "bg-blue-100", card.color === "green" && "bg-green-100", card.color === "orange" && "bg-orange-100", card.color === "purple" && "bg-purple-100")}>
                      <Icon className={cn("h-5 w-5", card.color === "blue" && "text-blue-700", card.color === "green" && "text-green-700", card.color === "orange" && "text-orange-700", card.color === "purple" && "text-purple-700")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{card.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{card.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <DialogClose asChild><button className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200">Cancelar</button></DialogClose>
              <button disabled={!selectedType} onClick={handleNext} className="rounded-xl bg-[var(--status-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">Configura tu agente</DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-muted)]">Personaliza el comportamiento y límites de tu agente</DialogDescription>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nombre del agente</label>
                <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Ej: Aria-S21" className="w-full rounded-xl border border-[var(--bg-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--status-accent)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Nivel de autonomía inicial</label>
                <div className="flex gap-2">
                  <button onClick={() => setAutonomy(30)} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition", autonomy === 30 ? "border-[var(--status-accent)] bg-blue-50 text-[var(--status-accent)]" : "border-[var(--bg-border)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")}>Alta supervisión</button>
                  <button onClick={() => setAutonomy(60)} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition", autonomy === 60 ? "border-[var(--status-accent)] bg-blue-50 text-[var(--status-accent)]" : "border-[var(--bg-border)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")}>Balance óptimo</button>
                  <button onClick={() => setAutonomy(90)} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition", autonomy === 90 ? "border-[var(--status-accent)] bg-blue-50 text-[var(--status-accent)]" : "border-[var(--bg-border)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")}>Alta autonomía</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Región</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-xl border border-[var(--bg-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--status-accent)]">
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Límite de gasto diario ($)</label>
                <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} placeholder="50000" className="w-full rounded-xl border border-[var(--bg-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--status-accent)]" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setStep(1)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200">Atrás</button>
              <button onClick={handleNext} className="rounded-xl bg-[var(--status-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">Siguiente</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">Confirmación</DialogTitle>
            <div className="mt-4 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-700" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-[var(--text-primary)]">{agentName || "Nuevo agente"}</p>
                <p className="text-sm text-[var(--text-muted)]">{selectedType && typeLabels[selectedType]}</p>
                <p className="text-sm text-[var(--text-muted)]">Tu agente estará activo en unos segundos</p>
              </div>
              <div className="w-full space-y-2 rounded-xl bg-[var(--bg-canvas)] p-4 text-left text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Autonomía</span><span className="font-medium text-[var(--text-primary)]">{autonomy}%</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Región</span><span className="font-medium text-[var(--text-primary)]">{region}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Límite diario</span><span className="font-medium text-[var(--text-primary)]">${dailyLimit || "50,000"}</span></div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <DialogClose asChild><button className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200">Cancelar</button></DialogClose>
              <button onClick={handleConfirm} className="rounded-xl bg-[var(--status-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">Añadir a la flota →</button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function FleetMapSection({ agents, onOpenAudit }: { agents: Agent[]; onOpenAudit: () => void }) {
  const [typeFilter, setTypeFilter] = useState<AgentType | "all">("all");
  const [alertOnly, setAlertOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [showAddAgent, setShowAddAgent] = useState(false);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);
  const selectAgent = useAgentStore((state) => state.selectAgent);
  const threshold = useAgentStore((state) => state.threshold);
  const setThreshold = useAgentStore((state) => state.setThreshold);

  const visibleAgents = useMemo(() => agents.filter((agent) => {
    if (typeFilter !== "all" && agent.type !== typeFilter) return false;
    if (alertOnly && !(agent.status === "intervention_required" || agent.status === "circuit_open" || agent.risk_level === "critical")) return false;
    if (query && !agent.id.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [agents, alertOnly, query, typeFilter]);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? visibleAgents[0] ?? agents[0];
  const estimatedExceptions = Math.max(4, Math.round((100 - threshold) * 0.47));
  const humanTouches = Math.max(3, Math.round((100 - threshold) * 0.3));

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Mis agentes
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {agents.length} agentes activos en tu flota
          </p>
        </div>
        <button onClick={() => setShowAddAgent(true)} className="flex items-center gap-2 rounded-xl bg-[var(--status-accent)] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition-colors">
          <Plus className="h-4 w-4" />
          Agregar agente
        </button>
      </header>

      <div className="flex items-center gap-2 flex-wrap">
        {["all", "sales", "asset_mgmt", "maintenance", "screening"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type as AgentType | "all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              typeFilter === type
                ? "bg-[var(--status-accent)] text-white"
                : "bg-white border border-[var(--bg-border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            {type === "all" ? "Todos" : typeLabels[type as AgentType]}
          </button>
        ))}
        <button onClick={() => setAlertOnly((v) => !v)} className={cn("ml-auto rounded-full px-3 py-1.5 text-xs font-medium border transition-colors", alertOnly ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-[var(--bg-border)] text-[var(--text-secondary)]")}>
          Solo con alerta
        </button>
        <div className="flex items-center gap-2 rounded-full border border-[var(--bg-border)] bg-white px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <input placeholder="Buscar agente..." className="w-32 bg-transparent text-xs outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_240px] gap-4">
        <section className="overflow-auto rounded-[20px] border border-[var(--bg-border)] bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2">
            {visibleAgents.map((agent, index) => <FleetMapCard key={agent.id} agent={agent} index={index} selected={selectedAgent?.id === agent.id} onSelect={() => selectAgent(agent.id)} />)}
          </div>
        </section>

        <aside className="rounded-[20px] border border-[#E4E7EC] bg-white p-5" style={{boxShadow: "0 1px 3px rgba(0,0,0,0.06)"}}>
          {selectedAgent && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: typeAccentColors[selectedAgent.type].bg }}>
                  {(() => {
                    const Icon = typeIcons[selectedAgent.type];
                    return <Icon className="h-5 w-5" style={{ color: typeAccentColors[selectedAgent.type].accent }} />;
                  })()}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedAgent.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{typeLabels[selectedAgent.type]}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[12px] uppercase tracking-wide text-[var(--text-muted)]">Nivel de seguridad</span>
                  <span className="text-[24px] font-bold" style={{ color: confidenceColor(confidencePercent(selectedAgent)) }}>{confidencePercent(selectedAgent)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-border)]">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${confidencePercent(selectedAgent)}%`, background: confidenceColor(confidencePercent(selectedAgent)) }} />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Estado</span>
                  <span className="font-medium">{statusLabels[selectedAgent.status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Dinero en juego</span>
                  <span className="font-medium text-red-600">${economicImpactK(selectedAgent)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Tarea actual</span>
                  <span className="text-right text-xs text-[var(--text-secondary)] max-w-[120px]">{selectedAgent.current_task.description}</span>
                </div>
              </div>
              <button onClick={onOpenAudit} className="mt-4 w-full rounded-xl border border-[var(--bg-border)] py-2 text-sm text-[var(--status-accent)] hover:bg-[var(--bg-hover)]">
                Ver historial →
              </button>
            </div>
          )}
        </aside>
      </div>

      <section className="rounded-[20px] border border-[#E4E7EC] bg-white p-6 mt-4" style={{boxShadow: "0 1px 3px rgba(0,0,0,0.06)"}}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Nivel de autonomía de la flota
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Qué tan independientes trabajan tus agentes
            </p>
          </div>
          <span className="text-[32px] font-bold text-[#2E90FA] font-mono">{threshold}%</span>
        </div>
        <AutonomyDial value={threshold} onChange={setThreshold} />
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-xl bg-[var(--bg-canvas)] p-2">
            <p className="font-semibold text-[var(--text-primary)]">~{estimatedExceptions}</p>
            <p className="text-[var(--text-muted)]">alertas por hora</p>
          </div>
          <div className="rounded-xl bg-[var(--bg-canvas)] p-2">
            <p className="font-semibold text-[var(--text-primary)]">~{humanTouches}</p>
            <p className="text-[var(--text-muted)]">intervenciones/1k</p>
          </div>
          <div className="rounded-xl bg-[var(--bg-canvas)] p-2">
            <p className="font-semibold text-green-700">
              {threshold >= 70 ? "Alta autonomía" : threshold >= 40 ? "Balance óptimo" : "Alta supervisión"}
            </p>
            <p className="text-[var(--text-muted)]">modo actual</p>
          </div>
        </div>
      </section>

      <AddAgentModal open={showAddAgent} onClose={() => setShowAddAgent(false)} />
    </div>
  );
}
