import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { MarketStatus, Side } from "@repo/types/market";
import {
  OrderType,
  PlaceOrderSchema,
  type Order,
  type PlaceOrderInput,
} from "@repo/types/order";
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
import {
  cn,
  fetchInrBalance,
  fetchStockBalance,
  formatInr,
  mergeUserOrders,
  placeOrder,
  SHARE_PAYOUT_INR,
} from "@/lib/utils";

const DEFAULTS = {
  side: Side.YES,
  type: OrderType.BUY,
  price: 5.5,
  quantity: 1,
} as const;

const positive = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

type OptionToggleProps<T extends string> = {
  options: { id: T; label: string; activeClass?: string }[];
  value: T;
  onChange: (id: T) => void;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
};

function OptionToggle<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className,
  itemClassName,
}: OptionToggleProps<T>) {
  return (
    <div className={cn("market-view-toggle", className)} role="group">
      {options.map(({ id, label, activeClass = "amount-preset-active" }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          data-active={value === id || undefined}
          aria-pressed={value === id}
          className={cn(
            "amount-preset px-3",
            itemClassName,
            value === id && activeClass,
          )}
          onClick={() => onChange(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

type PlaceOrderCardProps = {
  marketId: string;
  status: MarketStatus;
};

export const PlaceOrderCard = ({ marketId, status }: PlaceOrderCardProps) => {
  const queryClient = useQueryClient();
  const canTrade = status === MarketStatus.ACTIVE;

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
  } = useForm<PlaceOrderInput>({
    resolver: zodResolver(PlaceOrderSchema),
    defaultValues: { marketId, ...DEFAULTS },
  });

  const [side, type, price, quantity] = watch([
    "side",
    "type",
    "price",
    "quantity",
  ]);
  const isBuy = type === OrderType.BUY;
  const sideLabel = side === Side.YES ? "Yes" : "No";

  const { data: stockBalance, isPending: isStockPending } = useQuery({
    queryKey: ["stock-balance", marketId],
    queryFn: () => fetchStockBalance(marketId),
    enabled: canTrade && !isBuy,
  });

  const availableShares = stockBalance?.[side]?.available ?? 0;
  const notional = positive(price) * positive(quantity);
  const settlementPayout = positive(quantity) * SHARE_PAYOUT_INR;
  const sellExceedsBalance = !isBuy && quantity > availableShares;

  const { mutate: placeMutation, isPending: isPlacing } = useMutation({
    mutationFn: placeOrder,
    onSuccess: (res, { side, type, quantity, price }) => {
      const now = new Date();
      const mine: Order[] = res.data.orders
        .filter((o) => o.userId === res.userId && o.marketId === marketId)
        .map((o) => ({ ...o, createdAt: now, updatedAt: now }));

      for (const [key, cached] of queryClient.getQueriesData<Order[]>({
        queryKey: ["user-orders", marketId],
      })) {
        queryClient.setQueryData(
          key,
          mergeUserOrders(cached, mine, key[2] as string | undefined),
        );
      }

      queryClient.invalidateQueries({ queryKey: ["orderbook", marketId] });
      queryClient.invalidateQueries({ queryKey: ["inr-balance"] });
      queryClient.invalidateQueries({ queryKey: ["stock-balance", marketId] });
      queryClient.invalidateQueries({
        queryKey: ["user-orders", marketId],
        refetchType: "none",
      });

      toast.success(
        `Placed ${type === OrderType.BUY ? "Buy" : "Sell"} ${side === Side.YES ? "Yes" : "No"} · ${quantity} @ ${formatInr(price)}`,
      );
      reset({
        marketId,
        side,
        type,
        price: DEFAULTS.price,
        quantity: DEFAULTS.quantity,
      });
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to place order. Please try again.",
      );
    },
  });

  const submitDisabled =
    isPlacing ||
    !(price >= 5 && price <= 9.5) ||
    !(quantity >= 1) ||
    sellExceedsBalance ||
    (!isBuy && availableShares < 1);

  const summaryRows = isBuy
    ? [
        {
          label: "Available",
          value: isBalancePending ? "—" : formatInr(balance?.available ?? 0),
        },
        {
          label: "You put",
          value: formatInr(notional),
          tone: "peach" as const,
        },
        { label: "You get", value: formatInr(settlementPayout) },
      ]
    : [
        {
          label: `Available ${sideLabel}`,
          value: isStockPending ? "—" : availableShares.toLocaleString("en-IN"),
        },
        {
          label: "You put",
          value:
            quantity > 0
              ? `${quantity.toLocaleString("en-IN")} ${sideLabel}`
              : "—",
          tone: "peach" as const,
        },
        { label: "You'll receive", value: formatInr(notional) },
      ];

  if (!canTrade) {
    return (
      <section className="market-panel" aria-label="Place order">
        <div className="market-panel-header">
          <h2 className="market-panel-title">Place Order</h2>
        </div>
        <div className="market-panel-body">
          <p className="market-panel-label">
            Trading is closed for this market
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="market-panel" aria-label="Place order">
      <div className="market-panel-header">
        <h2 className="market-panel-title">Place Order</h2>
        <OptionToggle
          options={[
            { id: Side.YES, label: "Yes" },
            {
              id: Side.NO,
              label: "No",
              activeClass: "amount-preset-active-peach",
            },
          ]}
          value={side}
          onChange={(id) => setValue("side", id, { shouldValidate: true })}
        />
      </div>

      <form
        className="market-panel-body market-panel-body-fill place-order-form"
        onSubmit={handleSubmit((data) => placeMutation({ ...data, marketId }))}
      >
        <OptionToggle
          className="w-full"
          itemClassName="flex-1"
          options={[
            { id: OrderType.BUY, label: "Buy" },
            { id: OrderType.SELL, label: "Sell" },
          ]}
          value={type}
          onChange={(id) => setValue("type", id, { shouldValidate: true })}
        />

        <BalanceSummary>
          {summaryRows.map(({ label, value, tone }) => (
            <BalanceSummaryRow key={label}>
              <BalanceSummaryLabel>{label}</BalanceSummaryLabel>
              <BalanceSummaryValue tone={tone}>{value}</BalanceSummaryValue>
            </BalanceSummaryRow>
          ))}
        </BalanceSummary>

        <FieldGroup>
          <Field>
            <FieldLabel>Price</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupAddon align="inline-start">
                <InputGroupText>₹</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="order-price"
                type="number"
                inputMode="decimal"
                min={5}
                max={9.5}
                step={0.5}
                placeholder="Price"
                {...register("price", { valueAsNumber: true })}
              />
            </InputGroup>
            <FieldError errors={[errors.price]} />
          </Field>

          <Field>
            <FieldLabel>Quantity</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupAddon align="inline-start">
                <InputGroupText>×</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="order-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                max={isBuy ? undefined : availableShares}
                placeholder="Quantity"
                {...register("quantity", { valueAsNumber: true })}
              />
            </InputGroup>
            <FieldError errors={[errors.quantity]} />
            {sellExceedsBalance && (
              <p className="text-xs text-peach">
                Only {availableShares.toLocaleString("en-IN")} {sideLabel}{" "}
                shares available
              </p>
            )}
          </Field>

          <Button
            type="submit"
            className={cn(
              "h-11 w-full",
              side === Side.YES
                ? "mint-btn"
                : "peach-btn bg-card hover:bg-card/80",
            )}
            disabled={submitDisabled}
          >
            {isPlacing
              ? "Placing..."
              : `${isBuy ? "Buy" : "Sell"} ${sideLabel} · ${formatInr(notional)}`}
          </Button>
        </FieldGroup>
      </form>
    </section>
  );
};
