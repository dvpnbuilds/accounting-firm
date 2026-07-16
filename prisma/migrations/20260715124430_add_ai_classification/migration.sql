-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "aiClassifiedAt" TIMESTAMP(3),
ADD COLUMN     "aiConfidence" DOUBLE PRECISION,
ADD COLUMN     "aiMatch" BOOLEAN;
