"use client";

import { useEffect, useRef, type RefObject } from "react";

import { enhanceMermaidFigures } from "@/features/notes/mermaid";
import type { RenderedMarkdownResult } from "@/features/notes/markdown";

type RenderedMarkdownProps = {
  autoEnhance?: boolean;
  className: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  html?: string;
  hideMermaidSyntaxFallbackSource?: boolean;
  onMermaidStatusChange?: (summary: { syntaxIssueCount: number }) => void;
  rendered?: RenderedMarkdownResult;
  testId?: string;
};

export function RenderedMarkdown({
  autoEnhance = true,
  className,
  containerRef,
  html,
  hideMermaidSyntaxFallbackSource = false,
  onMermaidStatusChange,
  rendered,
  testId
}: RenderedMarkdownProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const resolvedRef = containerRef ?? localRef;
  const articleHtml = rendered?.articleHtml ?? html ?? "";
  const references = rendered?.references ?? [];
  const referencesHtml =
    references.length > 0
      ? `<section aria-label="References" class="markdown-reference-section"><div class="markdown-reference-section-head"><p class="markdown-reference-eyebrow">Supporting sources</p><h2>References</h2></div><ol class="markdown-reference-list">${references
          .map(
            (reference) =>
              `<li class="markdown-reference-list-item" id="${reference.entryId}" tabindex="-1"><span aria-hidden="true" class="markdown-reference-index">${reference.index}</span><a class="markdown-reference-link" href="${reference.url}" rel="noreferrer noopener" target="_blank">${reference.titleHtml}</a></li>`
          )
          .join("")}</ol></section>`
      : "";
  const combinedHtml = `${articleHtml}${referencesHtml ? `\n${referencesHtml}` : ""}`;

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
      data-hide-mermaid-syntax-fallback-source={hideMermaidSyntaxFallbackSource ? "true" : undefined}
      data-testid={testId}
      dangerouslySetInnerHTML={{ __html: combinedHtml }}
      ref={resolvedRef}
    />
  );
}
