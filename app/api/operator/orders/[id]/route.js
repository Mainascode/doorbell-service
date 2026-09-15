import { jsonError, requireAdmin, serializeOrder } from "@/lib/api";
import { db } from "@/lib/db";
export async function GET(_, context) { if (!await requireAdmin())
    return jsonError("Operator access required.", 403); const { id } = await context.params; const order = await db.order.findUnique({ where: { id }, include: { customer: true, items: true, payment: true } }); return order ? Response.json({ order: serializeOrder(order) }) : jsonError("Order not found.", 404); }
