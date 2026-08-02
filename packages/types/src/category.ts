import z from "zod";

export const CategorySchema = z.object({
    name: z.string().min(3, "Must be at least 3 characters")
})

export type category = z.infer<typeof CategorySchema>