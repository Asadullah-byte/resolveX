/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Engineer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `provider` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'CREDENTIALS';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "fname" TEXT NOT NULL,
ADD COLUMN     "lname" TEXT NOT NULL,
ALTER COLUMN "provider" SET NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "Engineer";
