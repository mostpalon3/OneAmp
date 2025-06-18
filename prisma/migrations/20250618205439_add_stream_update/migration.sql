-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "artist" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "submittedBy" TEXT NOT NULL DEFAULT 'anonymous';
