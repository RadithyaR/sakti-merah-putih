-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "kopdesCardUid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_kopdesCardUid_key" ON "Member"("kopdesCardUid");

