/*
  Warnings:

  - You are about to drop the column `followers` on the `Jam` table. All the data in the column will be lost.
  - Made the column `jamId` on table `Stream` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_jamId_fkey";

-- AlterTable
ALTER TABLE "Jam" DROP COLUMN "followers";

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "jamCreatedBy" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "jamGenre" TEXT NOT NULL DEFAULT 'Any Genre',
ADD COLUMN     "jamTitle" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "jamId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
