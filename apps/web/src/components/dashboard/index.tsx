import { keepPreviousData, useQuery } from "@tanstack/react-query";
import empty from "../../assets/empty.svg";
import error from "../../assets/error.svg";

import { CreateMarketDialog } from "./createMarketDialog";
import { useState } from "react";
import { fetchMarkets } from "@/lib/utils";
import { MarketStatus } from "@repo/types/market";
import { LoadingDots } from "../loaders";
import { MarketFilters } from "./marketFilters";
import { MarketCard } from "./MarketCard";

const Dashboard = () => {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const {
    data: markets,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["markets", status, categoryIds],
    queryFn: () => fetchMarkets(status, categoryIds),
    // Keeps the current list (and the filters) on screen while refetching
    placeholderData: keepPreviousData,
  });
  if (isPending) {
    return (
      <div className="screen-center">
        <LoadingDots />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="screen-center flex-col gap-10">
        <img src={error} className="h-50 w-50 sm:w-100 sm:h-100" />
        <p className="heading">Failed to fetch Markets.</p>
      </div>
    );
  }
  return (
    <div className="w-full h-full p-4">
      <div className="w-full flex items-center justify-end p-4 gap-8">
        <MarketFilters
          status={status}
          setStatus={setStatus}
          categoryIds={categoryIds}
          setCategoryIds={setCategoryIds}
        />
        <CreateMarketDialog />
      </div>

      {markets?.length === 0 ? (
        <div className="screen-center flex-col gap-10">
          <img src={empty} className="h-50 w-50 sm:w-100 sm:h-100" />
          <p className="heading">
            No {status ? status.toLowerCase() : ""} markets yet
          </p>
          {status === null ||
            (status === MarketStatus.ACTIVE && (
              <CreateMarketDialog triggerClassName="min-w-md text-xl font-semibold py-6! sm:py-8!" />
            ))}
        </div>
      ) : (
        <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {markets?.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
