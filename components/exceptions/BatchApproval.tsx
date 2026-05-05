import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function BatchApproval() {
  return (
    <Dialog>
      <DialogTrigger className="rounded-badge border border-warn/40 px-2 py-1 font-display text-xs text-warn">BATCH REVIEW</DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-accent text-xl">Batch approval by exception cluster</DialogTitle>
        <DialogDescription>Review grouped low-risk exceptions before returning agents to autopilot.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
