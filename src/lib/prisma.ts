import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma/client";

type GlobalWithPrisma = typeof globalThis & {
    prisma?: PrismaClient;
    prismaPool?: Pool;
};

const globalWithPrisma = globalThis as GlobalWithPrisma;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "DATABASE_URL is not set. Create a .env file in the project root and add a Postgres connection string, for example: DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/potatocontra?schema=public\""
    );
}

const pool =
    globalWithPrisma.prismaPool ??
    new Pool({
        connectionString,
    });

const prisma =
    globalWithPrisma.prisma ??
    new PrismaClient({
        adapter: new PrismaPg(pool),
    });

if (process.env.NODE_ENV !== "production") {
    globalWithPrisma.prismaPool = pool;
    globalWithPrisma.prisma = prisma;
}

export default prisma;
