import "server-only";

import { marked } from "marked";

import { postBodyLooksLikeHtml } from "@/lib/post-text";
import { sanitizePostHtml } from "@/lib/sanitize-post";

/** Posts imported from posts_uk_md start with "# <title>", which the page already shows. */
function dropLeadingH1(html: string) {
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
}

/**
 * Converts a stored post body (TipTap HTML or legacy markdown) to safe HTML.
 * `breaks: true` keeps the single line breaks the markdown files rely on.
 */
export function postBodyToHtml(body: string) {
  const html = postBodyLooksLikeHtml(body)
    ? body
    : (marked.parse(body, { gfm: true, breaks: true, async: false }) as string);
  return sanitizePostHtml(dropLeadingH1(html));
}
