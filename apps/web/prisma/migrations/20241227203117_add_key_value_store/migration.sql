/*
  Warnings:

  - The primary key for the `KeyValueStore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `KeyValueStore` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `KeyValueStore` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "KeyValueStore" DROP CONSTRAINT "KeyValueStore_userId_fkey";

-- DropIndex
DROP INDEX "KeyValueStore_key_userId_key";

-- AlterTable
ALTER TABLE "KeyValueStore" DROP CONSTRAINT "KeyValueStore_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD CONSTRAINT "KeyValueStore_pkey" PRIMARY KEY ("key");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPassword";
