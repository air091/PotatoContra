-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Sport" ADD COLUMN "workspaceId" TEXT;

-- Backfill existing sports into a shared legacy workspace so current data survives the migration
INSERT INTO "Workspace" ("id") VALUES ('legacy-default-workspace');

UPDATE "Sport"
SET "workspaceId" = 'legacy-default-workspace'
WHERE "workspaceId" IS NULL;

ALTER TABLE "Sport" ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Sport_workspaceId_idx" ON "Sport"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_workspaceId_name_key" ON "Sport"("workspaceId", "name");

-- AddForeignKey
ALTER TABLE "Sport" ADD CONSTRAINT "Sport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
