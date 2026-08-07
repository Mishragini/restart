import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/loaders";
import { cn, fetchOrderbook } from "@/lib/utils";
import { OrderbookGraph } from "./OrderbookGraph";

type PanelView = "orderbook" | "trades";

const VIEWS: { id: PanelView; label: string }[] = [
  { id: "orderbook", label: "Orderbook" },
  { id: "trades", label: "Trades" },
];

export const MarketPanel = ({ marketId }: { marketId: string }) => {
  const [view, setView] = useState<PanelView>("orderbook");

  const {
    data: book,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["orderbook", marketId],
    queryFn: () => fetchOrderbook(marketId),
    enabled: view === "orderbook" && Boolean(marketId),
  });

  return (
    <section className="market-panel" aria-label="Orderbook and trades">
      <div className="market-panel-header">
        <h2 className="market-panel-title">
          {view === "orderbook" ? "Orderbook" : "Trades"}
        </h2>
        <div className="market-view-toggle" role="group" aria-label="Panel view">
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
          view === "orderbook" && book && "market-panel-body-fill",
        )}
      >
        {view === "trades" ? null : isPending ? (
          <LoadingDots />
        ) : isError || !book ? (
          <p className="market-panel-label">Failed to load orderbook</p>
        ) : (
          <OrderbookGraph book={book} />
        )}
      </div>
    </section>
  );
};
