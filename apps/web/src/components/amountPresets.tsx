import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AmountPresetsProps<T extends number> = {
  amounts: readonly T[]
  value: number
  onSelect: (amount: T) => void
  formatLabel?: (amount: T) => React.ReactNode
  className?: string
}

function AmountPresets<T extends number>({
  amounts,
  value,
  onSelect,
  formatLabel = (amount) => amount,
  className,
}: AmountPresetsProps<T>) {
  return (
    <div data-slot="amount-presets" className={cn("amount-presets", className)}>
      {amounts.map((amount) => (
        <Button
          key={amount}
          type="button"
          variant="outline"
          data-active={value === amount || undefined}
          className={cn(
            "amount-preset",
            value === amount && "amount-preset-active",
          )}
          onClick={() => onSelect(amount)}
        >
          {formatLabel(amount)}
        </Button>
      ))}
    </div>
  )
}

export { AmountPresets }
