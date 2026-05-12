export function stripHtmlTags(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function postBodyLooksLikeHtml(body: string) {
  return /<\/?[a-z][\s\S]*>/i.test(body);
}

export function excerptPostBody(body: string, maxLength = 220) {
  const normalized = stripHtmlTags(body);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export function postBodyToPlainText(body: string) {
  if (!postBodyLooksLikeHtml(body)) return body.trim();
  return stripHtmlTags(body);
}
