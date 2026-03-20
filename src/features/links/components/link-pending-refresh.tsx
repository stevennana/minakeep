"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LinkPendingRefresh({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, router]);

  return null;
}
