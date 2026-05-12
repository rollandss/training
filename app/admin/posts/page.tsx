import { createPostAction, deletePostAction, updatePostAction } from "@/app/admin/actions";
import { AdminPostsTabs } from "@/components/admin-posts-tabs";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapPostEditor } from "@/components/tiptap-post-editor";
import { getPostBlockLabel, parsePostBlockSlug, POST_BLOCKS, POST_BLOCK_LABELS, type PostBlock } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ slug?: string; block?: string }>;
};

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
  const createBlockDefault = activeBlock ?? "PREPARATION";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Пости</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {activeBlock === "PREPARATION"
            ? "Підготовчі пости без номера дня. Оберіть запис у списку або створіть новий."
            : "У списку лише метадані, редагується один обраний пост."}
        </p>
      </div>

      <AdminPostsTabs active={activeBlock ?? "ALL"} slug={selectedPost?.slug} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Новий пост</CardTitle>
          <CardDescription>
            `slug` має бути унікальний. `dayNumber` лишайте порожнім для підготовчих постів.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPostAction} className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="create-slug">Slug</Label>
                <Input id="create-slug" name="slug" placeholder="prep-intro або day-101" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-day">День (1-100)</Label>
                <Input id="create-day" name="dayNumber" type="number" min={1} max={100} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-block">Блок</Label>
                <select
                  id="create-block"
                  name="block"
                  className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                  defaultValue={createBlockDefault}
                >
                  {POST_BLOCKS.map((block) => (
                    <option key={block} value={block}>
                      {POST_BLOCK_LABELS[block]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-title">Заголовок</Label>
              <Input id="create-title" name="titleUk" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-image-url">Фото посту (URL)</Label>
              <Input id="create-image-url" name="imageUrl" placeholder="https://..." />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-body">Тіло поста</Label>
              <TiptapPostEditor
                key="create-post"
                id="create-body"
                name="bodyUk"
                editorKey="create-post"
                minHeightClassName="min-h-[220px]"
              />
            </div>
            <SubmitButton className="w-fit">Створити пост</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Список постів</CardTitle>
            <CardDescription>
              {posts.length} записів
              {activeBlock ? ` · ${getPostBlockLabel(activeBlock)}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[70vh] space-y-2 overflow-auto pr-2">
            {posts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {activeBlock === "PREPARATION"
                  ? "Підготовчих постів ще немає. Створіть їх вище або запустіть seed."
                  : "У цьому блоці ще немає постів."}
              </p>
            ) : null}
            {posts.map((post) => {
              const active = selectedPost?.id === post.id;
              return (
                <Link
                  key={post.id}
                  href={adminPostsHref(activeBlock, post.slug)}
                  className={cn(
                    "block rounded-md border p-2 text-sm",
                    active ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                  )}
                >
                  <div className="font-medium leading-tight">{post.titleUk}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {getPostBlockLabel(post.block)} · {post.dayNumber ? `день ${post.dayNumber}` : "без дня"}
                  </div>
                  <div className="text-muted-foreground mt-1 truncate font-mono text-[11px]">{post.slug}</div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Редагування</CardTitle>
            <CardDescription>
              {selectedPost ? `Поточний: ${selectedPost.slug}` : "Оберіть пост зі списку ліворуч"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPost ? (
              <div className="space-y-3">
                <form key={selectedPost.id} action={updatePostAction} className="grid gap-3">
                  <input type="hidden" name="id" value={selectedPost.id} />
                  <div className="grid gap-2 md:grid-cols-3">
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
                    <div className="grid gap-1.5 md:col-span-2">
                      <Label htmlFor="selected-title">Заголовок</Label>
                      <Input id="selected-title" name="titleUk" defaultValue={selectedPost.titleUk} required />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="selected-block">Блок</Label>
                    <select
                      id="selected-block"
                      name="block"
                      className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                      defaultValue={selectedPost.block}
                    >
                      {POST_BLOCKS.map((block) => (
                        <option key={block} value={block}>
                          {POST_BLOCK_LABELS[block]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="selected-image-url">Фото посту (URL)</Label>
                    <Input
                      id="selected-image-url"
                      name="imageUrl"
                      defaultValue={selectedPost.imageUrl ?? ""}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="selected-body">Тіло</Label>
                    <TiptapPostEditor
                      key={selectedPost.id}
                      id="selected-body"
                      name="bodyUk"
                      editorKey={selectedPost.id}
                      defaultValue={selectedPost.bodyUk}
                      minHeightClassName="min-h-[360px]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SubmitButton variant="secondary" className="w-fit">
                      Зберегти
                    </SubmitButton>
                  </div>
                </form>
                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={selectedPost.id} />
                  <SubmitButton variant="destructive" className="w-fit" pendingLabel="Видаляю...">
                    Видалити
                  </SubmitButton>
                </form>
              </div>
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
