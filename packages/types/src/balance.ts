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

export type Balance = {
    available: number;
    locked: number;
};

export const getStockBalanceSchema = z.object({
    marketId: z.string().min(1, "MarketId is required."),
});

export type GetStockBalanceInput = z.infer<typeof getStockBalanceSchema>;

export type GetStockBalanceRes = {
    marketId: string;
    YES: Balance;
    NO: Balance;
};
