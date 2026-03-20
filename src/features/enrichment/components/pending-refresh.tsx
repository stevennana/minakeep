"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type EnrichmentPendingRefreshProps = {
  enabled: boolean;
  intervalMs?: number;
};

export function EnrichmentPendingRefresh({
  enabled,
  intervalMs = 2000
}: EnrichmentPendingRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, router]);

  return null;
}
