import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import error from "../../assets/error.svg";
import { fetchMarket } from "@/lib/utils";
import { LoadingDots } from "../loaders";
import { MarketHeader } from "./MarketHeader";
import { MarketPanel } from "./MarketPanel";
import { OrderHistoryCard } from "./OrderHistoryCard";
import { PlaceOrderCard } from "./PlaceOrderCard";

export default function MarketPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const {
    data: market,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["market", marketId],
    queryFn: () => fetchMarket(marketId!),
    enabled: Boolean(marketId),
  });

  if (isPending) {
    return (
      <div className="screen-center">
        <LoadingDots />
      </div>
    );
  }

  if (isError || !market) {
    return (
      <div className="screen-center flex-col gap-10">
        <img src={error} className="h-50 w-50 sm:w-100 sm:h-100" />
        <p className="heading">Failed to fetch market.</p>
      </div>
    );
  }

  return (
    <div className="market-page">
      <MarketHeader market={market} />
      <div className="market-grid">
        <MarketPanel marketId={market.id} />
        <PlaceOrderCard marketId={market.id} status={market.status} />
      </div>
      <OrderHistoryCard marketId={market.id} />
    </div>
  );
}
