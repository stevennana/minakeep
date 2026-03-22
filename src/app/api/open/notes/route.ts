import { NextResponse } from "next/server";

import { getExternalNoteApiAuthResult } from "@/lib/external-note-api/auth";

export function POST(request: Request) {
  const authResult = getExternalNoteApiAuthResult(request.headers);

  if (authResult.state === "disabled") {
    return NextResponse.json(
      {
        error: "External note API is disabled."
      },
      {
        status: 503
      }
    );
  }

  if (authResult.state === "unauthorized") {
    return NextResponse.json(
      {
        error: "Unauthorized."
      },
      {
        status: 401
      }
    );
  }

  return NextResponse.json(
    {
      error: "Not implemented."
    },
    {
      status: 501
    }
  );
}
