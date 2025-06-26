/*
  Warnings:

  - You are about to drop the column `followed` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `followers` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `Likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_jamId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_userId_fkey";

-- AlterTable
ALTER TABLE "Jam" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "followed",
DROP COLUMN "followers",
ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Likes";

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JamLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "follows_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "follows_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "follows_relationship_idx" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "jamLikes_userId_idx" ON "JamLike"("userId");

-- CreateIndex
CREATE INDEX "jamLikes_jamId_idx" ON "JamLike"("jamId");

-- CreateIndex
CREATE INDEX "jamLikes_userId_jamId_idx" ON "JamLike"("userId", "jamId");

-- CreateIndex
CREATE INDEX "jamLikes_createdAt_idx" ON "JamLike"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "JamLike_userId_jamId_key" ON "JamLike"("userId", "jamId");

-- CreateIndex
CREATE INDEX "jams_likesCount_idx" ON "Jam"("likesCount");

-- CreateIndex
CREATE INDEX "jams_genre_idx" ON "Jam"("genre");

-- CreateIndex
CREATE INDEX "streams_jamId_idx" ON "Stream"("jamId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamLike" ADD CONSTRAINT "JamLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamLike" ADD CONSTRAINT "JamLike_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "currentStream_userId_idx" RENAME TO "currentStream_jamId_idx";
