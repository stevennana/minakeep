export type SelectionRange = {
  start: number;
  end: number;
};

export type MarkdownEditResult = {
  nextMarkdown: string;
  nextSelection: SelectionRange;
};

export type NoteEditorViewMode = "source" | "split" | "preview";

function getLineRange(markdown: string, start: number, end: number) {
  const lineStart = markdown.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const nextBreak = markdown.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? markdown.length : nextBreak;

  return {
    lineEnd,
    lineStart,
    lineText: markdown.slice(lineStart, lineEnd)
  };
}

function getSelectedLineBlock(markdown: string, selection: SelectionRange) {
  const lineStart = markdown.lastIndexOf("\n", Math.max(0, selection.start - 1)) + 1;
  const boundaryIndex = selection.end > selection.start && markdown[selection.end - 1] === "\n" ? selection.end - 1 : selection.end;
  const nextBreak = markdown.indexOf("\n", Math.max(boundaryIndex, lineStart));
  const lineEnd = nextBreak === -1 ? markdown.length : nextBreak;
  const block = markdown.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  return {
    block,
    lineEnd,
    lineStart,
    lines
  };
}

function getLineOffsets(lines: string[]) {
  const offsets: number[] = [];
  let offset = 0;

  for (const line of lines) {
    offsets.push(offset);
    offset += line.length + 1;
  }

  return offsets;
}

function getLineIndexForOffset(offsets: number[], offset: number) {
  let lineIndex = 0;

  for (let index = 0; index < offsets.length; index += 1) {
    if (offsets[index] > offset) {
      break;
    }

    lineIndex = index;
  }

  return lineIndex;
}

export function applyMarkdownReplacement(markdown: string, selection: SelectionRange, replacement: string): MarkdownEditResult {
  const nextMarkdown = `${markdown.slice(0, selection.start)}${replacement}${markdown.slice(selection.end)}`;
  const nextCursor = selection.start + replacement.length;

  return {
    nextMarkdown,
    nextSelection: {
      end: nextCursor,
      start: nextCursor
    }
  };
}

function replaceSelectedLines(
  markdown: string,
  selection: SelectionRange,
  transformLines: (lines: string[]) => string[]
): MarkdownEditResult {
  const { lineEnd, lineStart, lines } = getSelectedLineBlock(markdown, selection);
  const nextLines = transformLines(lines);
  const nextBlock = nextLines.join("\n");
  const nextMarkdown = `${markdown.slice(0, lineStart)}${nextBlock}${markdown.slice(lineEnd)}`;

  if (selection.start !== selection.end) {
    return {
      nextMarkdown,
      nextSelection: {
        end: lineStart + nextBlock.length,
        start: lineStart
      }
    };
  }

  const lineOffsets = getLineOffsets(lines);
  const nextLineOffsets = getLineOffsets(nextLines);
  const relativeCursor = selection.start - lineStart;
  const currentLineIndex = getLineIndexForOffset(lineOffsets, relativeCursor);
  const currentLineOffset = lineOffsets[currentLineIndex] ?? 0;
  const nextLineOffset = nextLineOffsets[currentLineIndex] ?? 0;
  const currentColumn = relativeCursor - currentLineOffset;
  const currentLine = lines[currentLineIndex] ?? "";
  const nextLine = nextLines[currentLineIndex] ?? "";
  const lineDelta = nextLine.length - currentLine.length;
  const nextColumn = Math.max(0, Math.min(nextLine.length, currentColumn + lineDelta));
  const nextCursor = lineStart + nextLineOffset + nextColumn;

  return {
    nextMarkdown,
    nextSelection: {
      end: nextCursor,
      start: nextCursor
    }
  };
}

export function toggleInlineWrap(markdown: string, selection: SelectionRange, marker: string): MarkdownEditResult {
  if (selection.start === selection.end) {
    const nextCursor = selection.start + marker.length;
    const nextMarkdown = `${markdown.slice(0, selection.start)}${marker}${marker}${markdown.slice(selection.end)}`;

    return {
      nextMarkdown,
      nextSelection: {
        end: nextCursor,
        start: nextCursor
      }
    };
  }

  const selectedText = markdown.slice(selection.start, selection.end);
  const surroundingStart = Math.max(0, selection.start - marker.length);
  const surroundingPrefix = markdown.slice(surroundingStart, selection.start);
  const surroundingSuffix = markdown.slice(selection.end, selection.end + marker.length);

  if (selection.start >= marker.length && surroundingPrefix === marker && surroundingSuffix === marker) {
    const nextMarkdown = `${markdown.slice(0, selection.start - marker.length)}${selectedText}${markdown.slice(selection.end + marker.length)}`;

    return {
      nextMarkdown,
      nextSelection: {
        end: selection.end - marker.length,
        start: selection.start - marker.length
      }
    };
  }

  if (selectedText.startsWith(marker) && selectedText.endsWith(marker) && selectedText.length >= marker.length * 2) {
    const unwrapped = selectedText.slice(marker.length, selectedText.length - marker.length);

    return {
      nextMarkdown: `${markdown.slice(0, selection.start)}${unwrapped}${markdown.slice(selection.end)}`,
      nextSelection: {
        end: selection.start + unwrapped.length,
        start: selection.start
      }
    };
  }

  return {
    nextMarkdown: `${markdown.slice(0, selection.start)}${marker}${selectedText}${marker}${markdown.slice(selection.end)}`,
    nextSelection: {
      end: selection.end + marker.length,
      start: selection.start + marker.length
    }
  };
}

