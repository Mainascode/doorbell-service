import bcrypt from "bcryptjs";
import { createSession, jsonError } from "@/lib/api";
import { db } from "@/lib/db";
export async function POST(request) {
    const body = await request.json().catch(() => null);
    const identifier = typeof (body === null || body === void 0 ? void 0 : body.identifier) === "string" ? body.identifier.trim() : typeof (body === null || body === void 0 ? void 0 : body.phone) === "string" ? body.phone.trim() : "";
    const password = typeof (body === null || body === void 0 ? void 0 : body.password) === "string" ? body.password : "";
    const confirmPassword = typeof (body === null || body === void 0 ? void 0 : body.confirmPassword) === "string" ? body.confirmPassword : password;
    if (!identifier || !password)
        return jsonError("Name or phone number and password are required.");
    if (password !== confirmPassword)
        return jsonError("Passwords do not match.");
    const user = await db.user.findFirst({ where: { OR: [{ phone: identifier }, { name: { equals: identifier, mode: "insensitive" } }] } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
        return jsonError("Invalid name, phone number, or password.", 401);
    await createSession(user.id);
    return Response.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
}
