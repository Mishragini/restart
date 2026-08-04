import { cn } from "@/lib/utils"

function BalanceSummary({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="balance-summary"
      className={cn("balance-summary", className)}
      {...props}
    />
  )
}

function BalanceSummaryRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="balance-summary-row"
      className={cn("balance-summary-row", className)}
      {...props}
    />
  )
}

function BalanceSummaryLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="balance-summary-label"
      className={cn("balance-summary-label", className)}
      {...props}
    />
  )
}

function BalanceSummaryValue({
  className,
  tone = "mint",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "mint" | "peach"
}) {
  return (
    <span
      data-slot="balance-summary-value"
      data-tone={tone}
      className={cn(
        tone === "mint" ? "balance-summary-value" : "balance-summary-locked",
        className,
      )}
      {...props}
    />
  )
}

export {
  BalanceSummary,
  BalanceSummaryRow,
  BalanceSummaryLabel,
  BalanceSummaryValue,
}
