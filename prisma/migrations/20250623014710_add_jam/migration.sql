-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "jamId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "followed" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "genre" TEXT NOT NULL DEFAULT 'Any Genre',
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Jam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "jams_userId_idx" ON "Jam"("userId");

-- CreateIndex
CREATE INDEX "jams_createdAt_idx" ON "Jam"("createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jam" ADD CONSTRAINT "Jam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "Jam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
