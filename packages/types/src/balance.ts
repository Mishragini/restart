import z from "zod";

export const onRampInrSchema = z.object({
    amount: z
        .number()
        .positive("Amount must be greater than 0")
        .min(0.01, "Amount must be at least ₹0.01")
        .refine(
            (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-8,
            "Amount can have at most 2 decimal places",
        ),
});

export type OnRampInr = z.infer<typeof onRampInrSchema>;

export type InrBalance = {
    available: number;
    locked: number;
};
