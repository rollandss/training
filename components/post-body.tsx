import { postBodyLooksLikeHtml } from "@/lib/post-text";
import { cn } from "@/lib/utils";

type PostBodyProps = {
  body: string;
  className?: string;
};

export function PostBody({ body, className }: PostBodyProps) {
  if (postBodyLooksLikeHtml(body)) {
    return (
      <article
        className={cn("post-body text-base leading-7 text-foreground/95 md:text-lg md:leading-8", className)}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  return (
    <article className={cn("whitespace-pre-wrap text-base leading-7 text-foreground/95 md:text-lg md:leading-8", className)}>
      {body}
    </article>
  );
}
