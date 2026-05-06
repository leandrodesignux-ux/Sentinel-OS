import { SentinelShell } from "@/components/layout/SentinelShell";
import { SentinelSidebar, type SentinelSection } from "@/components/layout/SentinelSidebar";

const validSections: SentinelSection[] = ["resumen", "flota", "excepciones", "auditoria", "controles"];

export default function Home({ searchParams }: { searchParams?: { section?: string } }) {
  const section = validSections.includes(searchParams?.section as SentinelSection) ? (searchParams?.section as SentinelSection) : "resumen";
  return (
    <div className="min-h-screen bg-grid bg-[size:42px_42px]">
      <SentinelSidebar activeSection={section} />
      <SentinelShell initialSection={section} />
    </div>
  );
}
