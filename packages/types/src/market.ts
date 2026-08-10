import z from "zod";
import {
    MARKET_DESCRIPTION_MAX,
    MARKET_TITLE_MAX,
    MINT_MAX_AMOUNT,
} from "./limits";

export const CreateMarketSchema = z.object({
    title: z
        .string()
        .min(3, "Must be at least 3 characters long")
        .max(MARKET_TITLE_MAX, `Title must be at most ${MARKET_TITLE_MAX} characters`),
    description: z
        .string()
        .max(MARKET_DESCRIPTION_MAX, `Description must be at most ${MARKET_DESCRIPTION_MAX} characters`)
        .optional(),
    sourceOfTruth: z.url("Must be a valid URL"),
    categoryIds: z.array(z.string()).min(1, "Select at least one category").max(20),
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

export const Side = {
    YES: "YES",
    NO: "NO",
} as const
export type Side = (typeof Side)[keyof typeof Side]

export const MARKET_STATUSES = [
    MarketStatus.ACTIVE,
    MarketStatus.CLOSED,
    MarketStatus.RESOLVED,
    MarketStatus.CANCELLED,
] as const

export const isTerminalMarketStatus = (status: MarketStatus) =>
    status === MarketStatus.RESOLVED || status === MarketStatus.CANCELLED

export const UpdateMarketStatusSchema = z
    .object({
        status: z.enum(MarketStatus),
        outcome: z.enum(Side).optional().nullable(),
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

export type Market = {
    id: string
    title: string
    description: string | null
    sourceOfTruth: string
    status: MarketStatus
    outcome: Side | null
    endsAt: Date | string
    categories: { id: string; name: string }[]
}


export const MintSchema = z.object({
    amount: z
        .int("Must be an integer")
        .min(1, "Must be at least one.")
        .max(MINT_MAX_AMOUNT, `Amount must be at most ${MINT_MAX_AMOUNT}`),
    marketId: z.string().min(1, "Market ID is required")
})

export type MintInput = z.infer<typeof MintSchema>
