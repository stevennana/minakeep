import katex from "katex";

import { getMermaidBlockMarkup } from "@/features/notes/mermaid";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(rawUrl: string) {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    return "#";
  }

  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  try {
    const url = new URL(trimmedUrl);

    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return url.toString();
    }
  } catch {}

  return "#";
}

export type EmbeddedMarkdownImage = {
  alt: string;
  src: string;
};

export type MarkdownReference = {
  entryId: string;
  index: number;
  label: string;
  title: string;
  titleHtml: string;
  url: string;
};

export type RenderedMarkdownResult = {
  articleHtml: string;
  references: MarkdownReference[];
};

type ReferenceDefinition = {
  entryId: string;
  label: string;
  sanitizedUrl: string;
  title: string;
};

type MarkdownRenderContext = {
  definitions: Map<string, ReferenceDefinition>;
  referencesByLabel: Map<string, MarkdownReference>;
  referencesInOrder: MarkdownReference[];
};

function isEscaped(markdown: string, index: number) {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && markdown[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function renderMathExpression(expression: string, displayMode: boolean) {
  return katex.renderToString(expression.trim(), {
    displayMode,
    output: "htmlAndMathml",
    strict: "ignore",
    throwOnError: false
  });
}

function findInlineMathEnd(markdown: string, start: number) {
  for (let index = start + 1; index < markdown.length; index += 1) {
    if (markdown[index] !== "$" || isEscaped(markdown, index)) {
      continue;
    }

    const expression = markdown.slice(start + 1, index);

    if (!expression.trim() || /\s$/.test(expression)) {
      continue;
    }

    return index;
  }

  return -1;
}

function createReferenceEntryId(label: string) {
  return `markdown-reference-${encodeURIComponent(label.trim())}`;
}

function extractReferenceDefinitions(markdown: string) {
  const articleLines: string[] = [];
  const definitions = new Map<string, ReferenceDefinition>();
  const normalizedLines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let inFence = false;

  for (const line of normalizedLines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("```")) {
      inFence = !inFence;
      articleLines.push(line);
      continue;
    }

    if (inFence) {
      articleLines.push(line);
      continue;
    }

    const definitionMatch = trimmedLine.match(/^\[\^([^\]]+)\]:\s+\[([^\]]+)\]\(([^)]+)\)$/);

    if (!definitionMatch) {
      articleLines.push(line);
      continue;
    }

    const label = (definitionMatch[1] ?? "").trim();
    const title = (definitionMatch[2] ?? "").trim();
    const rawUrl = (definitionMatch[3] ?? "").trim();

    if (!label || !title || !rawUrl) {
      articleLines.push(line);
      continue;
    }

    if (!definitions.has(label)) {
      definitions.set(label, {
        entryId: createReferenceEntryId(label),
        label,
        sanitizedUrl: sanitizeUrl(rawUrl),
        title
      });
    }
  }

  return {
    articleLines,
    definitions
  };
}

