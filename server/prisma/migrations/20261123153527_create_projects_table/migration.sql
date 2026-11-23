-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "category" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "shortDescription" TEXT NOT NULL,
    "badges" TEXT[],
    "techStack" TEXT[],
    "image" TEXT,
    "imageCaption" TEXT,
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "repoStatus" TEXT,
    "demoStatus" TEXT,
    "caseStudy" JSONB,
    "sampleItems" JSONB,
    "auditMatrix" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
