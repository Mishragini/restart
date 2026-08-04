export enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}

export type User = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    role: Role;
}