-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_jamId_fkey";

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
