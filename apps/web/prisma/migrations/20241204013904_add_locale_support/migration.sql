-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UILanguage" ADD VALUE 'FR';
ALTER TYPE "UILanguage" ADD VALUE 'DE';
ALTER TYPE "UILanguage" ADD VALUE 'IT';
ALTER TYPE "UILanguage" ADD VALUE 'PT';
ALTER TYPE "UILanguage" ADD VALUE 'JA';
ALTER TYPE "UILanguage" ADD VALUE 'KO';
ALTER TYPE "UILanguage" ADD VALUE 'ZH_CN';
ALTER TYPE "UILanguage" ADD VALUE 'ZH_TW';

-- CreateTable
CREATE TABLE "LocaleSettings" (
    "id" TEXT NOT NULL,
    "language" "UILanguage" NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" "UILanguage" NOT NULL DEFAULT 'EN',
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocaleSettings_language_idx" ON "LocaleSettings"("language");

-- CreateIndex
CREATE INDEX "LocaleSettings_key_idx" ON "LocaleSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "LocaleSettings_language_key_key" ON "LocaleSettings"("language", "key");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
