import { createHash, randomBytes } from "crypto";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "nitume_session";
export type CurrentUser = { id: string; name: string; phone: string; role: "CUSTOMER" | "ADMIN" };
export const jsonError = (message: string, status = 400) => Response.json({ error: message }, { status });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function currentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
export async function requireUser() { const user = await currentUser(); return user; }
export async function requireAdmin() { const user = await currentUser(); return user?.role === "ADMIN" ? user : null; }
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await db.session.create({ data: { userId, tokenHash: hash(token), expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}
export async function deleteSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hash(token) } });
  (await cookies()).delete(SESSION_COOKIE);
}
export function availability(settings: { acceptingRequests: boolean; weatherMode: string; operatingStart: string; operatingEnd: string }) {
  const hour = new Date().getHours();
  const withinHours = hour >= 8 && hour < 21;
  return { acceptingRequests: settings.acceptingRequests, weatherMode: settings.weatherMode, operatingStart: settings.operatingStart, operatingEnd: settings.operatingEnd, available: settings.acceptingRequests && withinHours, reason: !settings.acceptingRequests ? "The operator is not taking requests right now." : !withinHours ? "NITUME accepts requests between 8:00 AM and 9:00 PM." : null };
}
export async function currentPrice() {
  const settings = await db.operatorSettings.findFirst();
  if (!settings) throw new Error("Operator settings have not been configured.");
  const service = availability(settings);
  const hour = new Date().getHours();
  const snapshot = settings.weatherMode === "RAIN" ? { mode: "RAIN", rule: "RAIN", fee: 200 } : hour < 18 ? { mode: "NORMAL", rule: "DAYTIME", fee: 100 } : { mode: "NORMAL", rule: "EVENING", fee: 150 };
  return { ...service, ...snapshot };
}
export const allowedTransitions: Record<string, string[]> = { REQUESTED: ["ACCEPTED", "REJECTED"], ACCEPTED: ["SHOPPING"], SHOPPING: ["ON_THE_WAY"], ON_THE_WAY: ["DELIVERED"], DELIVERED: ["COMPLETED"], COMPLETED: [], REJECTED: [], CANCELLED: [] };
export function serializeOrder(order: any) { return { ...order, createdAt: order.createdAt?.toISOString(), acceptedAt: order.acceptedAt?.toISOString() ?? null, completedAt: order.completedAt?.toISOString() ?? null, updatedAt: order.updatedAt?.toISOString(), pricingSnapshot: order.pricingSnapshot }; }
