/*
  Warnings:

  - You are about to drop the column `name` on the `LibraryItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[characterId]` on the table `LibraryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `characterId` to the `LibraryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LibraryItem" DROP COLUMN "name",
ADD COLUMN     "characterId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "idleModel" TEXT NOT NULL,
    "talkModel" TEXT NOT NULL,
    "bgImage" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryItem_characterId_key" ON "LibraryItem"("characterId");

-- AddForeignKey
ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
