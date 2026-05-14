"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import type { Agent } from "@/types/agent";

type KPIStatus = "nominal" | "warning" | "critical";

export function KPITicker({ agents }: { agents: Agent[] }) {
  const emergencyHalt = useAgentStore((state) => state.emergencyHalt);
  const reactivateFleet = useAgentStore((state) => state.reactivateFleet);
  const [tick, setTick] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const kpis = useMemo(() => {
    const total = Math.max(agents.length, 1);
    const exceptions = agents.filter((agent) => agent.status === "intervention_required" || agent.status === "circuit_open" || agent.status === "suspended").length;
    const nominal = agents.filter((agent) => agent.status === "running" || agent.status === "idle").length;
    const exceptionRate = (exceptions / total) * 100;
    const autoExecRate = 100 - exceptionRate;
    const jitter = (tick % 3) * 0.2;

    return [
      { label: "Exception Rate", value: `${(exceptionRate + jitter).toFixed(1)}%`, target: "<10%", status: exceptionRate < 10 ? "nominal" : exceptionRate < 18 ? "warning" : "critical", trend: "down" },
      { label: "Human Touches/1k", value: `${Math.round(exceptionRate * 1.45)}`, target: "<15", status: exceptionRate * 1.45 < 15 ? "nominal" : "warning" },
      { label: "Auto-Exec Rate", value: `${(autoExecRate - jitter).toFixed(1)}%`, target: ">90%", status: autoExecRate > 90 ? "nominal" : autoExecRate > 82 ? "warning" : "critical" },
      { label: "MTTR", value: `${(3.8 + exceptions * 0.16 + jitter).toFixed(1)}s`, target: "<10s", status: exceptions < 25 ? "nominal" : "warning" },
      { label: "Alert Precision", value: `${(94.1 - Math.min(6, exceptions * 0.08) + jitter).toFixed(1)}%`, target: ">90%", status: exceptions < 35 ? "nominal" : "warning" },
      { label: "Fleet Health", value: `${nominal}/50`, target: ">45", status: nominal > 45 ? "nominal" : nominal > 38 ? "warning" : "critical" },
    ] satisfies { label: string; value: string; target: string; status: KPIStatus; trend?: "down" | "up" }[];
  }, [agents, tick]);

  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!emergencyHalt.undoExpiresAt) return;

    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((new Date(emergencyHalt.undoExpiresAt as string).getTime() - Date.now()) / 1000)));
    }, 250);

    return () => clearInterval(interval);
  }, [emergencyHalt.undoExpiresAt]);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {emergencyHalt.active && (
        <button onClick={reactivateFleet} className="rounded-[12px] border border-[#F87171]/40 bg-[#F87171]/10 p-2 text-left">
          <span className="text-[10px] text-[#6B7272] uppercase tracking-wider">Fleet Status</span>
          <p className="animate-signal-blink text-[#F87171]">EMERGENCY HALT</p>
          <span className="text-[10px] text-[#6B7272]">Reactivar {secondsLeft}s</span>
        </button>
      )}
      {!emergencyHalt.active && kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-[12px] border border-[#3D4141] bg-[#2B2E2E] p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[10px] text-[#6B7272] uppercase tracking-wider">{kpi.label}</span>
            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: kpi.status === "nominal" ? "#34D399" : kpi.status === "warning" ? "#FBBF24" : "#F87171" }} />
          </div>
          <motion.p
            key={`${kpi.label}-${kpi.value}`}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.28 }}
            className="mt-1 text-sm font-mono font-semibold"
            style={{ color: kpi.status === "nominal" ? "#34D399" : kpi.status === "warning" ? "#FBBF24" : "#F87171", fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {kpi.value} {kpi.trend === "down" && "↓"}
          </motion.p>
          <span className="text-[10px] text-[#6B7272]">target {kpi.target}</span>
        </div>
      ))}
    </div>
  );
}
