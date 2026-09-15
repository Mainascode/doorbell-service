import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
export const SESSION_COOKIE = "nitume_session";
export const jsonError = (message, status = 400) => Response.json({ error: message }, { status });
const hash = (value) => createHash("sha256").update(value).digest("hex");
export async function currentUser() {
    var _a;
    const token = (_a = (await cookies()).get(SESSION_COOKIE)) === null || _a === void 0 ? void 0 : _a.value;
    if (!token)
        return null;
    const session = await db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
    if (!session || session.expiresAt < new Date())
        return null;
    return session.user;
}
export async function requireUser() { const user = await currentUser(); return user; }
export async function requireAdmin() { const user = await currentUser(); return (user === null || user === void 0 ? void 0 : user.role) === "ADMIN" ? user : null; }
export async function createSession(userId) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
    await db.session.create({ data: { userId, tokenHash: hash(token), expiresAt } });
    (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}
export async function deleteSession() {
    var _a;
    const token = (_a = (await cookies()).get(SESSION_COOKIE)) === null || _a === void 0 ? void 0 : _a.value;
    if (token)
        await db.session.deleteMany({ where: { tokenHash: hash(token) } });
    (await cookies()).delete(SESSION_COOKIE);
}
export function availability(settings) {
    const hour = new Date().getHours();
    const withinHours = hour >= 8 && hour < 21;
    return { acceptingRequests: settings.acceptingRequests, weatherMode: settings.weatherMode, operatingStart: settings.operatingStart, operatingEnd: settings.operatingEnd, available: settings.acceptingRequests && withinHours, reason: !settings.acceptingRequests ? "The operator is not taking requests right now." : !withinHours ? "NITUME accepts requests between 8:00 AM and 9:00 PM." : null };
}
export async function currentPrice() {
    const settings = await db.operatorSettings.findFirst();
    if (!settings)
        throw new Error("Operator settings have not been configured.");
    const service = availability(settings);
    const hour = new Date().getHours();
    const snapshot = settings.weatherMode === "RAIN" ? { mode: "RAIN", rule: "RAIN", fee: 200 } : hour < 18 ? { mode: "NORMAL", rule: "DAYTIME", fee: 100 } : { mode: "NORMAL", rule: "EVENING", fee: 150 };
    return Object.assign(Object.assign({}, service), snapshot);
}
export const allowedTransitions = { REQUESTED: ["ACCEPTED", "REJECTED"], ACCEPTED: ["SHOPPING"], SHOPPING: ["ON_THE_WAY"], ON_THE_WAY: ["DELIVERED"], DELIVERED: ["COMPLETED"], COMPLETED: [], REJECTED: [], CANCELLED: [] };
export function serializeOrder(order) { var _a, _b, _c, _d, _e, _f; return Object.assign(Object.assign({}, order), { createdAt: (_a = order.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(), acceptedAt: (_c = (_b = order.acceptedAt) === null || _b === void 0 ? void 0 : _b.toISOString()) !== null && _c !== void 0 ? _c : null, completedAt: (_e = (_d = order.completedAt) === null || _d === void 0 ? void 0 : _d.toISOString()) !== null && _e !== void 0 ? _e : null, updatedAt: (_f = order.updatedAt) === null || _f === void 0 ? void 0 : _f.toISOString(), pricingSnapshot: order.pricingSnapshot }); }
