/*
  Warnings:

  - Added the required column `koperasiId` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `koperasiId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "koperasiId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "koperasiId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Koperasi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "kode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Koperasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Koperasi_kode_key" ON "Koperasi"("kode");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "Koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_koperasiId_fkey" FOREIGN KEY ("koperasiId") REFERENCES "Koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
