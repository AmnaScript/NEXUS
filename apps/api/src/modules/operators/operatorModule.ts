
import { Router } from "express";
import type { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";

type Operator = NonNullable<
    Awaited<ReturnType<PrismaClient["operatorAccount"]["findUnique"]>>
>;

const url = process.env.SUPABASE_URL;
const secret =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

const webOrigin =
    process.env.FRONTEND_URL?.split(",")[0]?.trim();

if (!url || !secret || !webOrigin) {
    throw new Error(
        "SUPABASE_URL, SUPABASE_SECRET_KEY and FRONTEND_URL are required"
    );
}

const supabaseAdmin = createClient(url, secret, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

const isValidEmail = (value: unknown): value is string =>
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
    value.length <= 254;

const stringValue = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

function getOperator(res: {
    locals: Record<string, unknown>;
}): Operator {
    return res.locals.nexusOperator as Operator;
}

export function createOperatorModule(prisma: PrismaClient) {
    const requireOperator: RequestHandler = async (req, res, next) => {
        try {
            const authorization = req.headers.authorization;

            if (!authorization?.startsWith("Bearer ")) {
                res.status(401).json({ error: "Authentication required" });
                return;
            }

            const token = authorization.slice(7).trim();
            if (!token) {
                res.status(401).json({ error: "Invalid authorization header" });
                return;
            }

            // Server-confirmed identity, not unverified browser session data.
            const { data, error } = await supabaseAdmin.auth.getUser(token);

            if (error || !data.user) {
                console.error("Operator authentication failed:", {
                    message: error?.message,
                    status: error?.status,
                    code: error?.code,
                    supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL),
                    secretConfigured: Boolean(
                        process.env.SUPABASE_SECRET_KEY ||
                        process.env.SUPABASE_SERVICE_ROLE_KEY
                    ),
                });

                res.status(401).json({
                    error: "Invalid or expired session",
                });
                return;
            }

            const account = await prisma.operatorAccount.findUnique({
                where: { authUserId: data.user.id },
            });

            if (
                !account ||
                account.status !== "ACTIVE" ||
                account.email.toLowerCase() !==
                (data.user.email ?? "").toLowerCase()
            ) {
                res.status(403).json({
                    error: "This account does not have active operator access",
                });
                return;
            }

            res.locals.nexusOperator = account;
            next();
        } catch (error) {
            // Database or Supabase outage: report as 503 JSON, never as a 403.
            console.error("Operator verification failed:", error);
            res.status(503).json({
                error: "Authorization service is temporarily unavailable",
            });
        }
    };

    const requireAdmin: RequestHandler = (_req, res, next) => {
        const account = getOperator(res);

        if (account.role !== "ADMIN") {
            res.status(403).json({ error: "Administrator access required" });
            return;
        }

        next();
    };

    const router = Router();
    router.use(requireOperator);

    // Account profile and permissions.
    router.get("/me", (_req, res) => {
        const account = getOperator(res);

        res.json({
            id: account.id,
            email: account.email,
            displayName: account.displayName,
            role: account.role,
            status: account.status,
            preferences: {
                compactCards: account.compactCards,
                highlightHighPriority: account.highlightHighPriority,
                autoRefresh: account.autoRefresh,
                notificationsEnabled: account.notificationsEnabled,
            },
        });
    });

    // Update the currently signed-in operator's display profile.
    router.patch("/me", async (req, res) => {
        const account = getOperator(res);
        const name = stringValue(req.body?.displayName, 70);

        if (name.length < 2) {
            res.status(400).json({
                error: "Display name must contain at least two characters",
            });
            return;
        }

        const updated = await prisma.operatorAccount.update({
            where: { id: account.id },
            data: { displayName: name },
        });

        res.json({
            displayName: updated.displayName,
        });
    });

    // Preferences belong to the operator, not the browser.
    router.put("/preferences", async (req, res) => {
        const account = getOperator(res);
        const keys = [
            "compactCards",
            "highlightHighPriority",
            "autoRefresh",
            "notificationsEnabled",
        ] as const;

        const body: unknown = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            res.status(400).json({ error: "Invalid preferences" });
            return;
        }

        const record = body as Record<string, unknown>;

        if (
            Object.keys(record).some(
                (key) => !keys.includes(key as typeof keys[number])
            ) ||
            keys.some((key) => typeof record[key] !== "boolean")
        ) {
            res.status(400).json({
                error: "All four boolean preferences are required",
            });
            return;
        }

        const updated = await prisma.operatorAccount.update({
            where: { id: account.id },
            data: {
                compactCards: record.compactCards as boolean,
                highlightHighPriority: record.highlightHighPriority as boolean,
                autoRefresh: record.autoRefresh as boolean,
                notificationsEnabled: record.notificationsEnabled as boolean,
            },
        });

        res.json({
            compactCards: updated.compactCards,
            highlightHighPriority: updated.highlightHighPriority,
            autoRefresh: updated.autoRefresh,
            notificationsEnabled: updated.notificationsEnabled,
        });
    });

    // Incident-based notifications.
    // Uses real operator incident records, not Rescue Run localStorage.
    async function collectNotifications(operatorId: string) {
        const incidents = await prisma.incident.findMany({
            where: {
                OR: [
                    { status: "New" },
                    {
                        severity: "High",
                        status: { not: "Resolved" },
                    },
                ],
            },
            select: {
                id: true,
                title: true,
                severity: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        const reads = await prisma.operatorNotificationRead.findMany({
            where: { operatorId },
            select: { eventKey: true },
        });

        const readKeys = new Set(reads.map((item) => item.eventKey));

        return incidents.map((incident) => {
            const eventKey = `incident:${incident.id}:attention`;

            return {
                eventKey,
                incidentId: incident.id,
                title: incident.title,
                severity: incident.severity,
                status: incident.status,
                createdAt: incident.createdAt,
                read: readKeys.has(eventKey),
            };
        });
    }

    router.get("/notifications", async (_req, res) => {
        const account = getOperator(res);
        const notifications = await collectNotifications(account.id);

        res.json({
            notifications,
            unread: notifications.filter((item) => !item.read).length,
        });
    });

    router.post("/notifications/read", async (req, res) => {
        const account = getOperator(res);
        const eventKey: unknown = req.body?.eventKey;

        if (typeof eventKey !== "string") {
            res.status(400).json({ error: "Invalid notification" });
            return;
        }

        const notifications = await collectNotifications(account.id);
        if (!notifications.some((item) => item.eventKey === eventKey)) {
            res.status(404).json({ error: "Notification not found" });
            return;
        }

        await prisma.operatorNotificationRead.upsert({
            where: {
                operatorId_eventKey: {
                    operatorId: account.id,
                    eventKey,
                },
            },
            update: { readAt: new Date() },
            create: {
                operatorId: account.id,
                eventKey,
            },
        });

        res.json({ success: true });
    });

    router.post("/notifications/read-all", async (_req, res) => {
        const account = getOperator(res);
        const notifications = await collectNotifications(account.id);

        await prisma.operatorNotificationRead.createMany({
            data: notifications.map((item) => ({
                operatorId: account.id,
                eventKey: item.eventKey,
            })),
            skipDuplicates: true,
        });

        res.json({ success: true });
    });

    // Only administrators can view or change operator accounts.
    router.get("/admin/operators", requireAdmin, async (_req, res) => {
        const operators = await prisma.operatorAccount.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        res.json(operators);
    });

    router.post("/admin/invite", requireAdmin, async (req, res) => {
        const emailValue: unknown = req.body?.email;

        if (!isValidEmail(emailValue)) {
            res.status(400).json({ error: "Invalid email address" });
            return;
        }

        const email = emailValue.toLowerCase().trim();
        const displayName = stringValue(req.body?.displayName, 70);

        const existing = await prisma.operatorAccount.findUnique({
            where: { email },
        });

        if (existing) {
            res.status(409).json({
                error: "An operator account already exists for this email",
            });
            return;
        }

        // Never accept a role from the request body.
        // New invitations always have the OPERATOR role.
        const { data, error } =
            await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                redirectTo: `${webOrigin}/activate`,
                data: { display_name: displayName },
            });

        if (error || !data.user) {
            res.status(502).json({
                error: "Unable to send invitation",
            });
            return;
        }

        try {
            const operator = await prisma.operatorAccount.create({
                data: {
                    authUserId: data.user.id,
                    email,
                    displayName,
                    role: "OPERATOR",
                    status: "ACTIVE",
                },
            });

            res.status(201).json({
                id: operator.id,
                email: operator.email,
                message: "Invitation submitted",
            });
        } catch (error) {
            // Fail closed: the Auth user does not have an operator
            // record and therefore cannot access protected routes.
            console.error("Operator record creation failed:", error);

            res.status(500).json({
                error:
                    "Invitation identity was created, but operator provisioning failed. An administrator must reconcile it.",
            });
        }
    });

    router.patch(
        "/admin/operators/:id",
        requireAdmin,
        async (req, res) => {
            const actor = getOperator(res);
            const id = String(req.params.id);

            const existing = await prisma.operatorAccount.findUnique({
                where: { id },
            });

            if (!existing) {
                res.status(404).json({ error: "Operator not found" });
                return;
            }

            if (existing.id === actor.id) {
                res.status(400).json({
                    error: "You cannot modify your own role or account status",
                });
                return;
            }

            const status: unknown = req.body?.status;
            const role: unknown = req.body?.role;

            if (
                (status !== undefined &&
                    status !== "ACTIVE" &&
                    status !== "SUSPENDED") ||
                (role !== undefined &&
                    role !== "ADMIN" &&
                    role !== "OPERATOR") ||
                (status === undefined && role === undefined)
            ) {
                res.status(400).json({ error: "Invalid account update" });
                return;
            }

            // Do not allow removing the last active administrator.
            const removesAdmin =
                existing.role === "ADMIN" &&
                existing.status === "ACTIVE" &&
                (role === "OPERATOR" || status === "SUSPENDED");

            if (removesAdmin) {
                const activeAdmins = await prisma.operatorAccount.count({
                    where: {
                        role: "ADMIN",
                        status: "ACTIVE",
                    },
                });

                if (activeAdmins <= 1) {
                    res.status(409).json({
                        error: "At least one active administrator is required",
                    });
                    return;
                }
            }

            const updated = await prisma.operatorAccount.update({
                where: { id },
                data: {
                    ...(status !== undefined ? { status } : {}),
                    ...(role !== undefined ? { role } : {}),
                },
            });

            res.json({
                id: updated.id,
                role: updated.role,
                status: updated.status,
            });
        }
    );

    return {
        router,
        requireOperator,
        requireAdmin,
    };
}
