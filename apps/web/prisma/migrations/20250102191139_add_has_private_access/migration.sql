/*
  Warnings:

  - You are about to drop the `analysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasPrivateAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scope" TEXT;

-- DropTable
DROP TABLE "analysis";

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_repositoryId_idx" ON "Analysis"("repositoryId");
