import { notFound, redirect } from "next/navigation";

import { getPostBlockSlug, parsePostBlockSlug } from "@/lib/posts";

// Blocks now live as sections of /app/posts; keep old links working.
export default async function PostsBlockPage({ params }: { params: Promise<{ block: string }> }) {
  const { block: slug } = await params;
  const block = parsePostBlockSlug(slug);
  if (!block) notFound();
  redirect(`/app/posts#${getPostBlockSlug(block)}`);
}
