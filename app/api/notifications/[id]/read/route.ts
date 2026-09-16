import { jsonError, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
export async function PATCH(_: Request, context: { params: Promise<{ id: string }> }) { const user = await requireUser(); if (!user) return jsonError("Authentication required.", 401); const { id } = await context.params; const notification = await db.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } }); return notification.count ? Response.json({ ok: true }) : jsonError("Notification not found.", 404); }