export function insertMarkdownLink(markdown: string, selection: SelectionRange): MarkdownEditResult {
  const selectedText = markdown.slice(selection.start, selection.end);
  const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

  if (existingLinkMatch) {
    const label = existingLinkMatch[1] ?? "";

    return {
      nextMarkdown: `${markdown.slice(0, selection.start)}${label}${markdown.slice(selection.end)}`,
      nextSelection: {
        end: selection.start + label.length,
        start: selection.start
      }
    };
  }

  const label = selectedText || "link text";
  const url = "https://";
  const replacement = `[${label}](${url})`;
  const labelStart = selection.start + 1;
  const urlStart = selection.start + label.length + 3;

  return {
    nextMarkdown: `${markdown.slice(0, selection.start)}${replacement}${markdown.slice(selection.end)}`,
    nextSelection: selectedText
      ? {
          end: urlStart + url.length,
          start: urlStart
        }
      : {
          end: labelStart + label.length,
          start: labelStart
        }
  };
}

export function insertMarkdownImage(
  markdown: string,
  selection: SelectionRange,
  image: { alt: string; url: string }
): MarkdownEditResult {
  const replacement = `![${image.alt}](${image.url})`;
  const before = markdown.slice(0, selection.start);
  const after = markdown.slice(selection.end);
  const prefix = before.length === 0 ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const suffix = after.length === 0 ? "" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const nextMarkdown = `${before}${prefix}${replacement}${suffix}${after}`;
  const nextCursor = before.length + prefix.length + replacement.length + suffix.length;

  return {
    nextMarkdown,
    nextSelection: {
      end: nextCursor,
      start: nextCursor
    }
  };
}

export function toggleBlockquote(markdown: string, selection: SelectionRange): MarkdownEditResult {
  return replaceSelectedLines(markdown, selection, (lines) => {
    const hasContent = lines.some((line) => line.trim().length > 0);
    const shouldRemove = hasContent && lines.filter((line) => line.trim().length > 0).every((line) => /^(\s*)>\s?/.test(line));

    return lines.map((line) => {
      if (!line.trim()) {
        return lines.length === 1 ? "> " : line;
      }

      if (shouldRemove) {
        return line.replace(/^(\s*)>\s?/, "$1");
      }

      return line.replace(/^(\s*)/, "$1> ");
    });
  });
}

export function toggleBulletList(markdown: string, selection: SelectionRange): MarkdownEditResult {
  return replaceSelectedLines(markdown, selection, (lines) => {
    const hasContent = lines.some((line) => line.trim().length > 0);
    const shouldRemove = hasContent && lines.filter((line) => line.trim().length > 0).every((line) => /^(\s*)[-*]\s+/.test(line));

    return lines.map((line) => {
      if (!line.trim()) {
        return lines.length === 1 ? "- " : line;
      }

      if (shouldRemove) {
        return line.replace(/^(\s*)[-*]\s+/, "$1");
      }

      return line.replace(/^(\s*)/, "$1- ");
    });
  });
}

export function toggleOrderedList(markdown: string, selection: SelectionRange): MarkdownEditResult {
  return replaceSelectedLines(markdown, selection, (lines) => {
    const hasContent = lines.some((line) => line.trim().length > 0);
    const shouldRemove = hasContent && lines.filter((line) => line.trim().length > 0).every((line) => /^(\s*)\d+\.\s+/.test(line));
    let itemIndex = 0;

    return lines.map((line) => {
      if (!line.trim()) {
        return lines.length === 1 ? "1. " : line;
      }

      if (shouldRemove) {
        return line.replace(/^(\s*)\d+\.\s+/, "$1");
      }

      itemIndex += 1;
      return line.replace(/^(\s*)/, `$1${itemIndex}. `);
    });
  });
}

