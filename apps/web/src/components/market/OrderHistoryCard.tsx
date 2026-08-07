import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrderStatus, OrderType, type Order } from "@repo/types/order";
import { LoadingDots } from "@/components/loaders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, fetchUserOrders, formatInr } from "@/lib/utils";

type StatusFilter = "ALL" | OrderStatus;
type TypeFilter = "ALL" | OrderType;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.PARTIALLY_FULFILLED, label: "Partial" },
  { value: OrderStatus.FULFILLED, label: "Filled" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: OrderType.BUY, label: "Buy" },
  { value: OrderType.SELL, label: "Sell" },
];

const optionLabel = <T extends string>(
  options: { value: T; label: string }[],
  value: T,
) => options.find((option) => option.value === value)?.label ?? value;

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PARTIALLY_FULFILLED: "Partial",
  FULFILLED: "Filled",
  CANCELLED: "Cancelled",
};

const formatTime = (value: string | Date) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const OrderRow = ({ order }: { order: Order }) => (
  <div className="order-history-row" role="row">
    <span className={order.side === "YES" ? "text-mint" : "text-peach"}>
      {order.type} {order.side === "YES" ? "Yes" : "No"}
    </span>
    <span className="tabular-nums">{formatInr(order.price)}</span>
    <span className="tabular-nums">
      {order.filledQuantity}/{order.quantity}
    </span>
    <span className="text-muted-foreground">{STATUS_LABEL[order.status]}</span>
    <span className="text-muted-foreground">{formatTime(order.createdAt)}</span>
  </div>
);

export const OrderHistoryCard = ({ marketId }: { marketId: string }) => {
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");

  const {
    data: orders,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user-orders", marketId, status],
    queryFn: () =>
      fetchUserOrders(marketId, status === "ALL" ? undefined : status),
    enabled: Boolean(marketId),
  });

  const filteredOrders =
    type === "ALL"
      ? orders
      : orders?.filter((order) => order.type === type);

  return (
    <section className="market-panel" aria-label="Order history">
      <div className="market-panel-header">
        <h2 className="market-panel-title">Order History</h2>
        <div className="market-view-toggle" role="group" aria-label="Filters">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Type</span>
            <Select
              value={type}
              onValueChange={(value) => {
                if (value) setType(value as TypeFilter);
              }}
            >
              <SelectTrigger size="sm" aria-label="Filter by order type">
                <SelectValue>{optionLabel(TYPE_OPTIONS, type)}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {TYPE_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status</span>
            <Select
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value as StatusFilter);
              }}
            >
              <SelectTrigger size="sm" aria-label="Filter by status">
                <SelectValue>{optionLabel(STATUS_OPTIONS, status)}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "market-panel-body",
          filteredOrders && filteredOrders.length > 0 && "market-panel-body-fill",
        )}
      >
        {isPending ? (
          <LoadingDots />
        ) : isError ? (
          <p className="market-panel-label">Failed to load orders</p>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <p className="market-panel-label">No orders yet</p>
        ) : (
          <div className="order-history">
            <div className="order-history-header" role="row">
              <span>Order</span>
              <span>Price</span>
              <span>Filled</span>
              <span>Status</span>
              <span>Time</span>
            </div>
            <div className="order-history-list">
              {filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
