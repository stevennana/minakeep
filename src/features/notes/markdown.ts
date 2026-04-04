import katex from "katex";

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

const MERMAID_SUPPORTED_ROOTS = [
  "architecture",
  "block-beta",
  "classDiagram",
  "erDiagram",
  "flowchart",
  "gitGraph",
  "gantt",
  "graph",
  "journey",
  "kanban",
  "mindmap",
  "packet-beta",
  "pie",
  "quadrantChart",
  "requirementDiagram",
  "sequenceDiagram",
  "stateDiagram",
  "stateDiagram-v2",
  "timeline",
  "xychart-beta"
] as const;

const MERMAID_MAX_SOURCE_PREVIEW_LINES = 8;
const MERMAID_MAX_LINE_LENGTH = 72;
const MERMAID_FLOWCHART_ROOTS = new Set(["flowchart", "graph"]);
const MERMAID_FLOWCHART_DIRECTIONS = new Set(["TB", "TD", "BT", "LR", "RL"]);

type MermaidNodeShape = "circle" | "diamond" | "rect" | "stadium";

type MermaidFlowchartNode = {
  id: string;
  label: string;
  shape: MermaidNodeShape;
};

type MermaidFlowchartEdge = {
  from: string;
  label: string | null;
  to: string;
};

type MermaidFlowchartDiagram = {
  direction: "BT" | "LR" | "RL" | "TB" | "TD";
  edges: MermaidFlowchartEdge[];
  nodes: MermaidFlowchartNode[];
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

function renderInlineMarkdown(markdown: string): string {
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

    const linkMatch = markdown.slice(cursor).match(/^\[([^\]]+)\]\(([^)]+)\)/);

    if (linkMatch) {
      result += `<a href="${escapeHtml(sanitizeUrl(linkMatch[2] ?? ""))}" rel="noreferrer noopener" target="_blank">${renderInlineMarkdown(linkMatch[1] ?? "")}</a>`;
      cursor += linkMatch[0].length;
      continue;
    }

    const strongMatch = markdown.slice(cursor).match(/^\*\*([^*]+)\*\*/);

    if (strongMatch) {
      result += `<strong>${renderInlineMarkdown(strongMatch[1] ?? "")}</strong>`;
      cursor += strongMatch[0].length;
      continue;
    }

    const emphasisMatch = markdown.slice(cursor).match(/^\*([^*]+)\*/);

    if (emphasisMatch) {
      result += `<em>${renderInlineMarkdown(emphasisMatch[1] ?? "")}</em>`;
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

function clampMarkdownPreviewLine(value: string, maxLength = MERMAID_MAX_LINE_LENGTH) {
  const trimmedValue = value.trimEnd();

  if (trimmedValue.length <= maxLength) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function getMermaidSourcePreview(source: string, maxLines = MERMAID_MAX_SOURCE_PREVIEW_LINES) {
  const sourceLines = source
    .trim()
    .split("\n")
    .map((line) => clampMarkdownPreviewLine(line))
    .filter((line) => line.length > 0);

  if (sourceLines.length <= maxLines) {
    return sourceLines;
  }

  return [...sourceLines.slice(0, maxLines), `... +${sourceLines.length - maxLines} more line(s)`];
}

function isProbablyValidMermaid(source: string) {
  const normalizedSource = source.replace(/\r\n?/g, "\n").trim();

  if (!normalizedSource) {
    return false;
  }

  const [firstLine] = normalizedSource.split("\n");
  const rootToken = firstLine?.trim().split(/\s+/, 1)[0] ?? "";

  if (!MERMAID_SUPPORTED_ROOTS.includes(rootToken as (typeof MERMAID_SUPPORTED_ROOTS)[number])) {
    return false;
  }

  let bracketBalance = 0;
  let parenthesisBalance = 0;
  let braceBalance = 0;
  let insideDoubleQuote = false;
  let insideSingleQuote = false;

  for (const character of normalizedSource) {
    if (character === '"' && !insideSingleQuote) {
      insideDoubleQuote = !insideDoubleQuote;
      continue;
    }

    if (character === "'" && !insideDoubleQuote) {
      insideSingleQuote = !insideSingleQuote;
      continue;
    }

    if (insideDoubleQuote || insideSingleQuote) {
      continue;
    }

    if (character === "[") {
      bracketBalance += 1;
      continue;
    }

    if (character === "]") {
      bracketBalance -= 1;
      continue;
    }

    if (character === "(") {
      parenthesisBalance += 1;
      continue;
    }

    if (character === ")") {
      parenthesisBalance -= 1;
      continue;
    }

    if (character === "{") {
      braceBalance += 1;
      continue;
    }

    if (character === "}") {
      braceBalance -= 1;
    }

    if (bracketBalance < 0 || parenthesisBalance < 0 || braceBalance < 0) {
      return false;
    }
  }

  return !insideDoubleQuote && !insideSingleQuote && bracketBalance === 0 && parenthesisBalance === 0 && braceBalance === 0;
}

function normalizeMermaidLines(source: string) {
  return source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("%%"));
}

function getMermaidRoot(source: string) {
  const [firstLine = ""] = normalizeMermaidLines(source);
  return firstLine.split(/\s+/, 1)[0] ?? "";
}

function parseMermaidFlowchartNode(token: string): MermaidFlowchartNode | null {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return null;
  }

  const shapedPatterns: Array<{ pattern: RegExp; shape: MermaidNodeShape }> = [
    { pattern: /^([A-Za-z0-9_:-]+)\(\((.+)\)\)$/, shape: "circle" },
    { pattern: /^([A-Za-z0-9_:-]+)\(\[(.+)\]\)$/, shape: "stadium" },
    { pattern: /^([A-Za-z0-9_:-]+)\{(.+)\}$/, shape: "diamond" },
    { pattern: /^([A-Za-z0-9_:-]+)\[(.+)\]$/, shape: "rect" },
    { pattern: /^([A-Za-z0-9_:-]+)\((.+)\)$/, shape: "stadium" }
  ];

  for (const { pattern, shape } of shapedPatterns) {
    const match = trimmedToken.match(pattern);

    if (match) {
      return {
        id: match[1] ?? "",
        label: match[2]?.trim() || match[1] || "",
        shape
      };
    }
  }

  const plainMatch = trimmedToken.match(/^([A-Za-z0-9_:-]+)$/);

  if (!plainMatch) {
    return null;
  }

  return {
    id: plainMatch[1] ?? "",
    label: plainMatch[1] ?? "",
    shape: "rect"
  };
}

