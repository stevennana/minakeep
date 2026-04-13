const MERMAID_SUPPORTED_ROOTS = [
  "flowchart",
  "graph",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "stateDiagram-v2"
] as const;
const MERMAID_MAX_SOURCE_PREVIEW_LINES = 8;
const MERMAID_MAX_LINE_LENGTH = 72;

type MermaidRenderState = "fallback" | "pending" | "rendered";

type MermaidShellResult = {
  issue?: "syntax";
  markup: string;
  state: MermaidRenderState;
};

type MermaidEnhancementSummary = {
  syntaxIssueCount: number;
};

type MermaidModule = typeof import("mermaid").default;

let mermaidLoadPromise: Promise<MermaidModule> | null = null;
let mermaidIdCounter = 0;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clampPreviewLine(value: string, maxLength = MERMAID_MAX_LINE_LENGTH) {
  const trimmedValue = value.trimEnd();

  if (trimmedValue.length <= maxLength) {
    return trimmedValue;
  }

  return `${trimmedValue.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function getSourcePreview(source: string, maxLines = MERMAID_MAX_SOURCE_PREVIEW_LINES) {
  const sourceLines = source
    .trim()
    .split("\n")
    .map((line) => clampPreviewLine(line))
    .filter((line) => line.length > 0);

  if (sourceLines.length <= maxLines) {
    return sourceLines;
  }

  return [...sourceLines.slice(0, maxLines), `... +${sourceLines.length - maxLines} more line(s)`];
}

function getMermaidRoot(source: string) {
  const normalizedLines = source
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("%%"));
  const [firstLine = ""] = normalizedLines;

  return firstLine.split(/\s+/, 1)[0] ?? "";
}

function isSupportedRoot(root: string): root is (typeof MERMAID_SUPPORTED_ROOTS)[number] {
  return MERMAID_SUPPORTED_ROOTS.includes(root as (typeof MERMAID_SUPPORTED_ROOTS)[number]);
}

function getFallbackShellMarkup(
  source: string,
  {
    body = "The Mermaid block was kept as authored, but this diagram could not be rendered safely.",
    includeSourcePreview = true,
    meta = "Diagram preview unavailable"
  }: { body?: string; includeSourcePreview?: boolean; meta?: string } = {}
) {
  const previewLines = getSourcePreview(source);
  const previewMarkup =
    previewLines.length > 0 ? escapeHtml(previewLines.join("\n")) : "Add Mermaid source inside the fenced block.";
  const hiddenPreviewMarkup =
    previewLines.length > 0
      ? escapeHtml(previewLines.map(() => "Mermaid source preview hidden.").join("\n"))
      : "Mermaid source preview hidden.";
  const previewBlockMarkup = includeSourcePreview
    ? `<pre><code>${previewMarkup}</code></pre>`
    : `<pre><code>${hiddenPreviewMarkup}</code></pre>`;

  return `<div class="markdown-mermaid-shell__meta">${escapeHtml(meta)}</div><p class="markdown-mermaid-shell__body">${escapeHtml(body)}</p>${previewBlockMarkup}`;
}

function getRenderedShellMarkup(svg: string) {
  return sanitizeRenderedSvg(svg);
}

export function getMermaidBlockMarkup(source: string) {
  const root = getMermaidRoot(source);

  if (!isSupportedRoot(root)) {
    return `<figure class="markdown-mermaid markdown-mermaid--fallback"><div class="markdown-mermaid-shell">${getFallbackShellMarkup(source)}</div></figure>`;
  }

  const encodedSource = escapeHtml(encodeURIComponent(source));

  return `<figure class="markdown-mermaid markdown-mermaid--pending" data-mermaid-source="${encodedSource}"><div class="markdown-mermaid-shell">${getFallbackShellMarkup(source, {
    body: "Rendering Mermaid diagram from the saved markdown source.",
    meta: "Diagram preview loading"
  })}</div></figure>`;
}

function sanitizeRenderedSvg(svg: string) {
  const withoutUnsafeTags = svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
  const withoutUnsafeAttrs = withoutUnsafeTags
    .replace(/\s+on[a-z-]+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s+(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "");
  const paddedForeignObjects = withoutUnsafeAttrs.replace(
    /<foreignObject\b([^>]*?)\bheight=(["'])(\d+(?:\.\d+)?)\2([^>]*)>/gi,
    (_match, before: string, quote: string, rawHeight: string, after: string) => {
      const height = Number.parseFloat(rawHeight);

      if (!Number.isFinite(height)) {
        return `<foreignObject${before}height=${quote}${rawHeight}${quote}${after}>`;
      }

      return `<foreignObject${before}height=${quote}${Math.ceil(height + 6)}${quote}${after}>`;
    }
  );

  return paddedForeignObjects.replace(/<svg\b([^>]*)>/i, (_match, attributes: string) => {
    const classMatch = attributes.match(/\bclass=(["'])(.*?)\1/i);
    const nextClassName = classMatch
      ? classMatch[2]
          .split(/\s+/)
          .filter(Boolean)
          .concat("markdown-mermaid-svg")
          .filter((value, index, values) => values.indexOf(value) === index)
          .join(" ")
      : "markdown-mermaid-svg";
    const withoutClass = attributes.replace(/\s*\bclass=(["']).*?\1/i, "");
    const withRole = /\brole=/.test(withoutClass) ? withoutClass : `${withoutClass} role="img"`;
    const withLabel = /\baria-label=/.test(withRole) ? withRole : `${withRole} aria-label="Rendered Mermaid diagram"`;

    return `<svg class="${escapeHtml(nextClassName)}"${withLabel}>`;
  });
}

async function loadMermaid() {
  if (!mermaidLoadPromise) {
    mermaidLoadPromise = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        securityLevel: "strict",
        startOnLoad: false,
        theme: "neutral"
      });

      return mermaid;
    });
  }

  return mermaidLoadPromise;
}

async function renderMermaidSvg(source: string) {
  const mermaid = await loadMermaid();
  const renderId = `minakeep-mermaid-${mermaidIdCounter += 1}`;

  try {
    const { svg } = await mermaid.render(renderId, source);

    return sanitizeRenderedSvg(svg);
  } finally {
    if (typeof document !== "undefined") {
      document.getElementById(renderId)?.remove();
      document.getElementById(`d${renderId}`)?.remove();
    }
  }
}

export async function renderMermaidShell(
  source: string,
  renderSvg: (diagramSource: string) => Promise<string> = renderMermaidSvg
): Promise<MermaidShellResult> {
  try {
    return {
      markup: getRenderedShellMarkup(await renderSvg(source)),
      state: "rendered"
    };
  } catch {
    return {
      issue: isSupportedRoot(getMermaidRoot(source)) ? "syntax" : undefined,
      markup: getFallbackShellMarkup(source),
      state: "fallback"
    };
  }
}

export async function enhanceMermaidFigures(root: ParentNode): Promise<MermaidEnhancementSummary> {
  const figures = Array.from(root.querySelectorAll<HTMLElement>(".markdown-mermaid[data-mermaid-source]"));
  let syntaxIssueCount = 0;
  const hideSyntaxFallbackSource =
    root instanceof HTMLElement && root.dataset.hideMermaidSyntaxFallbackSource === "true";

  for (const figure of figures) {
    const encodedSource = figure.dataset.mermaidSource;

    if (!encodedSource) {
      continue;
    }

    const source = decodeURIComponent(encodedSource);
    const shell = figure.querySelector<HTMLElement>(".markdown-mermaid-shell");

    if (!shell) {
      continue;
    }

    const result = await renderMermaidShell(source);
    shell.innerHTML =
      result.issue === "syntax" && hideSyntaxFallbackSource
        ? getFallbackShellMarkup(source, {
            body: "The Mermaid block was kept as authored, but this diagram could not be rendered safely.",
            includeSourcePreview: false
          })
        : result.markup;
    figure.classList.remove("markdown-mermaid--pending", "markdown-mermaid--fallback", "markdown-mermaid--rendered");
    figure.classList.add(`markdown-mermaid--${result.state}`);

    if (result.issue) {
      figure.dataset.mermaidIssue = result.issue;
      if (result.issue === "syntax") {
        syntaxIssueCount += 1;
      }
    } else {
      delete figure.dataset.mermaidIssue;
    }
  }

  return {
    syntaxIssueCount
  };
}
