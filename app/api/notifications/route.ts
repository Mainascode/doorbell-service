import { jsonError, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
export async function GET() { const user = await requireUser(); if (!user) return jsonError("Authentication required.", 401); return Response.json({ notifications: await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }) }); }