function upsertMermaidFlowchartNode(
  nodes: Map<string, MermaidFlowchartNode>,
  node: MermaidFlowchartNode
) {
  const existingNode = nodes.get(node.id);

  if (!existingNode) {
    nodes.set(node.id, node);
    return;
  }

  if (existingNode.label === existingNode.id && node.label !== node.id) {
    nodes.set(node.id, node);
  }
}

function parseMermaidFlowchart(source: string): MermaidFlowchartDiagram | null {
  const normalizedLines = normalizeMermaidLines(source);
  const [header, ...statementLines] = normalizedLines;

  if (!header) {
    return null;
  }

  const [root, directionToken = "TD"] = header.split(/\s+/, 2);

  if (!MERMAID_FLOWCHART_ROOTS.has(root) || !MERMAID_FLOWCHART_DIRECTIONS.has(directionToken)) {
    return null;
  }

  const nodes = new Map<string, MermaidFlowchartNode>();
  const edges: MermaidFlowchartEdge[] = [];

  for (const statementLine of statementLines) {
    const edgeMatch = statementLine.match(/^(.*?)\s*(-->|==>|---|-.->)\s*(?:\|([^|]+)\|)?\s*(.+)$/);

    if (edgeMatch) {
      const fromNode = parseMermaidFlowchartNode(edgeMatch[1] ?? "");
      const toNode = parseMermaidFlowchartNode(edgeMatch[4] ?? "");

      if (!fromNode || !toNode) {
        return null;
      }

      upsertMermaidFlowchartNode(nodes, fromNode);
      upsertMermaidFlowchartNode(nodes, toNode);
      edges.push({
        from: fromNode.id,
        label: edgeMatch[3]?.trim() || null,
        to: toNode.id
      });
      continue;
    }

    const standaloneNode = parseMermaidFlowchartNode(statementLine);

    if (!standaloneNode) {
      return null;
    }

    upsertMermaidFlowchartNode(nodes, standaloneNode);
  }

  if (nodes.size === 0) {
    return null;
  }

  return {
    direction: directionToken as MermaidFlowchartDiagram["direction"],
    edges,
    nodes: Array.from(nodes.values())
  };
}

function getMermaidNodeBox(node: MermaidFlowchartNode) {
  const labelLength = Math.max(node.label.length, 4);
  const width = Math.min(240, Math.max(124, labelLength * 8 + 44));
  const height = node.shape === "diamond" ? 104 : node.shape === "circle" ? 84 : 72;

  return { height, width };
}

