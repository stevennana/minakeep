import { NextResponse } from "next/server";

import { serverLogger } from "@/lib/logging/server-logger";

export function GET() {
  serverLogger.debug("health check ok");

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
