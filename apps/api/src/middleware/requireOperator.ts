
import type { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const operatorIds = process.env.OPERATOR_USER_IDS;

if (!supabaseUrl || !supabaseKey || !operatorIds) {
    throw new Error("Missing Supabase operator authentication settings");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const allowedIds = new Set(
    operatorIds.split(",").map((id) => id.trim()).filter(Boolean)
);

export const requireOperator: RequestHandler = async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        res.status(401).json({ message: "Invalid authorization token" });
        return;
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            console.error("Supabase auth error:", error?.message);

            res.status(401).json({
                message: "Invalid or expired session",
            });
            return;
        }

        if (!allowedIds.has(data.user.id)) {
            res.status(403).json({ message: "Operator access denied" });
            return;
        }

        next();
    } catch (error) {
        console.error("Authentication verification failed:", error);
        res.status(503).json({ message: "Authentication unavailable" });
    }
};
