import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { onRampInrSchema, type OnRampInr } from "@repo/types/balance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  BalanceSummary,
  BalanceSummaryLabel,
  BalanceSummaryRow,
  BalanceSummaryValue,
} from "@/components/balanceSummary";
import { AmountPresets } from "@/components/amountPresets";
import { fetchInrBalance, formatInr, onRampInr } from "@/lib/utils";

const PRESET_AMOUNTS = [50, 100, 200, 500] as const;

export const BalanceWallet = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: balance, isPending: isBalancePending } = useQuery({
    queryKey: ["inr-balance"],
    queryFn: fetchInrBalance,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OnRampInr>({
    resolver: zodResolver(onRampInrSchema),
    defaultValues: { amount: 500 },
  });

  const selectedAmount = watch("amount");

  const { mutate: onRampMutation, isPending: isOnRamping } = useMutation({
    mutationFn: onRampInr,
    onSuccess: (data) => {
      queryClient.setQueryData(["inr-balance"], data);
      toast.success(`${formatInr(selectedAmount)} added to your wallet`);
      reset({ amount: 500 });
      setOpen(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to add funds. Please try again.");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset({ amount: 500 });
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="balance-pill"
            aria-label="Open wallet"
          >
            <span className="balance-pill-label">Balance</span>
            <span className="balance-pill-amount">
              {isBalancePending ? "—" : formatInr(balance?.available ?? 0)}
            </span>
            <span className="balance-pill-add" aria-hidden>
              <PlusIcon className="size-3.5" strokeWidth={2.5} />
            </span>
          </button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add money</DialogTitle>
          <DialogDescription>
            Top up your INR wallet to trade on markets.
          </DialogDescription>
        </DialogHeader>

        <BalanceSummary>
          <BalanceSummaryRow>
            <BalanceSummaryLabel>Available</BalanceSummaryLabel>
            <BalanceSummaryValue>
              {formatInr(balance?.available ?? 0)}
            </BalanceSummaryValue>
          </BalanceSummaryRow>
          {(balance?.locked ?? 0) > 0 && (
            <BalanceSummaryRow>
              <BalanceSummaryLabel>Locked in orders</BalanceSummaryLabel>
              <BalanceSummaryValue tone="peach">
                {formatInr(balance?.locked ?? 0)}
              </BalanceSummaryValue>
            </BalanceSummaryRow>
          )}
        </BalanceSummary>

        <form onSubmit={handleSubmit((data) => onRampMutation(data))}>
          <FieldGroup>
            <Field>
              <FieldLabel>Quick add</FieldLabel>
              <AmountPresets
                amounts={PRESET_AMOUNTS}
                value={selectedAmount}
                onSelect={(amount) =>
                  setValue("amount", amount, { shouldValidate: true })
                }
                formatLabel={formatInr}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="amount">Custom amount</FieldLabel>
              <InputGroup className="h-11">
                <InputGroupAddon align="inline-start">
                  <InputGroupText>₹</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min={0.01}
                  step={0.01}
                  placeholder="Enter amount"
                  {...register("amount", { valueAsNumber: true })}
                />
              </InputGroup>
              <FieldError errors={[errors.amount]} />
            </Field>

            <Button
              type="submit"
              className="mint-btn h-11 w-full"
              disabled={isOnRamping || !selectedAmount}
            >
              {isOnRamping
                ? "Adding..."
                : `Add ${Number.isFinite(selectedAmount) ? formatInr(selectedAmount) : "money"}`}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
