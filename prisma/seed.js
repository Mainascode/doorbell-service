import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
    var _a;
    const passwordHash = await bcrypt.hash((_a = process.env.SEED_PASSWORD) !== null && _a !== void 0 ? _a : "change-me-before-launch", 12);
    await db.user.upsert({ where: { phone: "+254712345678" }, update: {}, create: { name: "Amina Mwangi", phone: "+254712345678", passwordHash, role: "CUSTOMER", profile: { create: { defaultLocation: "Gathigi Estate, Gate B" } } } });
    await db.user.upsert({ where: { phone: "+254700000000" }, update: {}, create: { name: "Alex Operator", phone: "+254700000000", passwordHash, role: "ADMIN" } });
    if (!await db.operatorSettings.findFirst())
        await db.operatorSettings.create({ data: {} });
    for (const rule of [{ name: "DAYTIME", startTime: "08:00", endTime: "17:59", price: 100 }, { name: "EVENING", startTime: "18:00", endTime: "20:59", price: 150 }, { name: "RAIN", startTime: "00:00", endTime: "23:59", price: 200 }])
        await db.pricingRule.upsert({ where: { name: rule.name }, update: rule, create: rule });
}
main().finally(() => db.$disconnect());
