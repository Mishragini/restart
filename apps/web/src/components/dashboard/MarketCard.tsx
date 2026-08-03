import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarketStatus, type Market } from "@repo/types/market";

export const MarketCard = ({ market }: { market: Market }) => {
  const isActive = market.status === MarketStatus.ACTIVE;

  return (
    <Link
      to={`/market/${market.id}`}
      className="group block h-full focus-visible:outline-none"
    >
      <Card
        className={cn(
          "market-card",
          isActive ? "market-card-mint" : "market-card-peach"
        )}
      >
        <CardHeader>
          <CardTitle>{market.title}</CardTitle>
          {market.description && (
            <CardDescription>{market.description}</CardDescription>
          )}
          <CardAction>
            <span
              className={cn(
                "status-badge",
                isActive ? "text-mint" : "text-peach"
              )}
            >
              {market.status}
            </span>
          </CardAction>
        </CardHeader>
        {market.categories.length > 0 && (
          <CardContent className="flex flex-wrap gap-2">
            {market.categories.map((category) => (
              <span key={category.id} className="category-chip">
                {category.name}
              </span>
            ))}
          </CardContent>
        )}
        <CardFooter className="market-card-footer">
          <span>Ends {new Date(market.endsAt).toLocaleString()}</span>
          <span
            className={cn(
              "market-card-cta",
              isActive ? "text-mint" : "text-peach"
            )}
          >
            View market
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};