function renderInlineMarkdown(markdown: string, context?: MarkdownRenderContext): string {
  let result = "";
  let cursor = 0;

  while (cursor < markdown.length) {
    const codeMatch = markdown.slice(cursor).match(/^`([^`]+)`/);

    if (codeMatch) {
      result += `<code>${escapeHtml(codeMatch[1] ?? "")}</code>`;
      cursor += codeMatch[0].length;
      continue;
    }

    const imageMatch = markdown.slice(cursor).match(/^!\[([^\]]*)\]\(([^)]+)\)/);

    if (imageMatch) {
      result += `<img alt="${escapeHtml(imageMatch[1] ?? "")}" loading="lazy" src="${escapeHtml(sanitizeUrl(imageMatch[2] ?? ""))}" />`;
      cursor += imageMatch[0].length;
      continue;
    }

    const referenceMatch = markdown.slice(cursor).match(/^\[\^([^\]]+)\]/);

    if (referenceMatch && context) {
      const label = (referenceMatch[1] ?? "").trim();
      const definition = context.definitions.get(label);

      if (definition) {
        let reference = context.referencesByLabel.get(label);

        if (!reference) {
          reference = {
            entryId: definition.entryId,
            index: context.referencesInOrder.length + 1,
            label,
            title: definition.title,
            titleHtml: renderInlineMarkdown(definition.title),
            url: definition.sanitizedUrl
          };
          context.referencesByLabel.set(label, reference);
          context.referencesInOrder.push(reference);
        }

        result += `<sup class="markdown-reference-marker"><a aria-label="Reference ${reference.index}" href="#${reference.entryId}">[${reference.index}]</a></sup>`;
        cursor += referenceMatch[0].length;
        continue;
      }
    }

    const linkMatch = markdown.slice(cursor).match(/^\[([^\]]+)\]\(([^)]+)\)/);

    if (linkMatch) {
      result += `<a href="${escapeHtml(sanitizeUrl(linkMatch[2] ?? ""))}" rel="noreferrer noopener" target="_blank">${renderInlineMarkdown(linkMatch[1] ?? "", context)}</a>`;
      cursor += linkMatch[0].length;
      continue;
    }

    const strongMatch = markdown.slice(cursor).match(/^\*\*([^*]+)\*\*/);

    if (strongMatch) {
      result += `<strong>${renderInlineMarkdown(strongMatch[1] ?? "", context)}</strong>`;
      cursor += strongMatch[0].length;
      continue;
    }

    const emphasisMatch = markdown.slice(cursor).match(/^\*([^*]+)\*/);

    if (emphasisMatch) {
      result += `<em>${renderInlineMarkdown(emphasisMatch[1] ?? "", context)}</em>`;
      cursor += emphasisMatch[0].length;
      continue;
    }

    if (
      markdown[cursor] === "$" &&
      !isEscaped(markdown, cursor) &&
      markdown[cursor + 1] !== "$" &&
      markdown[cursor + 1] &&
      !/\s/.test(markdown[cursor + 1] ?? "")
    ) {
      const mathEnd = findInlineMathEnd(markdown, cursor);

      if (mathEnd !== -1) {
        const expression = markdown.slice(cursor + 1, mathEnd);
        result += `<span class="markdown-math-inline">${renderMathExpression(expression, false)}</span>`;
        cursor = mathEnd + 1;
        continue;
      }
    }

    result += escapeHtml(markdown[cursor]);
    cursor += 1;
  }

  return result;
}

function isUnorderedListItem(line: string) {
  return /^[-*]\s+/.test(line);
}

function isOrderedListItem(line: string) {
  return /^\d+\.\s+/.test(line);
}

function splitTableCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDividerLine(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function isTableRow(line: string) {
  const trimmed = line.trim();
  return trimmed.includes("|") && splitTableCells(trimmed).length > 1;
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^\n$]+)\$/g, "$1")
    .replace(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/gm, " ")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[|*_>#-]/g, " ")
    .replace(/\d+\.\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


export function createNoteExcerpt(markdown: string, title: string, maxLength = 180) {
  const text = stripMarkdown(markdown) || title.trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function getFirstEmbeddedMarkdownImage(markdown: string): EmbeddedMarkdownImage | null {
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    const src = sanitizeUrl(match[2] ?? "");

    if (src === "#") {
      continue;
    }

    return {
      alt: (match[1] ?? "").trim(),
      src
    };
  }

  return null;
}

export function renderMarkdown(markdown: string): RenderedMarkdownResult {
  const { articleLines, definitions } = extractReferenceDefinitions(markdown);
  const normalizedLines = articleLines;
  const blocks: string[] = [];
  const renderContext: MarkdownRenderContext | undefined =
    definitions.size > 0
      ? {
          definitions,
          referencesByLabel: new Map<string, MarkdownReference>(),
          referencesInOrder: []
        }
      : undefined;

  for (let index = 0; index < normalizedLines.length; ) {
    const line = normalizedLines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const fenceInfo = trimmedLine.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < normalizedLines.length && !normalizedLines[index].trim().startsWith("```")) {
        codeLines.push(normalizedLines[index]);
        index += 1;
      }

      if (index < normalizedLines.length) {
        index += 1;
      }

      if (fenceInfo === "mermaid") {
        blocks.push(getMermaidBlockMarkup(codeLines.join("\n")));
        continue;
      }

      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (trimmedLine === "$$" || /^\$\$.+\$\$$/.test(trimmedLine)) {
      if (trimmedLine !== "$$") {
        blocks.push(`<div class="markdown-math-block">${renderMathExpression(trimmedLine.slice(2, -2), true)}</div>`);
        index += 1;
        continue;
      }

      const mathLines: string[] = [];
      index += 1;

      while (index < normalizedLines.length && normalizedLines[index].trim() !== "$$") {
        mathLines.push(normalizedLines[index]);
        index += 1;
      }

      if (index < normalizedLines.length) {
        index += 1;
      }

      blocks.push(`<div class="markdown-math-block">${renderMathExpression(mathLines.join("\n"), true)}</div>`);
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2], renderContext)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmedLine)) {
      blocks.push("<hr />");
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < normalizedLines.length && normalizedLines[index].trim().startsWith(">")) {
        quoteLines.push(normalizedLines[index].replace(/^>\s?/, ""));
        index += 1;
      }

      const quoteContent = quoteLines.map((quoteLine) => renderInlineMarkdown(quoteLine, renderContext)).join("<br />");
      blocks.push(`<blockquote><p>${quoteContent}</p></blockquote>`);
      continue;
    }

    if (isUnorderedListItem(trimmedLine)) {
      const items: string[] = [];

      while (index < normalizedLines.length && isUnorderedListItem(normalizedLines[index].trim())) {
        items.push(`<li>${renderInlineMarkdown(normalizedLines[index].trim().replace(/^[-*]\s+/, ""), renderContext)}</li>`);
        index += 1;
      }

      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (isOrderedListItem(trimmedLine)) {
      const items: string[] = [];

      while (index < normalizedLines.length && isOrderedListItem(normalizedLines[index].trim())) {
        items.push(`<li>${renderInlineMarkdown(normalizedLines[index].trim().replace(/^\d+\.\s+/, ""), renderContext)}</li>`);
        index += 1;
      }

      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (
      index + 1 < normalizedLines.length &&
      isTableRow(trimmedLine) &&
      isTableDividerLine(normalizedLines[index + 1])
    ) {
      const headerCells = splitTableCells(trimmedLine);
      const bodyRows: string[] = [];
      index += 2;

      while (index < normalizedLines.length && isTableRow(normalizedLines[index])) {
        const rowCells = splitTableCells(normalizedLines[index]);
        const cells = headerCells.map((_, cellIndex) => `<td>${renderInlineMarkdown(rowCells[cellIndex] ?? "", renderContext)}</td>`);
        bodyRows.push(`<tr>${cells.join("")}</tr>`);
        index += 1;
      }

      const header = headerCells.map((cell) => `<th>${renderInlineMarkdown(cell, renderContext)}</th>`).join("");
      const body = bodyRows.length > 0 ? `<tbody>${bodyRows.join("")}</tbody>` : "";
      blocks.push(`<table><thead><tr>${header}</tr></thead>${body}</table>`);
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < normalizedLines.length) {
      const candidate = normalizedLines[index];
      const trimmedCandidate = candidate.trim();

      if (!trimmedCandidate) {
        break;
      }

      if (
        trimmedCandidate.startsWith("```") ||
        trimmedCandidate === "$$" ||
        /^\$\$.+\$\$$/.test(trimmedCandidate) ||
        trimmedCandidate.startsWith(">") ||
        /^---+$/.test(trimmedCandidate) ||
        /^(#{1,6})\s+/.test(trimmedCandidate) ||
        isUnorderedListItem(trimmedCandidate) ||
        isOrderedListItem(trimmedCandidate)
      ) {
        break;
      }

      paragraphLines.push(candidate);
      index += 1;
    }

    const paragraphContent = paragraphLines.map((paragraphLine) => renderInlineMarkdown(paragraphLine, renderContext)).join("<br />");
    blocks.push(`<p>${paragraphContent}</p>`);
  }

  return {
    articleHtml: blocks.join("\n"),
    references: renderContext?.referencesInOrder ?? []
  };
}

export function renderMarkdownToHtml(markdown: string) {
  return renderMarkdown(markdown).articleHtml;
}
