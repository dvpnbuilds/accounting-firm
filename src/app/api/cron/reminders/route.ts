import { NextRequest, NextResponse } from "next/server";
import { checkAndSendReminders } from "@/lib/reminders";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await checkAndSendReminders();
  return NextResponse.json(result);
}
