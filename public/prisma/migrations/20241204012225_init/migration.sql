-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('GITHUB', 'GITLAB', 'AZURE_DEVOPS', 'BITBUCKET');

-- CreateEnum
CREATE TYPE "UILanguage" AS ENUM ('EN', 'ES');

-- CreateEnum
CREATE TYPE "AnalysisCategory" AS ENUM ('CODE_QUALITY', 'DEPENDENCIES', 'PERFORMANCE', 'SECURITY', 'BEST_PRACTICES', 'DOCUMENTATION', 'TESTING');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PR_REVIEW', 'REPO_AUDIT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "type" "PlatformType" NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "capabilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "private" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammingLanguage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "fileExtensions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammingLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "state" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "diffUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRuleSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "AnalysisCategory" NOT NULL,
    "version" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAnalysis" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "category" "AnalysisCategory" NOT NULL,
    "findings" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "platformId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "pullRequestId" TEXT,
    "analysisRuleSetId" TEXT NOT NULL,
    "summary" TEXT,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCategoryPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCategoryPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProgrammingLanguageToRepository" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgrammingLanguageToRepository_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProgrammingLanguageToPullRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgrammingLanguageToPullRequest_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AnalysisRuleSetToRepository" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnalysisRuleSetToRepository_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_platformId_idx" ON "Repository"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammingLanguage_name_key" ON "ProgrammingLanguage"("name");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "CategoryAnalysis_reportId_idx" ON "CategoryAnalysis"("reportId");

-- CreateIndex
CREATE INDEX "Report_platformId_idx" ON "Report"("platformId");

-- CreateIndex
CREATE INDEX "Report_repositoryId_idx" ON "Report"("repositoryId");

-- CreateIndex
CREATE INDEX "Report_pullRequestId_idx" ON "Report"("pullRequestId");

-- CreateIndex
CREATE INDEX "Report_analysisRuleSetId_idx" ON "Report"("analysisRuleSetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCategoryPreferences_userId_key" ON "UserCategoryPreferences"("userId");

-- CreateIndex
CREATE INDEX "_ProgrammingLanguageToRepository_B_index" ON "_ProgrammingLanguageToRepository"("B");

-- CreateIndex
CREATE INDEX "_ProgrammingLanguageToPullRequest_B_index" ON "_ProgrammingLanguageToPullRequest"("B");

-- CreateIndex
CREATE INDEX "_AnalysisRuleSetToRepository_B_index" ON "_AnalysisRuleSetToRepository"("B");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAnalysis" ADD CONSTRAINT "CategoryAnalysis_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_analysisRuleSetId_fkey" FOREIGN KEY ("analysisRuleSetId") REFERENCES "AnalysisRuleSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammingLanguageToRepository" ADD CONSTRAINT "_ProgrammingLanguageToRepository_A_fkey" FOREIGN KEY ("A") REFERENCES "ProgrammingLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammingLanguageToRepository" ADD CONSTRAINT "_ProgrammingLanguageToRepository_B_fkey" FOREIGN KEY ("B") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammingLanguageToPullRequest" ADD CONSTRAINT "_ProgrammingLanguageToPullRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "ProgrammingLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammingLanguageToPullRequest" ADD CONSTRAINT "_ProgrammingLanguageToPullRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnalysisRuleSetToRepository" ADD CONSTRAINT "_AnalysisRuleSetToRepository_A_fkey" FOREIGN KEY ("A") REFERENCES "AnalysisRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnalysisRuleSetToRepository" ADD CONSTRAINT "_AnalysisRuleSetToRepository_B_fkey" FOREIGN KEY ("B") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
