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

// Market as returned by the API (dates are serialized to ISO strings)
export type Market = {
    id: string
    title: string
    description: string | null
    sourceOfTruth: string
    status: MarketStatus
    categories: { id: string; name: string }[]
    endsAt: string
    createdById: string
    createdAt: string
    updatedAt: string
}