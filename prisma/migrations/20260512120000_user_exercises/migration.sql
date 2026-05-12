-- CreateTable
CREATE TABLE "UserExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "short" TEXT NOT NULL,
    "maxReps" INTEGER NOT NULL DEFAULT 5000,
    "sortOrder" INTEGER NOT NULL,
    "builtinKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingDayExerciseLine" (
    "id" TEXT NOT NULL,
    "trainingDayEntryId" TEXT NOT NULL,
    "userExerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "TrainingDayExerciseLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserExercise_userId_sortOrder_idx" ON "UserExercise"("userId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "UserExercise_userId_builtinKey_key" ON "UserExercise"("userId", "builtinKey");

-- CreateIndex
CREATE INDEX "TrainingDayExerciseLine_trainingDayEntryId_sortOrder_idx" ON "TrainingDayExerciseLine"("trainingDayEntryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingDayExerciseLine_trainingDayEntryId_userExerciseId_key" ON "TrainingDayExerciseLine"("trainingDayEntryId", "userExerciseId");

-- AddForeignKey
ALTER TABLE "UserExercise" ADD CONSTRAINT "UserExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingDayExerciseLine" ADD CONSTRAINT "TrainingDayExerciseLine_trainingDayEntryId_fkey" FOREIGN KEY ("trainingDayEntryId") REFERENCES "TrainingDayEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingDayExerciseLine" ADD CONSTRAINT "TrainingDayExerciseLine_userExerciseId_fkey" FOREIGN KEY ("userExerciseId") REFERENCES "UserExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
