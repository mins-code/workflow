-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "availability" REAL NOT NULL,
    "maxHours" REAL NOT NULL,
    "assignedHours" REAL NOT NULL DEFAULT 0,
    "hashed_password" TEXT NOT NULL DEFAULT 'temp_placeholder',
    "teamId" TEXT,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("assignedHours", "availability", "email", "id", "maxHours", "name", "role", "skills", "teamId") SELECT "assignedHours", "availability", "email", "id", "maxHours", "name", "role", "skills", "teamId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
