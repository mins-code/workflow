-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedHours" REAL NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "guidance" TEXT,
    "projectId" TEXT NOT NULL,
    "assigneeId" TEXT,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assigneeId", "description", "estimatedHours", "guidance", "id", "projectId", "requiredSkills", "status", "title") SELECT "assigneeId", "description", "estimatedHours", "guidance", "id", "projectId", "requiredSkills", "status", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
