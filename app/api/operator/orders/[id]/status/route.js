import { allowedTransitions, jsonError, requireAdmin, serializeOrder } from "@/lib/api";
import { db } from "@/lib/db";
export async function PATCH(request, context) { var _a; const operator = await requireAdmin(); if (!operator)
    return jsonError("Operator access required.", 403); const { id } = await context.params; const { status } = await request.json().catch(() => ({})); const order = await db.order.findUnique({ where: { id } }); if (!order)
    return jsonError("Order not found.", 404); if (typeof status !== "string" || !((_a = allowedTransitions[order.status]) === null || _a === void 0 ? void 0 : _a.includes(status)))
    return jsonError(`Cannot change ${order.status} to ${status}.`, 409); const data = { status }; if (status === "ACCEPTED") {
    data.operatorId = operator.id;
    data.acceptedAt = new Date();
} if (status === "COMPLETED")
    data.completedAt = new Date(); const updated = await db.order.update({ where: { id }, data, include: { items: true, payment: true } }); await db.notification.create({ data: { userId: order.customerId, type: "ORDER_STATUS", title: "Order update", message: `${order.orderNumber} is now ${status.replaceAll("_", " ")}.` } }); return Response.json({ order: serializeOrder(updated) }); }
