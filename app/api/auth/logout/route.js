import { deleteSession } from "@/lib/api";
export async function POST() { await deleteSession(); return Response.json({ ok: true }); }
