/*
  Warnings:

  - The primary key for the `KeyValueStore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[key]` on the table `KeyValueStore` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `KeyValueStore` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `KeyValueStore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KeyValueStore" DROP CONSTRAINT "KeyValueStore_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "KeyValueStore_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "analysis" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analysis_repositoryId_idx" ON "analysis"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "KeyValueStore_key_key" ON "KeyValueStore"("key");
