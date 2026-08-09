import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { Role } from "@repo/types/user"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    plugins: [
        // Must mirror the `user.additionalFields` config on the server (auth.ts)
        inferAdditionalFields({
            user: {
                role: {
                    type: [Role.USER, Role.ADMIN],
                    required: true,
                    defaultValue: Role.USER,
                    input: true
                }
            }
        })
    ]
})