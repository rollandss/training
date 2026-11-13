import sanitizeHtml from "sanitize-html";

const ALIGN = [/^(left|center|right|justify)$/];

/**
 * Whitelist matching what the TipTap editor produces.
 * Applied on save (admin actions) and on render (PostBody) so old rows are covered too.
 */
export function sanitizePostHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr", "h1", "h2", "h3", "h4",
      "strong", "b", "em", "i", "u", "s", "mark", "code", "pre", "blockquote",
      "ul", "ol", "li", "a", "img", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["style"],
    },
    allowedStyles: {
      "*": { "text-align": ALIGN },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}
