-- AlterTable
ALTER TABLE "Persona" ADD COLUMN     "category" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
