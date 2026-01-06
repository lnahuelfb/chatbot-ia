/*
  Warnings:

  - You are about to drop the column `profileComplete` on the `Preference` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- AlterTable
ALTER TABLE "Preference" DROP COLUMN "profileComplete",
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
