import { NextResponse } from "next/server";

import { uploadNoteImage } from "@/features/media/service";
import { getOwnerSession } from "@/lib/auth/owner-session";

export async function POST(request: Request) {
  const session = await getOwnerSession();

  if (!session?.id) {
    return NextResponse.json(
      {
        error: "Sign in to upload note images."
      },
      {
        status: 401
      }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Choose an image to upload."
        },
        {
          status: 400
        }
      );
    }

    const noteIdValue = formData.get("noteId");
    const noteId = typeof noteIdValue === "string" && noteIdValue.trim() ? noteIdValue.trim() : null;
    const uploadedImage = await uploadNoteImage({
      file,
      noteId,
      ownerId: session.id
    });

    return NextResponse.json(uploadedImage, {
      status: 201
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Image upload failed."
      },
      {
        status: 400
      }
    );
  }
}
