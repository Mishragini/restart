import { Side } from "@repo/types/market";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ResolveMarketDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onResolve: (outcome: Side) => void;
};

export const ResolveMarketDialog = ({
  open,
  onOpenChange,
  isPending = false,
  onResolve,
}: ResolveMarketDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Resolve market</DialogTitle>
        <DialogDescription>Choose the winning outcome.</DialogDescription>
      </DialogHeader>
      <div className="flex gap-3">
        <Button
          className="mint-btn h-11 flex-1"
          disabled={isPending}
          onClick={() => onResolve(Side.YES)}
        >
          Yes
        </Button>
        <Button
          className="peach-btn h-11 flex-1 bg-card hover:bg-card/80"
          disabled={isPending}
          onClick={() => onResolve(Side.NO)}
        >
          No
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
