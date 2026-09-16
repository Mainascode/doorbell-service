import { currentPrice, jsonError, requireUser, serializeOrder } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  const user = await requireUser(); if (!user) return jsonError("Authentication required.", 401);
  const orders = await db.order.findMany({ where: { customerId: user.id }, include: { items: true, payment: true }, orderBy: { createdAt: "desc" } });
  return Response.json({ orders: orders.map(serializeOrder) });
}
export async function POST(request: Request) {
  const user = await requireUser(); if (!user) return jsonError("Authentication required.", 401);
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items.filter((item: unknown) => typeof item === "object" && item && typeof (item as { name?: unknown }).name === "string" && (item as { name: string }).name.trim()) : [];
  const pickupLocation = typeof body?.pickupLocation === "string" ? body.pickupLocation.trim() : "";
  const deliveryLocation = typeof body?.deliveryLocation === "string" ? body.deliveryLocation.trim() : "";
  const instructions = typeof body?.instructions === "string" ? body.instructions.trim().slice(0, 1000) : null;
  if (!items.length || !pickupLocation || !deliveryLocation) return jsonError("Add at least one item, a pickup location, and a delivery location.");
  const price = await currentPrice(); if (!price.available) return jsonError(price.reason ?? "Requests are unavailable.", 409);
  const count = await db.order.count(); const orderNumber = `NTM-${1042 + count}`;
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  const order = await db.order.create({ data: { orderNumber, customerId: user.id, pickupLocation, deliveryLocation, instructions, deliveryFee: price.fee, pricingSnapshot: { mode: price.mode, rule: price.rule, fee: price.fee }, items: { create: items.map((item: { name: string; quantity?: unknown }) => ({ name: item.name.trim().slice(0, 160), quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)) })) }, payment: { create: { amount: price.fee } } }, include: { items: true, payment: true } });
  if (admin) await db.notification.create({ data: { userId: admin.id, type: "NEW_ORDER", title: "New request", message: `${order.orderNumber} is ready for review.` } });
  return Response.json({ order: serializeOrder(order) }, { status: 201 });
}
