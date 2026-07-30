import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { authClient } from "./auth-client";
import { type signup } from "@repo/types/signup"
import { type signin } from "@repo/types/signin"

import axios from "axios"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const googleAuth = async () => {
    const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
        errorCallbackURL: "/signup",
        // newUserCallbackURL: "/welcome",
        // disableRedirect: true,
    });
    return response
}


export const signUp = async ({ email, password, name, image }: signup) => {
    const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        image,
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

export const uploadToS3 = async (file: File) => {
    console.log("backend url", import.meta.env.VITE_BACKEND_BASE_URL)
    const {
        data: { uploadUrl, publicUrl },
    } = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/pfp/get-url`, {
        fileType: file.type,
        fileName: file.name
    })

    await axios.put(uploadUrl, {
        file,
        headers: {
            "Content-Type": file.type
        }

    })
    return publicUrl
}