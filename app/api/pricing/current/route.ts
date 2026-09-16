import { currentPrice, jsonError } from "@/lib/api";
export async function GET() { try { return Response.json(await currentPrice()); } catch (error) { return jsonError(error instanceof Error ? error.message : "Unable to retrieve service status.", 503); } }
