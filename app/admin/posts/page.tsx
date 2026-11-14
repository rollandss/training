import { deletePostAction, updatePostAction } from "@/app/admin/actions";
import { AdminPostsTabs } from "@/components/admin-posts-tabs";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PageHeader } from "@/components/page-header";
import { pluralUk } from "@/lib/plural";
import { NativeSelect } from "@/components/ui/native-select";
import { Panel } from "@/components/ui/panel";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapPostEditor } from "@/components/tiptap-post-editor";
import { postBodyToHtml } from "@/lib/post-html";
import { getPostBlockLabel, parsePostBlockSlug, POST_BLOCKS, POST_BLOCK_LABELS, type PostBlock } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ slug?: string; block?: string }>;
};

function adminNewPostHref(block: PostBlock | null) {
  const params = new URLSearchParams();
  if (block) params.set("block", block.toLowerCase());
  const query = params.toString();
  return query ? `/admin/posts/new?${query}` : "/admin/posts/new";
}

function adminPostsHref(block: PostBlock | null, slug?: string) {
  const params = new URLSearchParams();
  if (block) params.set("block", block.toLowerCase());
  if (slug) params.set("slug", slug);
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export default async function AdminPostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeBlock = params.block ? parsePostBlockSlug(params.block) : null;
  const posts = await prisma.dailyPost.findMany({
    where: activeBlock ? { block: activeBlock } : undefined,
    select: {
      id: true,
      slug: true,
      titleUk: true,
      block: true,
      dayNumber: true,
      createdAt: true,
    },
    orderBy: [{ dayNumber: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
  });
  const selectedSlug =
    params.slug && posts.some((post) => post.slug === params.slug) ? params.slug : posts[0]?.slug;
  const selectedPost = selectedSlug
    ? await prisma.dailyPost.findUnique({
        where: { slug: selectedSlug },
      })
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Пости"
        description={
          activeBlock === "PREPARATION"
            ? "Підготовчі пости без номера дня."
            : "Обери пост у списку, щоб відредагувати його."
        }
        actions={
          <Link href={adminNewPostHref(activeBlock)} className={cn(buttonVariants())}>
            Новий пост
          </Link>
        }
      />

      <AdminPostsTabs active={activeBlock ?? "ALL"} slug={selectedPost?.slug} />

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Список</CardTitle>
            <CardDescription>
              {posts.length} {pluralUk(posts.length, ["пост", "пости", "постів"])}
              {activeBlock ? ` · ${getPostBlockLabel(activeBlock)}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[65vh] overflow-auto">
            {posts.length === 0 ? (
              <Panel tone="dashed" className="text-sm font-medium">
                {activeBlock === "PREPARATION" ? "Підготовчих постів ще немає." : "У цьому блоці ще немає постів."}
              </Panel>
            ) : (
              <ul className="grid gap-2">
                {posts.map((post) => {
                  const active = selectedPost?.id === post.id;
                  return (
                    <li key={post.id}>
                      <Link
                        href={adminPostsHref(activeBlock, post.slug)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "block rounded-[var(--radius)] border-2 border-border px-3 py-2 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
                          active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                        )}
                      >
                        <div className="font-bold leading-tight">{post.titleUk}</div>
                        <div className={cn("mt-1 text-xs", active ? "" : "text-muted-foreground")}>
                          {getPostBlockLabel(post.block)} · {post.dayNumber ? `день ${post.dayNumber}` : "без дня"} · {post.slug}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedPost ? selectedPost.titleUk : "Редагування"}</CardTitle>
            <CardDescription>{selectedPost ? selectedPost.slug : "Обери пост зі списку."}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPost ? (
              <form key={selectedPost.id} action={updatePostAction} className="grid gap-4">
                <input type="hidden" name="id" value={selectedPost.id} />
                <div className="grid gap-4 md:grid-cols-[8rem_minmax(0,1fr)_12rem]">
                  <div className="grid gap-1.5">
                    <Label htmlFor="selected-day">День</Label>
                    <Input
                      id="selected-day"
                      name="dayNumber"
                      type="number"
                      min={1}
                      max={100}
                      defaultValue={selectedPost.dayNumber ?? ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="selected-title">Заголовок</Label>
                    <Input id="selected-title" name="titleUk" defaultValue={selectedPost.titleUk} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="selected-block">Блок</Label>
                    <NativeSelect id="selected-block" name="block" defaultValue={selectedPost.block}>
                      {POST_BLOCKS.map((block) => (
                        <option key={block} value={block}>
                          {POST_BLOCK_LABELS[block]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="selected-image-url">Обкладинка (URL)</Label>
                  <Input
                    id="selected-image-url"
                    name="imageUrl"
                    defaultValue={selectedPost.imageUrl ?? ""}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="selected-body">Текст</Label>
                  <TiptapPostEditor
                    key={selectedPost.id}
                    id="selected-body"
                    name="bodyUk"
                    editorKey={selectedPost.id}
                    // Legacy markdown bodies are converted so TipTap keeps their structure; saving stores HTML.
                    defaultValue={postBodyToHtml(selectedPost.bodyUk)}
                    minHeightClassName="min-h-[360px]"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border pt-4">
                  <SubmitButton className="w-fit" pendingLabel="Зберігаю...">
                    Зберегти пост
                  </SubmitButton>
                  <ConfirmSubmitButton
                    confirmText="Видалити цей пост назавжди?"
                    formAction={deletePostAction}
                    formNoValidate
                    variant="destructive"
                    size="sm"
                    className="w-fit"
                    pendingLabel="Видаляю..."
                  >
                    Видалити пост
                  </ConfirmSubmitButton>
                </div>
              </form>
            ) : (
              <Link href="/admin/posts" className={cn(buttonVariants({ variant: "outline" }))}>
                Оновити список
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
