"use client";

import { useAgentStore, type CircuitBreakerLevel } from "@/store/agentStore";

const levels: { level: CircuitBreakerLevel; label: string; effect: string }[] = [
  { level: 1, label: "L1 Read-only", effect: "Analiza, no actúa" },
  { level: 2, label: "L2 State freeze", effect: "Pausa lógica · Redis sim" },
  { level: 3, label: "L3 mTLS revocation", effect: "APIs y agentes desconectados" },
  { level: 4, label: "L4 Full suspension", effect: "Kill switch lógico" },
];

export function CircuitBreaker({ agentId }: { agentId: string }) {
  const currentLevel = useAgentStore((state) => state.circuitBreakers[agentId] ?? 0);
  const setCircuitBreakerLevel = useAgentStore((state) => state.setCircuitBreakerLevel);

  return (
    <div className="rounded-data border bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-accent text-sm text-[var(--text-primary)]">Circuit breaker</p>
        <button onClick={() => setCircuitBreakerLevel(agentId, 0)} className="rounded-badge border border-ok/40 px-2 py-1 font-display text-[10px] text-green-700">RESET</button>
      </div>
      <div className="grid gap-2">
        {levels.map((item) => (
          <button key={item.level} onClick={() => setCircuitBreakerLevel(agentId, item.level)} className={`rounded-badge border px-2 py-2 text-left transition ${currentLevel === item.level ? "border-critical bg-critical/15 text-red-600" : "border-border bg-card/60 text-[var(--text-secondary)]"}`}>
            <div className="font-display text-xs">{item.label}</div>
            <div className="mt-1 text-[11px]">{item.effect}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
