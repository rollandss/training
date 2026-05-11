import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { promises as fs } from "node:fs";
import path from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const WEEK = [
  "WORKOUT",
  "WORKOUT",
  "REST",
  "WORKOUT",
  "WORKOUT",
  "WORKOUT",
  "REST",
] as const;

function phase(day: number): 1 | 2 | 3 | 4 {
  if (day <= 20) return 1;
  if (day <= 50) return 2;
  if (day <= 80) return 3;
  return 4;
}

function pullsReps(p: 1 | 2 | 3 | 4, light: boolean): string {
  const bases: [number, number][] = [
    [6, 10],
    [8, 12],
    [10, 14],
    [8, 12],
  ];
  let [a, b] = bases[p - 1];
  if (light) {
    a = Math.max(4, a - 2);
    b = Math.max(a + 1, b - 2);
  }
  return `${a}–${b}`;
}

function pushReps(p: 1 | 2 | 3 | 4, light: boolean): string {
  const bases: [number, number][] = [
    [8, 12],
    [10, 14],
    [10, 16],
    [8, 12],
  ];
  let [a, b] = bases[p - 1];
  if (light) {
    a = Math.max(6, a - 2);
    b = Math.max(a + 1, b - 2);
  }
  return `${a}–${b}`;
}

function plankTime(p: 1 | 2 | 3 | 4, light: boolean): string {
  const sec = [30, 40, 50, 45][p - 1] + (light ? -10 : 0);
  return `${Math.max(20, sec)} сек`;
}

function sidePlankTime(p: 1 | 2 | 3 | 4, light: boolean): string {
  const sec = [20, 25, 35, 30][p - 1] + (light ? -5 : 0);
  return `${Math.max(15, sec)} сек на бік`;
}

function blockByDay(day: number): string {
  if (day >= 1 && day <= 49) return "BASIC";
  if (day >= 50 && day <= 91) return "ADVANCED";
  if (day >= 92 && day <= 98) return "TURBO";
  return "CONCLUSION";
}

