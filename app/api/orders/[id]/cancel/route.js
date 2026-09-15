import { jsonError, requireUser } from "@/lib/api";
import { db } from "@/lib/db";
export async function POST(_, context) { const user = await requireUser(); if (!user)
    return jsonError("Authentication required.", 401); const { id } = await context.params; const order = await db.order.findFirst({ where: { id, customerId: user.id } }); if (!order)
    return jsonError("Order not found.", 404); if (order.status !== "REQUESTED")
    return jsonError("Only unaccepted requests can be cancelled.", 409); return Response.json({ order: await db.order.update({ where: { id }, data: { status: "CANCELLED" } }) }); }
