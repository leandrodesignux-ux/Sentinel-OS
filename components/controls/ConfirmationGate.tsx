import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ConfirmationGate({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-accent text-xl">High-risk confirmation gate</DialogTitle>
        <DialogDescription>Operator confirmation required before changing fleet autonomy or safety envelope.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
