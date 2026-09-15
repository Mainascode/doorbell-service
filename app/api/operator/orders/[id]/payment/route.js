import { jsonError, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
export async function PATCH(request, context) { if (!await requireAdmin())
    return jsonError("Operator access required.", 403); const { id } = await context.params; const { status, method } = await request.json().catch(() => ({})); if (!["PENDING", "CONFIRMED", "FAILED"].includes(status))
    return jsonError("Invalid payment status."); const payment = await db.payment.update({ where: { orderId: id }, data: Object.assign(Object.assign({ status }, (typeof method === "string" ? { method } : {})), (status === "CONFIRMED" ? { confirmedAt: new Date() } : {})) }); await db.order.update({ where: { id }, data: { paymentStatus: status } }); return Response.json({ payment }); }
