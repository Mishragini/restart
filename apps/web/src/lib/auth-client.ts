import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3000",
    plugins: [
        // Must mirror the `user.additionalFields` config on the server (auth.ts)
        inferAdditionalFields({
            user: {
                role: {
                    type: "string",
                    required: true,
                    defaultValue: "USER",
                    input: true
                }
            }
        })
    ]
})