import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { authClient } from "./auth-client";
import { type signup } from "@repo/types/signup"
import { type signin } from "@repo/types/signin"
import type { MarketStatus, CreateMarketInput, Market, MintInput, UpdateMarketStatusInput } from "@repo/types/market"
import type { Balance, GetStockBalanceRes, OnRampInr } from "@repo/types/balance"
import type { GetOrderbookRes, GetTradesRes, PlaceOrderRes } from "@repo/types/engine"
import type { GetUserOrdersRes, Order, OrderStatus, PlaceOrderInput } from "@repo/types/order"

import axios from "axios"
import { router } from "@/main";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const googleAuth = async () => {
    const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
        errorCallbackURL: window.location.href,
        // newUserCallbackURL: "/welcome",
        // disableRedirect: true,
    });
    return response
}


export const signUp = async ({ email, password, name, image, role }: signup) => {
    const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        image,
        role,
        //used when email verification is required.
        // callbackURL: "/"
    })
    return { data, error }
}

export const signIn = async ({ email, password }: signin) => {
    const { data, error } = await authClient.signIn.email({
        email,
        password
    })

    return { data, error }
}

export const signOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                router.navigate("/login"); // redirect to login page
            },
        },
    });
}

export const uploadToS3 = async (file: File) => {
    console.log("backend url", import.meta.env.VITE_BACKEND_BASE_URL)
    const {
        data: { uploadUrl, publicUrl },
    } = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/pfp/get-url`, {
        fileType: file.type,
        fileName: file.name
    })

    await axios.put(uploadUrl, file, {
        headers: {
            "Content-Type": file.type
        }
    })
    return publicUrl
}


export const fetchCategories = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/categories`, {
        withCredentials: true
    })
    return data.categories
}

export const createCategory = async (name: string) => {
    const api_response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/categories/create`, { name }, { withCredentials: true })
    return api_response
}

export const fetchMarkets = async (status: MarketStatus | null, categoryIds: string[] = []): Promise<Market[]> => {
    const api_response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/markets`, {
        // axios omits params with undefined values, so no key is sent when a filter is off
        params: {
            status: status ?? undefined,
            categoryIds: categoryIds.length ? categoryIds.join(",") : undefined
        },
        withCredentials: true
    })
    return api_response.data.data
}


export const createMarket = async (payload: CreateMarketInput) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/markets/create`,
        // datetime-local gives "YYYY-MM-DDTHH:mm"; normalize to ISO for the server
        { ...payload, endsAt: new Date(payload.endsAt).toISOString() },
        { withCredentials: true }
    )
    return data
}

export const fetchMarket = async (marketId: string): Promise<Market> => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/markets/${marketId}`,
        { withCredentials: true }
    )
    return data.data
}

export const formatMarketEndsAt = (endsAt: string | Date) =>
    new Date(endsAt).toLocaleString()

export const formatInr = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`

export const fetchInrBalance = async (): Promise<Balance> => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/balance`,
        { withCredentials: true }
    )
    return data.data
}

export const onRampInr = async (payload: OnRampInr): Promise<Balance> => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/balance/webhook`,
        payload,
        { withCredentials: true }
    )
    return data.data
}

/** ₹10 per Yes+No pair — matches api-server mint cost. */
export const MINT_COST_PER_PAIR_INR = 10

export const mintMarket = async (payload: MintInput) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/markets/mint`,
        payload,
        { withCredentials: true }
    )
    return data.data
}

export const updateMarketStatus = async (
    marketId: string,
    payload: UpdateMarketStatusInput,
): Promise<Market> => {
    const { data } = await axios.patch(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/markets/${marketId}/status`,
        payload,
        { withCredentials: true },
    )
    return data.data
}

export const fetchOrderbook = async (marketId: string): Promise<GetOrderbookRes> => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/orders`,
        {
            params: { marketId },
            withCredentials: true,
        },
    )
    return data.data
}

export const fetchTrades = async (marketId: string): Promise<GetTradesRes> => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/orders/trades`,
        {
            params: { marketId },
            withCredentials: true,
        },
    )
    return data.data
}

export const fetchStockBalance = async (marketId: string): Promise<GetStockBalanceRes> => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/balance/stock`,
        {
            params: { marketId },
            withCredentials: true,
        },
    )
    return data.data
}

/** Settlement payout per winning share — matches mint pair cost. */
export const SHARE_PAYOUT_INR = 10

export type PlaceOrderApiRes = {
    type: "place_order"
    message: string
    userId: string
    data: PlaceOrderRes
}

export const placeOrder = async (payload: PlaceOrderInput): Promise<PlaceOrderApiRes> => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/orders/place-order`,
        payload,
        { withCredentials: true },
    )
    return data
}

export const fetchUserOrders = async (
    marketId: string,
    status?: OrderStatus,
): Promise<GetUserOrdersRes> => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/orders/user`,
        {
            params: { marketId, ...(status && { status }) },
            withCredentials: true,
        },
    )
    return data.data
}

/** Merge engine order updates into a cached user-orders list, respecting status filter. */
export const mergeUserOrders = (
    cached: Order[] | undefined,
    updates: Order[],
    statusFilter?: string,
) => {
    const byId = new Map((cached ?? []).map((order) => [order.id, order]))

    for (const order of updates) {
        const matches =
            !statusFilter || statusFilter === "ALL" || order.status === statusFilter
        if (matches) byId.set(order.id, { ...byId.get(order.id), ...order })
        else byId.delete(order.id)
    }

    return [...byId.values()].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
}