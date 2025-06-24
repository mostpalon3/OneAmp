/*
  Warnings:

  - You are about to drop the column `jamId` on the `Downvote` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `jamId` on the `Upvote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Downvote" DROP CONSTRAINT "Downvote_jamId_fkey";

-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_jamId_fkey";

-- DropIndex
DROP INDEX "streams_userId_active_idx";

-- AlterTable
ALTER TABLE "Downvote" DROP COLUMN "jamId";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "active";

-- AlterTable
ALTER TABLE "Upvote" DROP COLUMN "jamId";
