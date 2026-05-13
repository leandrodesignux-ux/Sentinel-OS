"use client";

import { AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAgentStore } from "@/store/agentStore";

export function EmergencyStop({ hasCriticalAgents = false }: { hasCriticalAgents?: boolean }) {
  const [confirmation, setConfirmation] = useState("");
  const agents = useAgentStore((state) => state.agents);
  const triggerEmergencyHalt = useAgentStore((state) => state.triggerEmergencyHalt);
  const affectedAgents = agents.filter((agent) => agent.status !== "suspended");
  const pausedTasks = affectedAgents.reduce((sum, agent) => sum + Math.max(1, agent.dependencies.length + 1), 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          animate={hasCriticalAgents ? {
            boxShadow: [
              "0 0 0 0 rgba(255, 69, 69, 0)",
              "0 0 0 6px rgba(255, 69, 69, 0.2)",
              "0 0 0 0 rgba(255, 69, 69, 0)"
            ]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-2 rounded-data border border-[var(--status-critical)]/40 bg-[var(--status-critical)]/10 px-4 py-2 font-display text-sm text-[var(--status-critical)] transition-colors hover:bg-[var(--status-critical)]/20"
        >
          <AlertOctagon className="h-4 w-4" />
          Pausar toda la flota
        </motion.button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-[#3D4141] bg-[#2B2E2E] shadow-card">
        <DialogTitle className="text-2xl font-semibold text-white">¿Pausar todos los agentes?</DialogTitle>
        <DialogDescription className="text-sm leading-6 text-[#A8AFAF]">
          Esto hará que todos tus agentes dejen de tomar decisiones de inmediato. Las tareas en curso quedarán en pausa hasta que tú las reactives manualmente.
          <br />
          <br />
          Úsalo si notas comportamiento extraño o si necesitas revisar lo que está pasando con calma.
        </DialogDescription>
        <div className="space-y-2 rounded-xl border border-[#3D4141] bg-[#1A1D1D] p-4 text-sm text-[#A8AFAF]">
          <div className="flex justify-between"><span>{affectedAgents.length} agentes dejarán de trabajar</span><span className="font-semibold text-[#F87171]">{affectedAgents.length}</span></div>
          <div className="flex justify-between"><span>{pausedTasks} tareas quedarán pausadas</span><span className="font-semibold text-[#F87171]">{pausedTasks}</span></div>
          <div className="flex justify-between"><span>Puedes reactivarlos cuando quieras</span><span className="font-semibold text-[#34D399]">Sí</span></div>
        </div>
        <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Escribe PAUSAR para confirmar" className="rounded-xl border border-[#3D4141] bg-[#1A1D1D] px-3 py-2 text-sm text-white outline-none focus:border-[#D7FEFA]/40 placeholder:text-[#6B7272]" />
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <button className="rounded-xl bg-[#2B2E2E] border border-[#3D4141] px-4 py-2 text-sm font-medium text-[#A8AFAF] transition hover:bg-[#333737] hover:text-white">Cancelar</button>
          </DialogClose>
          <DialogClose asChild>
            <button disabled={confirmation !== "PAUSAR"} onClick={() => { triggerEmergencyHalt("all"); setConfirmation(""); }} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">Pausar la flota</button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
