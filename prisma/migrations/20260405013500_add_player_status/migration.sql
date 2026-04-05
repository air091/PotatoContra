-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('waiting', 'playing', 'queued');

-- AlterTable
ALTER TABLE "Player"
ADD COLUMN "playerStatus" "PlayerStatus" NOT NULL DEFAULT 'waiting';
