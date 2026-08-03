import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { authClient } from "./auth-client";
import { type signup } from "@repo/types/signup"
import { type signin } from "@repo/types/signin"
import { type market } from "@repo/types/market"

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


export const createMarket = async (payload: market) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/markets/create`,
        // datetime-local gives "YYYY-MM-DDTHH:mm"; normalize to ISO for the server
        { ...payload, endsAt: new Date(payload.endsAt).toISOString() },
        { withCredentials: true }
    )
    return data
}

export const createCategory = async (name: string) => {
    const api_response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/categories/create`, { name }, { withCredentials: true })
    return api_response
}