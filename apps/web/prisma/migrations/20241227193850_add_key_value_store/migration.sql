/*
  Warnings:

  - You are about to drop the column `analysisCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastAnalysis` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "analysisCount",
DROP COLUMN "createdAt",
DROP COLUMN "lastAnalysis",
DROP COLUMN "preferences",
DROP COLUMN "updatedAt",
ADD COLUMN     "hashedPassword" TEXT;

-- CreateTable
CREATE TABLE "KeyValueStore" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "KeyValueStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyValueStore_key_userId_key" ON "KeyValueStore"("key", "userId");

-- AddForeignKey
ALTER TABLE "KeyValueStore" ADD CONSTRAINT "KeyValueStore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
