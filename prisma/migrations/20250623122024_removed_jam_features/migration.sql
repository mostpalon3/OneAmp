/*
  Warnings:

  - You are about to drop the column `jamCreatedBy` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `jamGenre` on the `Stream` table. All the data in the column will be lost.
  - You are about to drop the column `jamTitle` on the `Stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "jamCreatedBy",
DROP COLUMN "jamGenre",
DROP COLUMN "jamTitle";
