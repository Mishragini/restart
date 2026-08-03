import { Dispatch } from "react";
import { MarketStatus } from "@repo/types/market";
import { CheckIcon, FilterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CategoryCombobox } from "./categoryCombobox";
import { cn } from "@/lib/utils";

interface MarketFiltersProps {
  status: MarketStatus | null;
  setStatus: Dispatch<React.SetStateAction<MarketStatus | null>>;
  categoryIds: string[];
  setCategoryIds: (ids: string[]) => void;
}

const statusItems: { label: string; value: MarketStatus | null }[] = [
  { label: "All", value: null },
  { label: "Active", value: MarketStatus.ACTIVE },
  { label: "Closed", value: MarketStatus.CLOSED },
  { label: "Resolved", value: MarketStatus.RESOLVED },
  { label: "Cancelled", value: MarketStatus.CANCELLED },
];

export const MarketFilters = ({
  status,
  setStatus,
  categoryIds,
  setCategoryIds,
}: MarketFiltersProps) => {
  const activeCount = (status ? 1 : 0) + categoryIds.length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline">
            <FilterIcon />
            Filters
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />
      {/* keepMounted preserves the category selection state across open/close */}
      <PopoverContent keepMounted align="end" className="w-64 p-0">
        <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
          Status
        </p>
        <div className="max-h-32 overflow-y-auto overscroll-contain p-1 pt-0">
          {statusItems.map((item) => (
            <Button
              variant="ghost"
              key={item.label}
              type="button"
              onClick={() => setStatus(item.value)}
              className={cn(
                "relative flex w-full cursor-default justify-start -start gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground",
                status === item.value && "font-medium",
              )}
            >
              {item.label}
              {status === item.value && (
                <CheckIcon className="pointer-events-none absolute right-2 size-4" />
              )}
            </Button>
          ))}
        </div>

        <Separator />

        <CategoryCombobox
          inline
          allowCreate={false}
          placeholder="Select categories"
          onSelectionChange={setCategoryIds}
        />
      </PopoverContent>
    </Popover>
  );
};
