import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma, Role } from "@repo/db"
import { BETTER_AUTH_URL, FRONTEND_BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config";

const useSecureCrossSiteCookies = BETTER_AUTH_URL.startsWith("https://")

export const auth = betterAuth({
    baseURL: BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true
    },
    account: {
        accountLinking: {
            enabled: true,
            requireLocalEmailVerified: false,
        },
        // Frontend (Vercel) and API (grab-pic.app) are different sites, so the
        // OAuth state cookie set on the cross-origin sign-in request is often
        // blocked and missing on Google's callback → state_mismatch.
        storeStateStrategy: "database",
        skipStateCookieCheck: true,
    },
    // Cross-origin HTTPS needs SameSite=None; Secure so browsers store/send
    // auth cookies. Keep Lax on local HTTP.
    advanced: {
        defaultCookieAttributes: useSecureCrossSiteCookies
            ? { sameSite: "none" as const, secure: true }
            : { sameSite: "lax" as const },
    },
    user: {
        additionalFields: {
            role: {
                type: [Role.USER, Role.ADMIN],
                required: true,
                defaultValue: Role.USER,
                input: true
            }
        }
    },
    socialProviders: {
        google: {
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET
        }
    },
    trustedOrigins: [FRONTEND_BASE_URL],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.inrBalance.create({
                        data: {
                            user: {
                                connect: { id: user.id }
                            }
                        }
                    })
                }
            }
        }
    }
});
