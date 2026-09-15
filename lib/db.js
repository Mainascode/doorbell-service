var _a;
import { PrismaClient } from "@prisma/client";
const prismaGlobal = globalThis;
export const db = (_a = prismaGlobal.prisma) !== null && _a !== void 0 ? _a : new PrismaClient();
if (process.env.NODE_ENV !== "production")
    prismaGlobal.prisma = db;
