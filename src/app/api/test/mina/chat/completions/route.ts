import { NextResponse } from "next/server";

function isPlaywrightTestServer() {
  return process.env.PLAYWRIGHT_TEST === "1";
}

function getStubDelayMs() {
  const timeoutMs = Number.parseInt(process.env.MINA_AI_TIMEOUT_MS ?? "", 10);

  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    return timeoutMs + 1000;
  }

  return 2500;
}

export async function POST() {
  if (!isPlaywrightTestServer()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await new Promise((resolve) => {
    setTimeout(resolve, getStubDelayMs());
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
