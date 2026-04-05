"use client";

import { useEffect, useRef, type RefObject } from "react";

import { enhanceMermaidFigures } from "@/features/notes/mermaid";

type RenderedMarkdownProps = {
  autoEnhance?: boolean;
  className: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  html: string;
  onMermaidStatusChange?: (summary: { syntaxIssueCount: number }) => void;
  testId?: string;
};

export function RenderedMarkdown({
  autoEnhance = true,
  className,
  containerRef,
  html,
  onMermaidStatusChange,
  testId
}: RenderedMarkdownProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const resolvedRef = containerRef ?? localRef;

  useEffect(() => {
    if (!autoEnhance) {
      return;
    }

    const container = resolvedRef.current;

    if (!container) {
      return;
    }

    let cancelled = false;
    let frame = 0;
    let timer = 0;
    let attempts = 0;

    const maxVisibilityChecks = 20;

    const runEnhancement = async () => {
      if (cancelled) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && container.getClientRects().length > 0;

      if (!isVisible && attempts < maxVisibilityChecks) {
        attempts += 1;
        timer = window.setTimeout(runEnhancement, 80);
        return;
      }

      const summary = await enhanceMermaidFigures(container);

      if (!cancelled) {
        onMermaidStatusChange?.(summary);
      }
    };

    void runEnhancement();
    frame = window.requestAnimationFrame(() => {
      void runEnhancement();
    });
    timer = window.setTimeout(() => {
      void runEnhancement();
    }, 180);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [autoEnhance, html, onMermaidStatusChange, resolvedRef]);

  return (
    <div
      className={className}
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: html }}
      ref={resolvedRef}
    />
  );
}
