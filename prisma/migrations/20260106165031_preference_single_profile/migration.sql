/*
  Warnings:

  - You are about to drop the column `compraORenta` on the `Preference` table. All the data in the column will be lost.
  - The `tipoPropiedad` column on the `Preference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Preference` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Preference` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('compra', 'renta');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('casa', 'departamento', 'terreno');

-- AlterTable
ALTER TABLE "Preference" DROP COLUMN "compraORenta",
ADD COLUMN     "operacion" "OperationType",
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "tipoPropiedad",
ADD COLUMN     "tipoPropiedad" "PropertyType";

-- CreateIndex
CREATE UNIQUE INDEX "Preference_userId_key" ON "Preference"("userId");
