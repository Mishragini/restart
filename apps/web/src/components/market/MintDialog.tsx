import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { MintSchema, type MintInput } from "@repo/types/market";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import {
  cn,
  fetchInrBalance,
  formatInr,
  mintMarket,
  MINT_COST_PER_PAIR_INR,
} from "@/lib/utils";

const PRESET_AMOUNTS = [1, 5, 10, 25, 50] as const;

type MintDialogProps = {
  marketId: string;
  triggerClassName?: string;
};

export const MintDialog = ({ marketId, triggerClassName }: MintDialogProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: balance, isPending: isBalancePending } = useQuery({
    queryKey: ["inr-balance"],
    queryFn: fetchInrBalance,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MintInput>({
    resolver: zodResolver(MintSchema),
    defaultValues: { amount: 1, marketId },
  });

  const amount = watch("amount");
  const cost =
    Number.isFinite(amount) && amount > 0 ? amount * MINT_COST_PER_PAIR_INR : 0;

  const { mutate: mintMutation, isPending: isMinting } = useMutation({
    mutationFn: mintMarket,
    onSuccess: (data) => {
      if (data?.inrBalance) {
        queryClient.setQueryData(["inr-balance"], data.inrBalance);
      } else {
        queryClient.invalidateQueries({ queryKey: ["inr-balance"] });
      }
      queryClient.invalidateQueries({ queryKey: ["stock-balance", marketId] });
      toast.success(`Minted ${amount} Yes + ${amount} No`);
      reset({ amount: 1, marketId });
      setOpen(false);
    },
    onError: (err) => {
      console.error(err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to mint. Please try again.";
      toast.error(message);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset({ amount: 1, marketId });
      }}
    >
      <DialogTrigger
        render={
          <Button className={cn("mint-btn navbar-btn", triggerClassName)}>
            Mint
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint shares</DialogTitle>
          <DialogDescription>
            Create equal Yes and No shares. Each pair costs{" "}
            {formatInr(MINT_COST_PER_PAIR_INR)}.
          </DialogDescription>
        </DialogHeader>

        <BalanceSummary>
          <BalanceSummaryRow>
            <BalanceSummaryLabel>Available</BalanceSummaryLabel>
            <BalanceSummaryValue>
              {isBalancePending ? "—" : formatInr(balance?.available ?? 0)}
            </BalanceSummaryValue>
          </BalanceSummaryRow>
          <BalanceSummaryRow>
            <BalanceSummaryLabel>Total cost</BalanceSummaryLabel>
            <BalanceSummaryValue tone="peach">
              {formatInr(cost)}
            </BalanceSummaryValue>
          </BalanceSummaryRow>
        </BalanceSummary>

        <form
          onSubmit={handleSubmit((data) =>
            mintMutation({ ...data, marketId }),
          )}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>Quick mint</FieldLabel>
              <AmountPresets
                amounts={PRESET_AMOUNTS}
                value={amount}
                onSelect={(preset) =>
                  setValue("amount", preset, { shouldValidate: true })
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="mint-amount">Number of pairs</FieldLabel>
              <InputGroup className="h-11">
                <InputGroupAddon align="inline-start">
                  <InputGroupText>×</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="mint-amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="Enter pairs"
                  {...register("amount", { valueAsNumber: true })}
                />
              </InputGroup>
              <FieldError errors={[errors.amount]} />
            </Field>

            <Button
              type="submit"
              className="mint-btn h-11 w-full"
              disabled={isMinting || !amount || amount < 1}
            >
              {isMinting ? "Minting..." : `Mint for ${formatInr(cost)}`}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
