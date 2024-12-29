/*
  Warnings:

  - You are about to drop the `AnalysisRuleSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocaleSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Platform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgrammingLanguage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PullRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Repository` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCategoryPreferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AnalysisRuleSetToRepository` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProgrammingLanguageToPullRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProgrammingLanguageToRepository` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryAnalysis" DROP CONSTRAINT "CategoryAnalysis_reportId_fkey";

-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_analysisRuleSetId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_platformId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_pullRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "Repository" DROP CONSTRAINT "Repository_platformId_fkey";

-- DropForeignKey
ALTER TABLE "_AnalysisRuleSetToRepository" DROP CONSTRAINT "_AnalysisRuleSetToRepository_A_fkey";

-- DropForeignKey
ALTER TABLE "_AnalysisRuleSetToRepository" DROP CONSTRAINT "_AnalysisRuleSetToRepository_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProgrammingLanguageToPullRequest" DROP CONSTRAINT "_ProgrammingLanguageToPullRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProgrammingLanguageToPullRequest" DROP CONSTRAINT "_ProgrammingLanguageToPullRequest_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProgrammingLanguageToRepository" DROP CONSTRAINT "_ProgrammingLanguageToRepository_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProgrammingLanguageToRepository" DROP CONSTRAINT "_ProgrammingLanguageToRepository_B_fkey";

-- DropTable
DROP TABLE "AnalysisRuleSet";

-- DropTable
DROP TABLE "CategoryAnalysis";

-- DropTable
DROP TABLE "LocaleSettings";

-- DropTable
DROP TABLE "Platform";

-- DropTable
DROP TABLE "ProgrammingLanguage";

-- DropTable
DROP TABLE "PullRequest";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "Repository";

-- DropTable
DROP TABLE "UserCategoryPreferences";

-- DropTable
DROP TABLE "UserSettings";

-- DropTable
DROP TABLE "_AnalysisRuleSetToRepository";

-- DropTable
DROP TABLE "_ProgrammingLanguageToPullRequest";

-- DropTable
DROP TABLE "_ProgrammingLanguageToRepository";

-- DropEnum
DROP TYPE "AnalysisCategory";

-- DropEnum
DROP TYPE "PlatformType";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "UILanguage";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "githubToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalysis" TIMESTAMP(3),
    "analysisCount" INTEGER NOT NULL DEFAULT 0,
    "preferences" JSONB DEFAULT '{}',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