export function toggleHeading(markdown: string, selection: SelectionRange, level = 2): MarkdownEditResult {
  const marker = `${"#".repeat(level)} `;

  return replaceSelectedLines(markdown, selection, (lines) => {
    const hasContent = lines.some((line) => line.trim().length > 0);
    const shouldRemove = hasContent && lines.filter((line) => line.trim().length > 0).every((line) => new RegExp(`^(\\s*)#{${level}}\\s+`).test(line));

    return lines.map((line) => {
      if (!line.trim()) {
        return lines.length === 1 ? marker : line;
      }

      if (shouldRemove) {
        return line.replace(new RegExp(`^(\\s*)#{${level}}\\s+`), "$1");
      }

      return line.replace(/^(\s*)(#{1,6}\s+)?/, `$1${marker}`);
    });
  });
}

export function toggleFencedCodeBlock(markdown: string, selection: SelectionRange): MarkdownEditResult {
  const selectedText = markdown.slice(selection.start, selection.end);
  const fencedBlockMatch = selectedText.match(/^```[^\n]*\n([\s\S]*)\n```$/);

  if (fencedBlockMatch) {
    const body = fencedBlockMatch[1] ?? "";

    return {
      nextMarkdown: `${markdown.slice(0, selection.start)}${body}${markdown.slice(selection.end)}`,
      nextSelection: {
        end: selection.start + body.length,
        start: selection.start
      }
    };
  }

  if (selection.start === selection.end) {
    const replacement = "```\n\n```";
    const cursor = selection.start + 4;

    return {
      nextMarkdown: `${markdown.slice(0, selection.start)}${replacement}${markdown.slice(selection.end)}`,
      nextSelection: {
        end: cursor,
        start: cursor
      }
    };
  }

  const replacement = `\`\`\`\n${selectedText}\n\`\`\``;
  const nextStart = selection.start + 4;

  return {
    nextMarkdown: `${markdown.slice(0, selection.start)}${replacement}${markdown.slice(selection.end)}`,
    nextSelection: {
      end: nextStart + selectedText.length,
      start: nextStart
    }
  };
}

export function indentSelectedLines(markdown: string, selection: SelectionRange, remove = false): MarkdownEditResult {
  const lineStart = markdown.lastIndexOf("\n", Math.max(0, selection.start - 1)) + 1;
  const boundaryIndex = selection.end > 0 && markdown[selection.end - 1] === "\n" ? selection.end - 1 : selection.end;
  const nextBreak = markdown.indexOf("\n", boundaryIndex);
  const lineEnd = nextBreak === -1 ? markdown.length : nextBreak;
  const block = markdown.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  const transformedLines = lines.map((line) => {
    if (!remove) {
      return `  ${line}`;
    }

    if (line.startsWith("  ")) {
      return line.slice(2);
    }

    if (line.startsWith("\t")) {
      return line.slice(1);
    }

    if (line.startsWith(" ")) {
      return line.slice(1);
    }

    return line;
  });

  const nextBlock = transformedLines.join("\n");
  const nextMarkdown = `${markdown.slice(0, lineStart)}${nextBlock}${markdown.slice(lineEnd)}`;
  const firstLineDelta = transformedLines[0].length - lines[0].length;

  return {
    nextMarkdown,
    nextSelection: {
      end: lineStart + nextBlock.length,
      start: Math.max(lineStart, selection.start + firstLineDelta)
    }
  };
}

export function continueMarkdownStructure(markdown: string, selection: SelectionRange) {
  if (selection.start !== selection.end) {
    return null;
  }

  const { lineStart, lineText } = getLineRange(markdown, selection.start, selection.end);
  const cursorWithinLine = selection.start - lineStart;

  if (cursorWithinLine !== lineText.length) {
    return null;
  }

  const orderedMatch = lineText.match(/^(\s*)(\d+)\.\s+(.*)$/);
  const unorderedMatch = lineText.match(/^(\s*)([-*])\s+(.*)$/);
  const quoteMatch = lineText.match(/^(\s*>\s?)(.*)$/);

  if (orderedMatch) {
    const [, indent = "", index = "1", content = ""] = orderedMatch;
    const replacement = content.trim() ? `\n${indent}${Number(index) + 1}. ` : "\n";

    return applyMarkdownReplacement(markdown, selection, replacement);
  }

  if (unorderedMatch) {
    const [, indent = "", marker = "-", content = ""] = unorderedMatch;
    const replacement = content.trim() ? `\n${indent}${marker} ` : "\n";

    return applyMarkdownReplacement(markdown, selection, replacement);
  }

  if (quoteMatch) {
    const [, marker = "> ", content = ""] = quoteMatch;
    const replacement = content.trim() ? `\n${marker}` : "\n";

    return applyMarkdownReplacement(markdown, selection, replacement);
  }

  return null;
}

export function getViewportSyncedViewMode(
  current: NoteEditorViewMode,
  isDesktopViewport: boolean,
  preserveDesktopSource = false
): NoteEditorViewMode {
  if (!isDesktopViewport && current === "split") {
    return "source";
  }

  if (isDesktopViewport && !preserveDesktopSource && current === "source") {
    return "split";
  }

  return current;
}
