import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn, updateMarketStatus } from "@/lib/utils";
import {
  MARKET_STATUSES,
  MarketStatus,
  Side,
  isTerminalMarketStatus,
  type UpdateMarketStatusInput,
} from "@repo/types/market";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResolveMarketDialog } from "@/components/market/ResolveMarketDialog";

const statusTone = (status: MarketStatus) =>
  status === MarketStatus.ACTIVE ? "text-mint" : "text-peach";

export const StatusBadge = ({
  status,
  className,
  marketId,
  editable = false,
}: {
  status: MarketStatus;
  className?: string;
  marketId?: string;
  editable?: boolean;
}) => {
  const queryClient = useQueryClient();
  const canEdit =
    editable && Boolean(marketId) && !isTerminalMarketStatus(status);
  const [resolveOpen, setResolveOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: UpdateMarketStatusInput) =>
      updateMarketStatus(marketId!, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["market", marketId], updated);
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      const outcomeNote =
        updated.status === MarketStatus.RESOLVED && updated.outcome
          ? ` (${updated.outcome})`
          : "";
      toast.success(`Market marked ${updated.status}${outcomeNote}`);
      setResolveOpen(false);
    },
    onError: (err) => {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to update status.";
      toast.error(message);
    },
  });

  const applyStatus = (next: MarketStatus) => {
    if (next === status) return;
    if (next === MarketStatus.RESOLVED) {
      setResolveOpen(true);
      return;
    }
    mutate({ status: next, outcome: null });
  };

  return (
    <>
      <Select
        value={status}
        {...(canEdit
          ? {
              disabled: isPending,
              onValueChange: (value: string | null) => {
                if (!value) return;
                applyStatus(value as MarketStatus);
              },
            }
          : { disabled: true })}
      >
        <SelectTrigger
          size="sm"
          className={cn(
            "status-badge",
            statusTone(status),
            !canEdit && "shadow-none disabled:opacity-100 [&_svg]:hidden",
            className,
          )}
        >
          <SelectValue />
        </SelectTrigger>
        {canEdit && (
          <SelectContent align="end">
            {MARKET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        )}
      </Select>

      <ResolveMarketDialog
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        isPending={isPending}
        onResolve={(outcome: Side) =>
          mutate({ status: MarketStatus.RESOLVED, outcome })
        }
      />
    </>
  );
};
