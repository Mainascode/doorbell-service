import { jsonError, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
export async function PATCH(request) { if (!await requireAdmin())
    return jsonError("Operator access required.", 403); const { weatherMode } = await request.json().catch(() => ({})); if (weatherMode !== "NORMAL" && weatherMode !== "RAIN")
    return jsonError("weatherMode must be NORMAL or RAIN."); const settings = await db.operatorSettings.findFirst(); if (!settings)
    return jsonError("Operator settings have not been configured.", 503); return Response.json({ settings: await db.operatorSettings.update({ where: { id: settings.id }, data: { weatherMode } }) }); }
