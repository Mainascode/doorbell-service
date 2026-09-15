import { currentUser } from "@/lib/api";
export async function GET() { const user = await currentUser(); return user ? Response.json({ user }) : Response.json({ user: null }, { status: 401 }); }
