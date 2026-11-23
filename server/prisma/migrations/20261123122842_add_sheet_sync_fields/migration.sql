-- AlterTable
ALTER TABLE "contact_submissions" ADD COLUMN     "sheetSyncAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sheetSyncError" TEXT,
ADD COLUMN     "sheetSynced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sheetSyncedAt" TIMESTAMP(3);
