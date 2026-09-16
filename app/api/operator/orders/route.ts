import { jsonError, requireAdmin, serializeOrder } from "@/lib/api";
import { db } from "@/lib/db";
export async function GET() { if (!await requireAdmin()) return jsonError("Operator access required.", 403); const orders = await db.order.findMany({ include: { customer: true, items: true, payment: true }, orderBy: { createdAt: "desc" } }); return Response.json({ orders: orders.map(serializeOrder) }); }
