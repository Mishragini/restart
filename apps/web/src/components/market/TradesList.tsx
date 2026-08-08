import type { GetTradesRes, Trade } from "@repo/types/engine";
import { cn, formatInr } from "@/lib/utils";

const TradeRow = ({ trade }: { trade: Trade }) => (
  <div className="trades-row" role="row">
    <span className={cn(trade.side === "YES" ? "text-mint" : "text-peach")}>
      {trade.side === "YES" ? "Yes" : "No"}
    </span>
    <span className="tabular-nums">{formatInr(trade.price)}</span>
    <span className="tabular-nums">{trade.quantity.toLocaleString("en-IN")}</span>
  </div>
);

export const TradesList = ({ trades }: { trades: GetTradesRes["trades"] }) => {
  if (trades.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center self-stretch">
        <p className="market-panel-label">No trades yet</p>
      </div>
    );
  }

  return (
    <div className="trades">
      <div className="trades-header" role="row">
        <span>Side</span>
        <span>Price</span>
        <span>Qty</span>
      </div>
      <div className="trades-list">
        {trades.map((trade) => (
          <TradeRow key={trade.id} trade={trade} />
        ))}
      </div>
    </div>
  );
};
