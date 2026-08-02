import z from "zod";

const signupSchema = z.object({
    email: z.email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain uppercase characters")
        .regex(/[0-9]/, "Must contain a number"),
    name: z.string().min(2, "Must be at least 2 characters"),
    image: z.string().optional(),
    role: z.enum(["USER", "ADMIN"], { message: "Select a role" })
})

type signup = z.infer<typeof signupSchema>

export { signupSchema, type signup }