function parsePostTitle(content: string, fallback: string) {
  const firstLine = content.split("\n").find((line) => line.trim().length > 0);
  if (!firstLine) return fallback;
  if (firstLine.trim().startsWith("#")) {
    return firstLine.replace(/^#+\s*/, "").trim() || fallback;
  }
  return fallback;
}

function defaultPostImage(dayNumber: number | null) {
  if (dayNumber === null) {
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80";
}

type Ids = Record<string, string>;

function workoutBlocks(
  tpl: 0 | 1 | 2,
  p: 1 | 2 | 3 | 4,
  light: boolean,
  ids: Ids,
  setsMain: number,
) {
  const restMain = light ? 75 : 90;
  const rows: Array<{
    exerciseId: string;
    sortOrder: number;
    sets: number;
    reps: string;
    restSec: number | null;
    coachingUk: string | null;
  }> = [
    {
      exerciseId: ids["warmup-shoulders"],
      sortOrder: 0,
      sets: 1,
      reps: "5–8 хв",
      restSec: null,
      coachingUk: "Плавно розігрій плечі, лопатки й зап’ястя перед навантаженням.",
    },
  ];

  if (tpl === 0) {
    rows.push(
      {
        exerciseId: ids["australian-pull"],
        sortOrder: 1,
        sets: setsMain,
        reps: pullsReps(p, light),
        restSec: restMain,
        coachingUk: "Грудь ближче до перекладини, лопатки вниз-назад.",
      },
      {
        exerciseId: ids["squat"],
        sortOrder: 2,
        sets: setsMain,
        reps: pullsReps(p, light),
        restSec: restMain,
        coachingUk: "Коліна по лінії стоп, спина нейтральна.",
      },
      {
        exerciseId: ids["plank"],
        sortOrder: 3,
        sets: setsMain,
        reps: plankTime(p, light),
        restSec: 60,
        coachingUk: "Напружте прес, сідниці без «горба».",
      },
    );
  } else if (tpl === 1) {
    rows.push(
      {
        exerciseId: ids["pushup"],
        sortOrder: 1,
        sets: setsMain,
        reps: pushReps(p, light),
        restSec: restMain,
        coachingUk: "Лікті під кутом ~45°, корпус однією лінією.",
      },
      {
        exerciseId: ids["lunge"],
        sortOrder: 2,
        sets: setsMain,
        reps: `${Math.max(6, 8 + (p - 1) * 2)}–${Math.max(8, 12 + (p - 1) * 2)} на ногу`,
        restSec: restMain,
        coachingUk: "Коліно не завалюється всередину, крок контрольований.",
      },
      {
        exerciseId: ids["side-plank"],
        sortOrder: 3,
        sets: 2,
        reps: sidePlankTime(p, light),
        restSec: 45,
        coachingUk: "Таз не «провалюється» — тримайте лінію плече-таз-стопи.",
      },
    );
  } else {
    rows.push(
      {
        exerciseId: ids["scapula-pull"],
        sortOrder: 1,
        sets: 2,
        reps: `${6 + p}–${10 + p}`,
        restSec: 60,
        coachingUk: "Рух лише лопатками, без підйому плечей до вух.",
      },
      {
        exerciseId: ids["australian-pull"],
        sortOrder: 2,
        sets: Math.max(2, setsMain - 1),
        reps: pullsReps(p, true),
        restSec: restMain,
        coachingUk: "Трохи менший обсяг — фокус на техніці.",
      },
      {
        exerciseId: ids["pushup-incline"],
        sortOrder: 3,
        sets: setsMain,
        reps: pushReps(p, light),
        restSec: restMain,
        coachingUk: "Чим вища опора, тим легше — регулюйте висоту.",
      },
      {
        exerciseId: ids["plank"],
        sortOrder: 4,
        sets: 2,
        reps: plankTime(p, true),
        restSec: 60,
        coachingUk: "Короткі якісні серії.",
      },
    );
  }

  return rows;
}

function basicBlockFromFirstPost(ids: Ids, workoutOrdinal: number) {
  // "Суть" з дня 1: старт 1-2-2-2, 4 кола, 60 сек відпочинку.
  // Навантаження нарощується поступово.
  const pullBase = Math.min(1 + Math.floor((workoutOrdinal - 1) / 3), 10);
  const squatBase = pullBase * 2;
  const pushBase = pullBase * 2;

  return [
    {
      exerciseId: ids["warmup-shoulders"],
      sortOrder: 0,
      sets: 1,
      reps: "5–8 хв",
      restSec: null,
      coachingUk: "Обов'язкова розминка перед колами.",
    },
    {
      exerciseId: ids["australian-pull"],
      sortOrder: 1,
      sets: 4,
      reps: String(pullBase),
      restSec: 60,
      coachingUk:
        "Коло 1/4: підтягування (або полегшений варіант). Базова логіка 1-2-2-2, додавай за самопочуттям.",
    },
    {
      exerciseId: ids["squat"],
      sortOrder: 2,
      sets: 4,
      reps: String(squatBase),
      restSec: 60,
      coachingUk: "Коло 2/4: присідання. Якість руху важливіша за цифри.",
    },
    {
      exerciseId: ids["pushup"],
      sortOrder: 3,
      sets: 4,
      reps: String(pushBase),
      restSec: 60,
      coachingUk: "Коло 3/4: віджимання. Тримай однакові повторення в усіх колах.",
    },
    {
      exerciseId: ids["squat"],
      sortOrder: 4,
      sets: 4,
      reps: String(squatBase),
      restSec: 60,
      coachingUk: "Коло 4/4: другий блок присідань, як у схемі 1-2-2-2.",
    },
  ];
}

async function main() {
  const exerciseDefs = [
    {
      slug: "warmup-shoulders",
      nameUk: "Розминка плечового поясу",
      descriptionUk:
        "Круги плечима, лопаткові підйоми/опускання, легкі оберти передплічь. Мета — підготувати плечі й зап’ястя до турніка та віджимань.",
    },
    {
      slug: "scapula-pull",
      nameUk: "Вис з активацією лопаток",
      descriptionUk:
        "Виси на турніку, лопатки вниз-назад без згину рук. Тренує контроль лопаток перед підтягуваннями.",
    },
    {
      slug: "australian-pull",
      nameUk: "Австралійські підтягування",
      descriptionUk:
        "Тіло прямою лінією, грудь до перекладини. Полегшення — вища перекладина; ускладнення — нижча.",
    },
    {
      slug: "pullup-negative",
      nameUk: "Негативні підтягування",
      descriptionUk:
        "Підстрибніть наверх і повільно опускайтесь 3–5 секунд. Для переходу до повних підтягувань.",
    },
    {
      slug: "pushup",
      nameUk: "Віджимання від підлоги",
      descriptionUk:
        "Корпус прямий, лікті не розвалюйте дуже широко. Полегшення — з колін або з опори.",
    },
    {
      slug: "pushup-incline",
      nameUk: "Віджимання з опори",
      descriptionUk:
        "Руки на лавці/сходинці. Зменшуйте кут тіла, щоб ускладнювати.",
    },
    {
      slug: "squat",
      nameUk: "Присідання з вагою тіла",
      descriptionUk:
        "Коліна слідують за шкарпетками, глибина комфортна. Тримаємо нейтральну спину.",
    },
    {
      slug: "lunge",
      nameUk: "Випади назад",
      descriptionUk:
        "Крок назад, переднє коліно стабільне. Альтернуйте ноги по повторах або підходах.",
    },
    {
      slug: "plank",
      nameUk: "Планка передня",
      descriptionUk:
        "Лікті під плечима або на долонях. Не провалюйте поперек, дивіться трохи в підлогу.",
    },
    {
      slug: "side-plank",
      nameUk: "Бічна планка",
      descriptionUk:
        "Лікоть під плечем, таз піднятий. Почніть з колін, якщо важко.",
    },
  ];

  for (const e of exerciseDefs) {
    await prisma.exercise.upsert({
      where: { slug: e.slug },
      create: e,
      update: { nameUk: e.nameUk, descriptionUk: e.descriptionUk },
    });
  }

  const ids: Ids = {};
  for (const e of exerciseDefs) {
    const row = await prisma.exercise.findUniqueOrThrow({ where: { slug: e.slug } });
    ids[e.slug] = row.id;
  }

  let program = await prisma.program.findUnique({ where: { slug: "100-dniv" } });
  if (program) {
    await prisma.workoutLog.deleteMany({
      where: { programDay: { programId: program.id } },
    });
    await prisma.dayExercise.deleteMany({
      where: { programDay: { programId: program.id } },
    });
    await prisma.programDay.deleteMany({ where: { programId: program.id } });
    program = await prisma.program.update({
      where: { id: program.id },
      data: {
        name: "Сотка: 100 днів (турнік)",
        description:
          "Статична 100-денна програма з турніком: тяга, віджимання, ноги, кор. Українською; структура натхненна класичним курсом «Сотка».",
        durationDays: 100,
      },
    });
  } else {
    program = await prisma.program.create({
      data: {
        slug: "100-dniv",
        name: "Сотка: 100 днів (турнік)",
        description:
          "Статична 100-денна програма з турніком: тяга, віджимання, ноги, кор. Українською; структура натхненна класичним курсом «Сотка».",
        durationDays: 100,
      },
    });
  }

  let workoutOrdinal = 0;
  for (let day = 1; day <= 100; day++) {
    const dow = (day - 1) % 7;
    const dayType = WEEK[dow]!;
    const isLightSaturday = dow === 5;
    const p = phase(day);

    if (dayType === "REST") {
      await prisma.programDay.create({
        data: {
          programId: program.id,
          dayNumber: day,
          title: `День ${day} — відновлення`,
          dayType: "REST",
          restBodyUk: [
            "**Легка активність** 20–40 хв (прогулянка або дуже легкий біг, якщо звикли).",
            "",
            "**Мобільність 8–12 хв**: оберти плечима, «кошик» для стегон, розминка гомілкостопу.",
            "",
            "**Сон і вода** — база відновлення. Якщо болить лікоть або зап’ястя, зменшіть обсяг у наступних тренуваннях.",
          ].join("\n"),
        },
      });
      continue;
    }

    workoutOrdinal += 1;
    const tpl = ((workoutOrdinal - 1) % 3) as 0 | 1 | 2;
    const setsMain = isLightSaturday ? 2 : 3;
    const isBasicBlock = day >= 1 && day <= 49;
    const title = isBasicBlock
      ? `День ${day} — базова схема 1-2-2-2`
      : tpl === 0
        ? `День ${day} — тяга + ноги`
        : tpl === 1
          ? `День ${day} — жим + ноги`
          : `День ${day} — техніка + легка тяга`;

    const blocks = isBasicBlock
      ? basicBlockFromFirstPost(ids, workoutOrdinal)
      : workoutBlocks(tpl, p, isLightSaturday, ids, setsMain);

    await prisma.programDay.create({
      data: {
        programId: program.id,
        dayNumber: day,
        title,
        dayType: "WORKOUT",
        exercises: {
          create: blocks,
        },
      },
    });
  }

  const adminEmail = "admin@local";
  const adminPass = process.env.ADMIN_SEED_PASSWORD ?? "admin-admin-CHANGE";
  const passwordHash = await bcrypt.hash(adminPass, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      profile: { create: {} },
    },
    update: {
      passwordHash,
      role: "ADMIN",
    },
  });

  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminUser) {
    await prisma.userProfile.update({
      where: { userId: adminUser.id },
      data: { onboardingDone: true },
    });
    await prisma.userProgram.upsert({
      where: {
        userId_programId: { userId: adminUser.id, programId: program.id },
      },
      create: { userId: adminUser.id, programId: program.id, cursorDay: 1 },
      update: {},
    });
  }

  const postsDir = path.join(process.cwd(), "posts_uk_md");
  const files = await fs.readdir(postsDir);
  const daily = files
    .map((name) => {
      const m = /^posts__([0-9]+)\.md$/i.exec(name);
      if (!m) return null;
      return { name, day: Number(m[1]) };
    })
    .filter((v): v is { name: string; day: number } => Boolean(v))
    .sort((a, b) => a.day - b.day);

  for (const { name, day } of daily) {
    const full = path.join(postsDir, name);
    const bodyUk = await fs.readFile(full, "utf8");
    const titleUk = parsePostTitle(bodyUk, `День ${day}`);
    const dayRow = await prisma.programDay.findFirst({
      where: { programId: program.id, dayNumber: day },
      select: { id: true },
    });
    await prisma.dailyPost.upsert({
      where: { slug: `day-${day}` },
      create: {
        slug: `day-${day}`,
        dayNumber: day,
        block: blockByDay(day),
        titleUk,
        bodyUk,
        imageUrl: defaultPostImage(day),
        sourceFile: name,
        programDayId: dayRow?.id ?? null,
      },
      update: {
        dayNumber: day,
        block: blockByDay(day),
        titleUk,
        bodyUk,
        imageUrl: defaultPostImage(day),
        sourceFile: name,
        programDayId: dayRow?.id ?? null,
      },
    });
  }

  const prepFiles = ["posts__org.md", "posts__goals.md", "posts__reasons.md"];
  for (const name of prepFiles) {
    const full = path.join(postsDir, name);
    try {
      const bodyUk = await fs.readFile(full, "utf8");
      const baseSlug = name.replace(/^posts__/, "").replace(/\.md$/i, "");
      await prisma.dailyPost.upsert({
        where: { slug: `prep-${baseSlug}` },
        create: {
          slug: `prep-${baseSlug}`,
          dayNumber: null,
          block: "PREPARATION",
          titleUk: parsePostTitle(bodyUk, baseSlug),
          bodyUk,
          imageUrl: defaultPostImage(null),
          sourceFile: name,
        },
        update: {
          dayNumber: null,
          block: "PREPARATION",
          titleUk: parsePostTitle(bodyUk, baseSlug),
          bodyUk,
          imageUrl: defaultPostImage(null),
          sourceFile: name,
        },
      });
    } catch {
      // skip optional preparation files
    }
  }

  console.log("Seed OK: програма 100-dniv, вправи, пости, admin", adminEmail, "/", adminPass);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
