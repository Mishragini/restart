import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetOrderbookRes,
  GetTradesRes,
  MarketUpdateMessage,
} from "@repo/types/engine";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/loaders";
import { cn, fetchOrderbook, fetchTrades } from "@/lib/utils";
import { OrderbookGraph } from "./OrderbookGraph";
import { TradesList } from "./TradesList";

const WS_URL = import.meta.env.VITE_WS_URL;

type PanelView = "orderbook" | "trades";

const VIEWS: { id: PanelView; label: string }[] = [
  { id: "orderbook", label: "Orderbook" },
  { id: "trades", label: "Trades" },
];

export const MarketPanel = ({ marketId }: { marketId: string }) => {
  const [view, setView] = useState<PanelView>("orderbook");
  const queryClient = useQueryClient();
  const {
    data: book,
    isPending: bookPending,
    isError: bookError,
  } = useQuery({
    queryKey: ["orderbook", marketId],
    queryFn: () => fetchOrderbook(marketId),
    enabled: view === "orderbook" && Boolean(marketId),
  });

  const {
    data: tradesData,
    isPending: tradesPending,
    isError: tradesError,
  } = useQuery({
    queryKey: ["trades", marketId],
    queryFn: () => fetchTrades(marketId),
    enabled: view === "trades" && Boolean(marketId),
  });

  const isPending = view === "orderbook" ? bookPending : tradesPending;
  const isError = view === "orderbook" ? bookError : tradesError;
  const hasContent = view === "orderbook" ? Boolean(book) : Boolean(tradesData);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/markets/${marketId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as MarketUpdateMessage;
      if (data.type !== "market_update" || data.marketId !== marketId) return;

      // Engine already sends rupees on WS; match GetOrderbookRes shape
      queryClient.setQueryData<GetOrderbookRes>(["orderbook", marketId], {
        marketId,
        YES: data.orderbook.YES,
        NO: data.orderbook.NO,
      });

      // market_update only carries fills from this order — merge, don't replace
      queryClient.setQueryData<GetTradesRes>(["trades", marketId], (prev) => {
        if (!prev) return { marketId, trades: data.trades };
        const seen = new Set(prev.trades.map((t) => t.id));
        const fresh = data.trades.filter((t) => !seen.has(t.id));
        return { marketId, trades: [...fresh, ...prev.trades] };
      });
    };
    return () => {
      ws.close();
    };
  }, [marketId, queryClient]);

  return (
    <section
      className="market-panel market-panel-fixed"
      aria-label="Orderbook and trades"
    >
      <div className="market-panel-header">
        <h2 className="market-panel-title">
          {view === "orderbook" ? "Orderbook" : "Trades"}
        </h2>
        <div
          className="market-view-toggle"
          role="group"
          aria-label="Panel view"
        >
          {VIEWS.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              variant="outline"
              size="sm"
              data-active={view === id || undefined}
              aria-pressed={view === id}
              className={cn(
                "amount-preset px-3",
                view === id && "amount-preset-active",
              )}
              onClick={() => setView(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "market-panel-body",
          hasContent && !isPending && !isError && "market-panel-body-fill",
        )}
      >
        {isPending ? (
          <LoadingDots />
        ) : isError ? (
          <p className="market-panel-label">
            {view === "orderbook"
              ? "Failed to load orderbook"
              : "Failed to load trades"}
          </p>
        ) : view === "orderbook" && book ? (
          <OrderbookGraph book={book} />
        ) : view === "trades" && tradesData ? (
          <TradesList trades={tradesData.trades} />
        ) : null}
      </div>
    </section>
  );
};
