import { NextResponse } from "next/server";

import { getPlaywrightAiTestMode } from "@/features/ai/test-mode";

function isPlaywrightTestServer() {
  return process.env.PLAYWRIGHT_TEST === "1";
}

function getStubDelayMs(mode: ReturnType<typeof getPlaywrightAiTestMode>) {
  if (mode === "timeout") {
    return 2500;
  }

  const timeoutMs = Number.parseInt(process.env.MINA_AI_TIMEOUT_MS ?? "", 10);

  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    return timeoutMs + 1000;
  }

  return 2500;
}

function createSuccessResponse(content: string) {
  const words = content
    .toLowerCase()
    .match(/[a-z0-9-]{4,}/g)
    ?.filter((word, index, allWords) => allWords.indexOf(word) === index)
    .filter((word) => !["http", "https", "title", "markdown"].includes(word))
    .slice(0, 3) ?? ["generated", "metadata"];

  const summarySource = content.replace(/\s+/g, " ").trim().slice(0, 120) || "the saved item";

  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            summary: `AI summary for ${summarySource}.`,
            tags: words
          })
        }
      }
    ]
  };
}

export async function POST(request: Request) {
  if (!isPlaywrightTestServer()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const mode = getPlaywrightAiTestMode();

  if (mode === "success") {
    const body = (await request.json().catch(() => null)) as { messages?: Array<{ role?: string; content?: string }> } | null;
    const content = body?.messages?.map((message) => message.content ?? "").join(" ").trim() ?? "";

    return NextResponse.json(createSuccessResponse(content));
  }

  await new Promise((resolve) => {
    setTimeout(resolve, getStubDelayMs(mode));
  });

  return NextResponse.json({
    choices: [
      {
        message: {
          content: JSON.stringify({
            summary: "This response should arrive after the client timeout.",
            tags: ["timeout"]
          })
        }
      }
    ]
  });
}
