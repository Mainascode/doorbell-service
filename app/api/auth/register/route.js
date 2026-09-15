import bcrypt from "bcryptjs";
import { createSession, jsonError } from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (name.length < 2 || name.length > 100) return jsonError("Enter a name between 2 and 100 characters.");
  if (!/^\+?[0-9]{7,15}$/.test(phone)) return jsonError("Enter a valid phone number.");
  if (password.length < 8) return jsonError("Password must be at least 8 characters.");
  if (password !== confirmPassword) return jsonError("Passwords do not match.");

  try {
    const user = await db.user.create({ data: { name, phone, passwordHash: await bcrypt.hash(password, 12), profile: { create: {} } } });
    await createSession(user.id);
    return Response.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role } }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") return jsonError("An account already uses that phone number.", 409);
    throw error;
  }
}
