import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { authClient } from "./auth-client";
import { type signup } from "@repo/types/signup"
import { type signin } from "@repo/types/signin"
import type { MarketStatus, CreateMarketInput, Market, MintInput, UpdateMarketStatusInput } from "@repo/types/market"
import type { Balance, OnRampInr } from "@repo/types/balance"

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

export const formatMarketEndsAt = (endsAt: string) =>
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