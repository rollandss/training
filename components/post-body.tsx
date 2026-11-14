import "server-only";

import { postBodyToHtml } from "@/lib/post-html";
import { cn } from "@/lib/utils";

type PostBodyProps = {
  body: string;
  className?: string;
};

export function PostBody({ body, className }: PostBodyProps) {
  return (
    <article
      className={cn("post-body text-base leading-7 md:text-lg md:leading-8", className)}
      dangerouslySetInnerHTML={{ __html: postBodyToHtml(body) }}
    />
  );
}
