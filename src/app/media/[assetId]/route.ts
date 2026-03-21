import { auth } from "@/auth";
import { getReadableMediaAsset } from "@/features/media/service";

type MediaRouteContext = {
  params: Promise<{
    assetId: string;
  }>;
};

export async function GET(_request: Request, { params }: MediaRouteContext) {
  const session = await auth();
  const { assetId } = await params;
  const asset = await getReadableMediaAsset(assetId, session?.user?.id ?? null);

  if (!asset) {
    return new Response("Not found", {
      status: 404
    });
  }

  return new Response(asset.body, {
    status: 200,
    headers: {
      "Cache-Control": asset.accessMode === "public" ? "public, max-age=60" : "private, no-store",
      "Content-Length": String(asset.sizeBytes),
      "Content-Type": asset.contentType,
      "X-Content-Type-Options": "nosniff"
    }
  });
}
