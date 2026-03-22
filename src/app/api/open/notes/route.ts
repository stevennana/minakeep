import { NextResponse } from "next/server";

import { createOwnerNote } from "@/features/notes/runtime";
import { env } from "@/lib/config/env";
import { getExternalNoteApiAuthResult } from "@/lib/external-note-api/auth";
import { prisma } from "@/lib/prisma";

type ExternalNoteCreatePayload = {
  title: string;
  markdown: string;
  isPublished?: boolean;
};

function getExternalNoteCreateValidationError(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Request body must be a JSON object.";
  }

  const { title, markdown, isPublished } = payload as Record<string, unknown>;

  if (typeof title !== "string") {
    return "`title` must be a string.";
  }

  if (typeof markdown !== "string") {
    return "`markdown` must be a string.";
  }

  if (isPublished !== undefined && typeof isPublished !== "boolean") {
    return "`isPublished` must be a boolean when provided.";
  }

  return null;
}

async function getExternalNoteCreatePayload(request: Request): Promise<ExternalNoteCreatePayload | Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Request body must be valid JSON."
      },
      {
        status: 400
      }
    );
  }

  const validationError = getExternalNoteCreateValidationError(payload);

  if (validationError) {
    return NextResponse.json(
      {
        error: validationError
      },
      {
        status: 400
      }
    );
  }

  return payload as ExternalNoteCreatePayload;
}

export async function POST(request: Request) {
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

  const payload = await getExternalNoteCreatePayload(request);

  if (payload instanceof Response) {
    return payload;
  }

  const owner = await prisma.user.findUnique({
    where: {
      username: env.ownerUsername
    },
    select: {
      id: true
    }
  });

  if (!owner) {
    return NextResponse.json(
      {
        error: "Owner account is unavailable."
      },
      {
        status: 503
      }
    );
  }

  const note = await createOwnerNote(
    owner.id,
    {
      title: payload.title,
      markdown: payload.markdown
    },
    {
      isPublished: payload.isPublished
    }
  );

  return NextResponse.json(
    {
      note: {
        id: note.id,
        title: note.title,
        slug: note.slug,
        isPublished: note.isPublished
      },
      ownerUrl: `/app/notes/${note.id}/edit`,
      publicUrl: note.isPublished ? `/notes/${note.slug}` : null
    },
    {
      status: 201
    }
  );
}
