import Link from "next/link";

import { createPostAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-8">
      <PageHeader
        kicker={
          <Link href="/admin/posts" className="underline decoration-2 underline-offset-4 hover:no-underline">
            ← Усі пости
          </Link>
        }
        title="Новий пост"
        description="Адресу (slug) роби унікальною. Для підготовчих постів день лишай порожнім."
      />

      <Card>
        <CardContent>
          <form action={createPostAction} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_8rem_12rem]">
              <div className="grid gap-1.5">
                <Label htmlFor="create-slug">Адреса (slug)</Label>
                <Input id="create-slug" name="slug" placeholder="day-12 або prep-intro" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-day">День</Label>
                <Input id="create-day" name="dayNumber" type="number" min={1} max={100} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-block">Блок</Label>
                <NativeSelect id="create-block" name="block" defaultValue={createBlockDefault}>
                  {POST_BLOCKS.map((block) => (
                    <option key={block} value={block}>
                      {POST_BLOCK_LABELS[block]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-title">Заголовок</Label>
              <Input id="create-title" name="titleUk" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-image-url">Обкладинка (URL)</Label>
              <Input id="create-image-url" name="imageUrl" placeholder="https://..." />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-body">Текст</Label>
              <TiptapPostEditor
                key="create-post"
                id="create-body"
                name="bodyUk"
                editorKey="create-post"
                minHeightClassName="min-h-[280px]"
              />
            </div>
            <div className="flex flex-wrap gap-3 border-t-2 border-border pt-4">
              <SubmitButton className="w-fit" pendingLabel="Створюю...">
                Створити пост
              </SubmitButton>
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
