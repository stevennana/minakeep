export type ImageLoadingIntent = "lazy" | "prioritized";

export type ImageLoadingAttributes = {
  decoding: "async";
  fetchPriority?: "high";
  loading: "eager" | "lazy";
};

export function getImageLoadingAttributes(intent: ImageLoadingIntent = "lazy"): ImageLoadingAttributes {
  if (intent === "prioritized") {
    return {
      decoding: "async",
      fetchPriority: "high",
      loading: "eager"
    };
  }

  return {
    decoding: "async",
    loading: "lazy"
  };
}
