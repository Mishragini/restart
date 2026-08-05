import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma, Role } from "@repo/db"
import { FRONTEND_BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";

export const auth = betterAuth({
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