import z from "zod";
// id String @id @default (uuid())
// 	title String
// 	description String
// 	sourceOfTruth String
// 	status MarketStatus @default (ACTIVE)
// 	categories Category[]
// 	endAt DateTime @db.Timestamptz(3)
export const MarketSchema = z.object({
    title: z.string().min(3, "Must be at least 3 characters long"),
    description: z.string().optional(),
    sourceOfTruth: z.url("Must be a valid URL"),
    categoryIds: z.array(z.string()).min(1, "Select at least one category"),
    endsAt: z.string().min(1, "End date is required")
})


export type market = z.infer<typeof MarketSchema>