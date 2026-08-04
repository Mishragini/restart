import z from "zod";
export const CreateMarketSchema = z.object({
    title: z.string().min(3, "Must be at least 3 characters long"),
    description: z.string().optional(),
    sourceOfTruth: z.url("Must be a valid URL"),
    categoryIds: z.array(z.string()).min(1, "Select at least one category"),
    endsAt: z.string()
        .min(1, "End date is required")
        .refine((val) => new Date(val).getTime() > Date.now(), "Must be a future date and time")
})

export const FetchMarketSchema = z.object({
    status: z.enum(["ACTIVE", "CLOSED", "RESOLVED", "CANCELLED"]).optional(),
    // Sent as a comma-separated query param, e.g. ?categoryIds=id1,id2
    categoryIds: z.string()
        .optional()
        .transform((val) => val ? val.split(",") : undefined)
})

export type CreateMarketInput = z.infer<typeof CreateMarketSchema>
export type FetchMarketInput = z.infer<typeof FetchMarketSchema>

export enum MarketStatus {
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED"
}

export enum Side {
    Yes = "Yes",
    No = "No",
}

export const MARKET_STATUSES = [
    MarketStatus.ACTIVE,
    MarketStatus.CLOSED,
    MarketStatus.RESOLVED,
    MarketStatus.CANCELLED,
] as const

/** Final statuses — no further admin status changes. */
export const TERMINAL_MARKET_STATUSES: readonly MarketStatus[] = [
    MarketStatus.RESOLVED,
    MarketStatus.CANCELLED,
]

export const isTerminalMarketStatus = (status: MarketStatus) =>
    TERMINAL_MARKET_STATUSES.includes(status)

export const UpdateMarketStatusSchema = z
    .object({
        status: z.enum(["ACTIVE", "CLOSED", "RESOLVED", "CANCELLED"]),
        outcome: z.enum(["Yes", "No"]).optional().nullable(),
    })
    .superRefine((data, ctx) => {
        if (data.status === MarketStatus.RESOLVED && data.outcome == null) {
            ctx.addIssue({
                code: "custom",
                message: "Outcome is required when resolving a market",
                path: ["outcome"],
            })
        }
        if (data.status !== MarketStatus.RESOLVED && data.outcome != null) {
            ctx.addIssue({
                code: "custom",
                message: "Outcome can only be set when status is RESOLVED",
                path: ["outcome"],
            })
        }
    })

export type UpdateMarketStatusInput = z.infer<typeof UpdateMarketStatusSchema>

// Market as returned by the API (dates are serialized to ISO strings)
export type Market = {
    id: string
    title: string
    description: string | null
    sourceOfTruth: string
    status: MarketStatus
    outcome: Side | null
    categories: { id: string; name: string }[]
    endsAt: string
    createdById: string
    createdAt: string
    updatedAt: string
}


export const MintSchema = z.object({
    amount: z.int("Must be an integer").min(1, "Must be at least one."),
    marketId: z.string().min(1, "Market ID is required")
})

export type MintInput = z.infer<typeof MintSchema>
