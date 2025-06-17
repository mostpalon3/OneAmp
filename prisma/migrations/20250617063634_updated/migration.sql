/*
  Warnings:

  - You are about to drop the column `externalId` on the `Stream` table. All the data in the column will be lost.
  - Added the required column `extractedId` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "externalId",
ADD COLUMN     "extractedId" TEXT NOT NULL;
