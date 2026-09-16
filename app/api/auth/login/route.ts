import bcrypt from "bcryptjs";
import { createSession, jsonError } from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!phone || !password) return jsonError("Phone and password are required.");
  const user = await db.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return jsonError("Invalid phone or password.", 401);
  await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
}