function renderMermaidFlowchartNode(node: MermaidFlowchartNode, centerX: number, centerY: number) {
  const { height, width } = getMermaidNodeBox(node);
  const x = centerX - width / 2;
  const y = centerY - height / 2;

  let shapeMarkup = "";

  if (node.shape === "diamond") {
    shapeMarkup = `<polygon class="markdown-mermaid-node__shape" points="${centerX},${y} ${x + width},${centerY} ${centerX},${y + height} ${x},${centerY}" />`;
  } else if (node.shape === "circle") {
    shapeMarkup = `<ellipse class="markdown-mermaid-node__shape" cx="${centerX}" cy="${centerY}" rx="${width / 2}" ry="${height / 2}" />`;
  } else {
    const radius = node.shape === "stadium" ? height / 2 : 18;
    shapeMarkup = `<rect class="markdown-mermaid-node__shape" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" />`;
  }

  return `<g class="markdown-mermaid-node" data-node-id="${escapeHtml(node.id)}">${shapeMarkup}<text class="markdown-mermaid-node__label" x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(node.label)}</text></g>`;
}

function renderMermaidFlowchartSvg(diagram: MermaidFlowchartDiagram) {
  const layoutByNodeId = new Map<string, { x: number; y: number }>();
  const indegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const node of diagram.nodes) {
    indegree.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of diagram.edges) {
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
    outgoing.get(edge.from)?.push(edge.to);
  }

  const queue = diagram.nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id);
  const layerByNodeId = new Map<string, number>();
  const visited = new Set<string>();

  while (queue.length > 0) {
    const nodeId = queue.shift();

    if (!nodeId) {
      continue;
    }

    visited.add(nodeId);
    const nodeLayer = layerByNodeId.get(nodeId) ?? 0;

    for (const targetNodeId of outgoing.get(nodeId) ?? []) {
      const nextLayer = Math.max(layerByNodeId.get(targetNodeId) ?? 0, nodeLayer + 1);
      layerByNodeId.set(targetNodeId, nextLayer);
      indegree.set(targetNodeId, (indegree.get(targetNodeId) ?? 0) - 1);

      if ((indegree.get(targetNodeId) ?? 0) === 0) {
        queue.push(targetNodeId);
      }
    }
  }

  let fallbackLayer = 0;
  for (const node of diagram.nodes) {
    if (!visited.has(node.id) && !layerByNodeId.has(node.id)) {
      layerByNodeId.set(node.id, fallbackLayer);
      fallbackLayer += 1;
    }
  }

  const layers = new Map<number, MermaidFlowchartNode[]>();
  for (const node of diagram.nodes) {
    const layer = layerByNodeId.get(node.id) ?? 0;
    const bucket = layers.get(layer) ?? [];
    bucket.push(node);
    layers.set(layer, bucket);
  }

  const sortedLayerEntries = Array.from(layers.entries()).sort((left, right) => left[0] - right[0]);
  const isHorizontal = diagram.direction === "LR" || diagram.direction === "RL";
  const shouldReverse = diagram.direction === "BT" || diagram.direction === "RL";
  const columnSize = 260;
  const rowSize = 152;
  const inset = 56;

  const primaryCount = Math.max(sortedLayerEntries.length, 1);
  const secondaryCount = Math.max(1, ...sortedLayerEntries.map(([, nodes]) => nodes.length));
  const width = isHorizontal ? inset * 2 + primaryCount * columnSize : inset * 2 + secondaryCount * columnSize;
  const height = isHorizontal ? inset * 2 + secondaryCount * rowSize : inset * 2 + primaryCount * rowSize;

  sortedLayerEntries.forEach(([layerIndex, layerNodes], entryIndex) => {
    const primaryIndex = shouldReverse ? primaryCount - entryIndex - 1 : entryIndex;

    layerNodes.forEach((node, nodeIndex) => {
      const secondaryIndex = nodeIndex;
      const x = isHorizontal
        ? inset + primaryIndex * columnSize + columnSize / 2
        : inset + secondaryIndex * columnSize + columnSize / 2;
      const y = isHorizontal
        ? inset + secondaryIndex * rowSize + rowSize / 2
        : inset + primaryIndex * rowSize + rowSize / 2;

      layoutByNodeId.set(node.id, { x, y });
    });
  });

  const nodeMarkup = diagram.nodes
    .map((node) => {
      const position = layoutByNodeId.get(node.id);

      if (!position) {
        return "";
      }

      return renderMermaidFlowchartNode(node, position.x, position.y);
    })
    .join("");

  const edgeMarkup = diagram.edges
    .map((edge) => {
      const fromNode = diagram.nodes.find((node) => node.id === edge.from);
      const toNode = diagram.nodes.find((node) => node.id === edge.to);
      const fromPosition = layoutByNodeId.get(edge.from);
      const toPosition = layoutByNodeId.get(edge.to);

      if (!fromNode || !toNode || !fromPosition || !toPosition) {
        return "";
      }

      const fromBox = getMermaidNodeBox(fromNode);
      const toBox = getMermaidNodeBox(toNode);
      const startX = isHorizontal
        ? fromPosition.x + (shouldReverse ? -fromBox.width / 2 : fromBox.width / 2)
        : fromPosition.x;
      const startY = isHorizontal
        ? fromPosition.y
        : fromPosition.y + (shouldReverse ? -fromBox.height / 2 : fromBox.height / 2);
      const endX = isHorizontal
        ? toPosition.x + (shouldReverse ? toBox.width / 2 : -toBox.width / 2)
        : toPosition.x;
      const endY = isHorizontal
        ? toPosition.y
        : toPosition.y + (shouldReverse ? toBox.height / 2 : -toBox.height / 2);
      const midpointX = isHorizontal ? (startX + endX) / 2 : startX;
      const midpointY = isHorizontal ? startY : (startY + endY) / 2;
      const path = isHorizontal
        ? `M ${startX} ${startY} L ${midpointX} ${startY} L ${midpointX} ${endY} L ${endX} ${endY}`
        : `M ${startX} ${startY} L ${startX} ${midpointY} L ${endX} ${midpointY} L ${endX} ${endY}`;
      const labelMarkup = edge.label
        ? `<text class="markdown-mermaid-edge__label" x="${midpointX}" y="${midpointY - 10}" text-anchor="middle">${escapeHtml(edge.label)}</text>`
        : "";

      return `<g class="markdown-mermaid-edge"><path class="markdown-mermaid-edge__path" d="${path}" marker-end="url(#mermaid-arrowhead)" />${labelMarkup}</g>`;
    })
    .join("");

  return `<svg class="markdown-mermaid-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Rendered Mermaid diagram" xmlns="http://www.w3.org/2000/svg"><defs><marker id="mermaid-arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path class="markdown-mermaid-edge__arrowhead" d="M 0 0 L 12 6 L 0 12 z" /></marker></defs><rect class="markdown-mermaid-svg__frame" x="1" y="1" width="${width - 2}" height="${height - 2}" rx="24" ry="24" />${edgeMarkup}${nodeMarkup}</svg>`;
}

