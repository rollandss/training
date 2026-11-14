import { redirect } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { getCurrentUser } from "@/lib/auth";
import { comparisonPair, PHOTO_KIND_LABEL, PHOTO_MAX_PER_USER, parsePhotoKind, type PhotoKind } from "@/lib/photos/rules";
import { prisma } from "@/lib/prisma";
import { getUserProgramState } from "@/lib/program-day";
import { presignDownload, r2Configured } from "@/lib/r2";

import { CompareSlider } from "./compare-slider";
import { DeleteAllPhotosForm, PhotoDeleteForm } from "./photo-delete-form";
import { PhotoUploader } from "./photo-uploader";

export const metadata = { title: "Фото прогресу" };

const dateFmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Kyiv" });

function caption(p: { kind: string; dayNumber: number | null; createdAt: Date }) {
  const kind = PHOTO_KIND_LABEL[parsePhotoKind(p.kind) ?? "PROGRESS"];
  return p.dayNumber ? `${kind}, день ${p.dayNumber}` : kind;
}

export default async function PhotosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const configured = r2Configured();
  const [rows, state] = await Promise.all([
    prisma.progressPhoto.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, key: true, kind: true, dayNumber: true, width: true, height: true, createdAt: true },
    }),
    getUserProgramState(user.id),
  ]);
  const photos = configured
    ? await Promise.all(rows.map(async (p) => ({ ...p, src: await presignDownload(p.key) })))
    : [];

  const hasBefore = rows.some((p) => p.kind === "BEFORE");
  let defaultKind: PhotoKind = hasBefore ? "PROGRESS" : "BEFORE";
  if (state && state.day >= state.total) defaultKind = "AFTER";
  const pair = comparisonPair(photos);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Фото прогресу"
        description="Сфотографуйся перед стартом і потім раз на кілька тижнів — в одному місці, при тому ж світлі. Фото бачиш лише ти."
      />

      {!configured ? (
        <Panel tone="dashed">Сховище для фото ще не підключене. Адміністратор має задати змінні R2.</Panel>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Нове фото</CardTitle>
              <CardDescription>
                {rows.length} з {PHOTO_MAX_PER_USER}. Стань у повний зріст, камера на рівні грудей.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader defaultKind={defaultKind} />
            </CardContent>
          </Card>

          {pair ? (
            <Card>
              <CardHeader>
                <CardTitle>Було і стало</CardTitle>
              </CardHeader>
              <CardContent>
                <CompareSlider
                  before={{ src: pair[0].src, label: caption(pair[0]) }}
                  after={{ src: pair[1].src, label: caption(pair[1]) }}
                />
              </CardContent>
            </Card>
          ) : null}

          {photos.length ? (
            <section aria-labelledby="gallery" className="space-y-4">
              <h2 id="gallery" className="font-display text-2xl font-bold">
                Усі фото
              </h2>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {photos.map((p) => (
                  <li key={p.id} className="overflow-hidden rounded-[var(--radius)] border-2 border-border bg-card">
                    <a href={p.src} target="_blank" rel="noreferrer" className="block aspect-[3/4] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived R2 URLs */}
                      <img
                        src={p.src}
                        alt={caption(p)}
                        width={p.width}
                        height={p.height}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </a>
                    <div className="flex items-start justify-between gap-2 p-2">
                      <div className="min-w-0 text-sm">
                        <div className="font-bold">{caption(p)}</div>
                        <div className="text-muted-foreground">{dateFmt.format(p.createdAt)}</div>
                      </div>
                      <PhotoDeleteForm photoId={p.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <Panel tone="dashed">Поки жодного фото. Почни з фото «до старту» — через 100 днів буде з чим порівняти.</Panel>
          )}

          {photos.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Видалити фото</CardTitle>
                <CardDescription>Фото видаляються зі сховища одразу і назавжди.</CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteAllPhotosForm />
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
