-- CreateTable
CREATE TABLE "DailyPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "dayNumber" INTEGER,
    "block" TEXT NOT NULL,
    "titleUk" TEXT NOT NULL,
    "bodyUk" TEXT NOT NULL,
    "sourceFile" TEXT,
    "programDayId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyPost_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPost_slug_key" ON "DailyPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPost_programDayId_key" ON "DailyPost"("programDayId");

-- CreateIndex
CREATE UNIQUE INDEX "dailypost_day_unique" ON "DailyPost"("dayNumber");