function renderMermaidFallback(source: string) {
  const previewLines = getMermaidSourcePreview(source);
  const previewMarkup = previewLines.length > 0 ? escapeHtml(previewLines.join("\n")) : "Add Mermaid source inside the fenced block.";

  return `<figure class="markdown-mermaid markdown-mermaid--fallback"><div class="markdown-mermaid-shell"><div class="markdown-mermaid-shell__meta">Diagram preview unavailable</div><p class="markdown-mermaid-shell__body">The Mermaid block was kept as authored, but this diagram could not be rendered safely.</p><pre><code>${previewMarkup}</code></pre></div></figure>`;
}

function renderMermaidBlock(source: string) {
  if (!isProbablyValidMermaid(source)) {
    return renderMermaidFallback(source);
  }

  if (!MERMAID_FLOWCHART_ROOTS.has(getMermaidRoot(source))) {
    return renderMermaidFallback(source);
  }

  const diagram = parseMermaidFlowchart(source);

  if (!diagram) {
    return renderMermaidFallback(source);
  }

  return `<figure class="markdown-mermaid markdown-mermaid--rendered"><div class="markdown-mermaid-shell">${renderMermaidFlowchartSvg(diagram)}</div></figure>`;
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

export function renderMarkdownToHtml(markdown: string) {
  const normalizedLines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];

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
        blocks.push(renderMermaidBlock(codeLines.join("\n")));
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
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
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

      const quoteContent = quoteLines.map((quoteLine) => renderInlineMarkdown(quoteLine)).join("<br />");
      blocks.push(`<blockquote><p>${quoteContent}</p></blockquote>`);
      continue;
    }

    if (isUnorderedListItem(trimmedLine)) {
      const items: string[] = [];

      while (index < normalizedLines.length && isUnorderedListItem(normalizedLines[index].trim())) {
        items.push(`<li>${renderInlineMarkdown(normalizedLines[index].trim().replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }

      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (isOrderedListItem(trimmedLine)) {
      const items: string[] = [];

      while (index < normalizedLines.length && isOrderedListItem(normalizedLines[index].trim())) {
        items.push(`<li>${renderInlineMarkdown(normalizedLines[index].trim().replace(/^\d+\.\s+/, ""))}</li>`);
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
        const cells = headerCells.map((_, cellIndex) => `<td>${renderInlineMarkdown(rowCells[cellIndex] ?? "")}</td>`);
        bodyRows.push(`<tr>${cells.join("")}</tr>`);
        index += 1;
      }

      const header = headerCells.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("");
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

    const paragraphContent = paragraphLines.map((paragraphLine) => renderInlineMarkdown(paragraphLine)).join("<br />");
    blocks.push(`<p>${paragraphContent}</p>`);
  }

  return blocks.join("\n");
}
