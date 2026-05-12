import Link from "next/link";

import { createPostAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapPostEditor } from "@/components/tiptap-post-editor";
import { parsePostBlockSlug, POST_BLOCKS, POST_BLOCK_LABELS } from "@/lib/posts";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ block?: string }>;
};

export default async function AdminNewPostPage({ searchParams }: Props) {
  const params = await searchParams;
  const activeBlock = params.block ? parsePostBlockSlug(params.block) : null;
  const createBlockDefault = activeBlock ?? "PREPARATION";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Новий пост</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            `slug` має бути унікальний. `dayNumber` лишайте порожнім для підготовчих постів.
          </p>
        </div>
        <Link href="/admin/posts" className={cn(buttonVariants({ variant: "outline" }))}>
          До списку постів
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Створення</CardTitle>
          <CardDescription>Заповніть поля й збережіть новий запис.</CardDescription>
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
                minHeightClassName="min-h-[280px]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <SubmitButton className="w-fit">Створити пост</SubmitButton>
              <Link href="/admin/posts" className={cn(buttonVariants({ variant: "outline" }))}>
                Скасувати
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
