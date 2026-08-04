import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMarketEndsAt } from "@/lib/utils";
import { MarketStatus, type Market } from "@repo/types/market";
import { Role } from "@repo/types/user";
import { authClient } from "@/lib/auth-client";
import { MintDialog } from "./MintDialog";

export const MarketHeader = ({ market }: { market: Market }) => {
  const { data: session } = authClient.useSession();
  return (
    <header className="market-header">
      <div className="market-header-info">
        <h1 className="market-header-title">{market.title}</h1>
        {market.description && (
          <p className="market-header-description max-w-md lg:max-w-2xl">
            {market.description}
          </p>
        )}
        {market.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {market.categories.map((category) => (
              <span key={category.id} className="category-chip">
                {category.name}
              </span>
            ))}
          </div>
        )}
        <div className="market-header-meta-row">
          <a
            href={market.sourceOfTruth}
            target="_blank"
            rel="noopener noreferrer"
            className="market-header-source"
          >
            <span>Source of truth</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
          <p className="market-header-meta">
            Ends at {formatMarketEndsAt(market.endsAt)}
          </p>
          {market.status === MarketStatus.RESOLVED && market.outcome && (
            <p className="market-header-meta">
              Resolved: <span className="font-semibold text-foreground">{market.outcome}</span>
            </p>
          )}
        </div>
      </div>

      <div className="market-header-actions">
        {session?.user?.role === Role.ADMIN &&
          market.status === MarketStatus.ACTIVE && (
            <MintDialog marketId={market.id} />
          )}
        <StatusBadge
          status={market.status}
          marketId={market.id}
          editable={session?.user?.role === Role.ADMIN}
        />
      </div>
    </header>
  );
};
