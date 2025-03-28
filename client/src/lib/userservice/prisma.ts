import { PrismaClient } from "@prisma/client";

const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// TODO: 為啥要全局設定？？是不同的環境嗎？ 啊可能是因為Node和bun runtime的緣故？

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? client;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
