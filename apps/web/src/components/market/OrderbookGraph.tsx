import type { GetOrderbookRes, OrderbookLevel } from "@repo/types/engine";
import { cn, formatInr } from "@/lib/utils";

const MAX_LEVELS = 8;

type DepthSide = "yes" | "no";

const DepthCell = ({
  level,
  maxQty,
  side,
}: {
  level: OrderbookLevel | undefined;
  maxQty: number;
  side: DepthSide;
}) => {
  if (!level) {
    return <div className="orderbook-depth orderbook-depth-empty">—</div>;
  }

  const width = maxQty > 0 ? Math.max((level.quantity / maxQty) * 100, 6) : 0;

  return (
    <div className="orderbook-depth">
      <span
        className={cn(
          "orderbook-depth-bar",
          side === "yes" ? "orderbook-depth-bar-yes" : "orderbook-depth-bar-no",
        )}
        style={{ width: `${width}%` }}
        aria-hidden
      />
      <span
        className={cn(
          "orderbook-depth-qty",
          side === "yes" ? "text-mint" : "text-peach",
        )}
      >
        {level.quantity.toLocaleString("en-IN")}
      </span>
    </div>
  );
};

const PriceCell = ({
  level,
  side,
}: {
  level: OrderbookLevel | undefined;
  side: DepthSide;
}) => (
  <span
    className={cn(
      "orderbook-price",
      level
        ? side === "yes"
          ? "text-mint"
          : "text-peach"
        : "text-muted-foreground",
    )}
  >
    {level ? formatInr(level.price) : "—"}
  </span>
);

export const OrderbookGraph = ({ book }: { book: GetOrderbookRes }) => {
  // Available qty to buy = asks (resting sells)
  const yesLevels = book.YES.asks.slice(0, MAX_LEVELS);
  const noLevels = book.NO.asks.slice(0, MAX_LEVELS);
  const rowCount = Math.max(yesLevels.length, noLevels.length, 1);
  const maxQty = Math.max(
    1,
    ...yesLevels.map((l) => l.quantity),
    ...noLevels.map((l) => l.quantity),
  );
  const isEmpty = yesLevels.length === 0 && noLevels.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-1 items-center justify-center self-stretch">
        <p className="market-panel-label">No open asks yet</p>
      </div>
    );
  }

  return (
    <div className="orderbook">
      <div className="orderbook-header" role="row">
        <span>Price</span>
        <span>Qty at Yes</span>
        <span>Price</span>
        <span>Qty at No</span>
      </div>
      <div className="orderbook-rows">
        {Array.from({ length: rowCount }, (_, i) => {
          const yes = yesLevels[i];
          const no = noLevels[i];
          return (
            <div key={i} className="orderbook-row" role="row">
              <PriceCell level={yes} side="yes" />
              <DepthCell level={yes} maxQty={maxQty} side="yes" />
              <PriceCell level={no} side="no" />
              <DepthCell level={no} maxQty={maxQty} side="no" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
