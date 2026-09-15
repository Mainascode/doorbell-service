import { jsonError, requireUser, serializeOrder } from "@/lib/api";
import { db } from "@/lib/db";
export async function GET(_, context) { const user = await requireUser(); if (!user)
    return jsonError("Authentication required.", 401); const { id } = await context.params; const order = await db.order.findFirst({ where: { id, customerId: user.id }, include: { items: true, payment: true } }); return order ? Response.json({ order: serializeOrder(order) }) : jsonError("Order not found.", 404); }
