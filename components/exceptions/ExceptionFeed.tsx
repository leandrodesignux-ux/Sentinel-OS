"use client";

import { AlertTriangle } from "lucide-react";
import { ExceptionCard } from "@/components/exceptions/ExceptionCard";
import { useExceptionQueue } from "@/lib/hooks/useExceptionQueue";

export function ExceptionFeed() {
  const { queuedAgents } = useExceptionQueue();

  return (
    <div className="animate-critical-breach rounded-data border border-critical/30 bg-critical/10 p-3 shadow-danger">
      <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-critical" /><h2 className="font-accent text-lg">Human escalation queue</h2></div>
      <div className="mt-3 space-y-2">
        {queuedAgents.slice(0, 7).map((agent) => <ExceptionCard key={agent.id} agent={agent} />)}
      </div>
    </div>
  );
}
