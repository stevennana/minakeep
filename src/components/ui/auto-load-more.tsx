"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";

import { getNextIncrementalLimit } from "@/lib/pagination";

type AutoLoadMoreProps = {
  buttonLabel: string;
  currentCount: number;
  currentLimit: number;
  pageSize: number;
  testId: string;
  totalCount: number;
};

export function AutoLoadMore({ buttonLabel, currentCount, currentLimit, pageSize, testId, totalCount }: AutoLoadMoreProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestedLimitRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasMore = currentCount < totalCount;

  const requestMore = useCallback(() => {
    if (!hasMore || isPending) {
      return;
    }

    const nextLimit = getNextIncrementalLimit(currentLimit, totalCount, pageSize);

    if (nextLimit <= currentLimit || requestedLimitRef.current === nextLimit) {
      return;
    }

    requestedLimitRef.current = nextLimit;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("limit", String(nextLimit));

    startTransition(() => {
      router.replace(`${pathname}?${nextSearchParams.toString()}` as Parameters<typeof router.replace>[0], {
        scroll: false
      });
    });
  }, [currentLimit, hasMore, isPending, pageSize, pathname, router, searchParams, totalCount]);

  useEffect(() => {
    requestedLimitRef.current = null;
  }, [currentLimit]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || isPending) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          requestMore();
        }
      },
      {
        rootMargin: "0px 0px 240px 0px",
        threshold: 0.2
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isPending, currentLimit, totalCount, pageSize, pathname, router, searchParams, requestMore]);

  if (!hasMore) {
    return null;
  }

  return (
    <div className="collection-load-more" data-testid={testId} ref={sentinelRef}>
      <p className="field-note collection-load-more-summary">
        {`Showing ${currentCount} of ${totalCount}.`}
      </p>
      <button
        className="ghost-button ui-button ui-button-ghost collection-load-more-button"
        data-ui-button="ghost"
        disabled={isPending}
        onClick={requestMore}
        type="button"
      >
        {isPending ? "Loading more..." : buttonLabel}
      </button>
    </div>
  );
}
