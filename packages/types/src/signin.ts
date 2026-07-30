import z from "zod";

const signInSchema = z.object({
    email: z.email("Invalid email address"),
    password: z
        .string()
        .min(8, "Must be least 8 characters.")
        .regex(/[A-Z]/, "Must have at least one uppercase character")
        .regex(/[0-9]/, "Must contain at least one numeric value")
})

type signin = z.infer<typeof signInSchema>

export { signInSchema, type signin }