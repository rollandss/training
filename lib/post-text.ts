export function stripHtmlTags(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * TipTap output always starts with a tag; seeded markdown starts with "# Title".
 * (Matching any tag anywhere misfired on markdown that contained stray markup.)
 */
export function postBodyLooksLikeHtml(body: string) {
  return body.trimStart().startsWith("<");
}

/** Rough markdown → text for excerpts and plain-text emails (no parser needed on the client). */
export function stripMarkdown(md: string) {
  return md
    .replace(/^\s*#\s+.*$/m, "") // leading H1 duplicates the post title
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|_|~~|`)/g, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function toPlain(body: string) {
  return postBodyLooksLikeHtml(body) ? stripHtmlTags(body) : stripMarkdown(body);
}

export function excerptPostBody(body: string, maxLength = 220) {
  const normalized = toPlain(body).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function postBodyToPlainText(body: string) {
  return toPlain(body);
}
