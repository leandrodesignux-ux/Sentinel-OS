"use client";

import { AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

export function EmergencyStop({ hasCriticalAgents = false }: { hasCriticalAgents?: boolean }) {
  return (
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
      Parada de emergencia
    </motion.button>
  );
}
