-- CreateTable
CREATE TABLE "UserCalendarDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserCalendarDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserCalendarDay_userId_dayKey_idx" ON "UserCalendarDay"("userId", "dayKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserCalendarDay_userId_dayKey_key" ON "UserCalendarDay"("userId", "dayKey");
