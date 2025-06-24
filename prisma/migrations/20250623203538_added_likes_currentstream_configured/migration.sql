/*
  Warnings:

  - The primary key for the `CurrentStream` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `CurrentStream` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Jam` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - Added the required column `jamId` to the `CurrentStream` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "currentStream_userId_idx";

-- AlterTable
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_pkey",
DROP COLUMN "userId",
ADD COLUMN     "jamId" TEXT NOT NULL,
ADD CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("jamId");

-- AlterTable
ALTER TABLE "Downvote" ADD COLUMN     "jamId" TEXT;

-- AlterTable
ALTER TABLE "Jam" DROP COLUMN "likes";

-- AlterTable
ALTER TABLE "Upvote" ADD COLUMN     "jamId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio";

-- CreateTable
CREATE TABLE "Likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jamId" TEXT NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "likes_userId_jamId_idx" ON "Likes"("userId", "jamId");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_userId_jamId_key" ON "Likes"("userId", "jamId");

-- CreateIndex
CREATE INDEX "currentStream_userId_idx" ON "CurrentStream"("jamId");

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Downvote" ADD CONSTRAINT "Downvote_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
