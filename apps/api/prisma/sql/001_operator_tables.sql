-- NEXUS: create the operator tables that schema.prisma defines but Supabase is missing.
-- Safe to run more than once. Paste into Supabase -> SQL Editor -> Run.

DO $$ BEGIN
  CREATE TYPE "NexusOperatorRole" AS ENUM ('ADMIN', 'OPERATOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "NexusOperatorStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "OperatorAccount" (
  "id"                    TEXT                  NOT NULL,
  "authUserId"            UUID                  NOT NULL,
  "email"                 TEXT                  NOT NULL,
  "displayName"           TEXT                  NOT NULL DEFAULT '',
  "role"                  "NexusOperatorRole"   NOT NULL DEFAULT 'OPERATOR',
  "status"                "NexusOperatorStatus" NOT NULL DEFAULT 'ACTIVE',
  "compactCards"          BOOLEAN               NOT NULL DEFAULT false,
  "highlightHighPriority" BOOLEAN               NOT NULL DEFAULT true,
  "autoRefresh"           BOOLEAN               NOT NULL DEFAULT false,
  "notificationsEnabled"  BOOLEAN               NOT NULL DEFAULT true,
  "createdAt"             TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperatorAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OperatorAccount_authUserId_key" ON "OperatorAccount"("authUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "OperatorAccount_email_key"      ON "OperatorAccount"("email");

CREATE TABLE IF NOT EXISTS "OperatorNotificationRead" (
  "id"         TEXT         NOT NULL,
  "operatorId" TEXT         NOT NULL,
  "eventKey"   TEXT         NOT NULL,
  "readAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperatorNotificationRead_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OperatorNotificationRead_operatorId_fkey"
    FOREIGN KEY ("operatorId") REFERENCES "OperatorAccount"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "OperatorNotificationRead_operatorId_eventKey_key"
  ON "OperatorNotificationRead"("operatorId", "eventKey");
CREATE INDEX IF NOT EXISTS "OperatorNotificationRead_operatorId_idx"
  ON "OperatorNotificationRead"("operatorId");

-- Security: Supabase exposes public tables through its REST API.
-- Enabling RLS with no policies blocks that route. Your Express API connects
-- through Prisma as the database owner, so it is not affected.
ALTER TABLE "OperatorAccount"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OperatorNotificationRead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Incident"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IncidentActivity"         ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- FIRST ADMIN. Change the email to the one you sign in with, then run this.
-- The user must already exist in Supabase -> Authentication -> Users.
-- ---------------------------------------------------------------------------
INSERT INTO "OperatorAccount" ("id", "authUserId", "email", "displayName", "role", "status")
SELECT 'admin_' || replace(u.id::text, '-', ''),
       u.id,
       lower(u.email),
       'Administrator',
       'ADMIN',
       'ACTIVE'
FROM auth.users u
WHERE lower(u.email) = lower('YOUR_LOGIN_EMAIL@example.com')
ON CONFLICT ("authUserId") DO UPDATE
  SET "role" = 'ADMIN', "status" = 'ACTIVE';

-- Verify: should return 4 rows, and the second query should show your admin.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('Incident','IncidentActivity','OperatorAccount','OperatorNotificationRead')
ORDER BY table_name;

SELECT "email", "role", "status" FROM "OperatorAccount";
