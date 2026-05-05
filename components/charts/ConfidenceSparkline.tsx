"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { Agent } from "@/types/agent";

export function ConfidenceSparkline({ agent }: { agent: Agent }) {
  const data = agent.confidence_history.map((value, index) => ({ index, value: Math.round(value * 100) }));

  return (
    <ResponsiveContainer width="100%" height={46}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
        <Area type="monotone" dataKey="value" stroke="currentColor" fill="currentColor" fillOpacity={0.14} strokeWidth={2} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
