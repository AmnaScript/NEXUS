
import { supabase } from "./supabase";

const API_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export type OperatorRole = "ADMIN" | "OPERATOR";
export type OperatorStatus = "ACTIVE" | "SUSPENDED";

export type OperatorPreferences = {
    compactCards: boolean;
    highlightHighPriority: boolean;
    autoRefresh: boolean;
    notificationsEnabled: boolean;
};

export type OperatorProfile = {
    id: string;
    email: string;
    displayName: string;
    role: OperatorRole;
    status: OperatorStatus;
    preferences: OperatorPreferences;
};

export type OperatorListItem = {
    id: string;
    email: string;
    displayName: string;
    role: OperatorRole;
    status: OperatorStatus;
    createdAt: string;
};

export type OperatorNotification = {
    eventKey: string;
    incidentId: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
    read: boolean;
};

export type NotificationResponse = {
    notifications: OperatorNotification[];
    unread: number;
};

export async function operatorRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const { data, error } = await supabase.auth.getSession();

    const verification = await supabase.auth.getUser();

    console.log("Supabase Auth verification:", {
        valid: !verification.error && Boolean(verification.data.user),
        error: verification.error?.message,
    });

    if (error || !data.session?.access_token) {
        throw new Error("Please sign in to continue.");
    }

    const headers = new Headers(options.headers);

    headers.set(
        "Authorization",
        `Bearer ${data.session.access_token}`
    );

    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(
        `${API_BASE}/api/operator${path}`,
        { ...options, headers }
    );

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            payload &&
                typeof payload === "object" &&
                "error" in payload &&
                typeof payload.error === "string"
                ? payload.error
                : `Request failed (${response.status})`;

        throw new Error(message);
    }

    return payload as T;
}

export const operatorApi = {
    me: () =>
        operatorRequest<OperatorProfile>("/me"),

    updateProfile: (displayName: string) =>
        operatorRequest<{ displayName: string }>("/me", {
            method: "PATCH",
            body: JSON.stringify({ displayName }),
        }),

    savePreferences: (preferences: OperatorPreferences) =>
        operatorRequest<OperatorPreferences>("/preferences", {
            method: "PUT",
            body: JSON.stringify(preferences),
        }),

    notifications: () =>
        operatorRequest<NotificationResponse>("/notifications"),

    markRead: (eventKey: string) =>
        operatorRequest<{ success: boolean }>("/notifications/read", {
            method: "POST",
            body: JSON.stringify({ eventKey }),
        }),

    markAllRead: () =>
        operatorRequest<{ success: boolean }>(
            "/notifications/read-all",
            { method: "POST", body: JSON.stringify({}) }
        ),

    listOperators: () =>
        operatorRequest<OperatorListItem[]>("/admin/operators"),

    invite: (email: string, displayName: string) =>
        operatorRequest<{ id: string; email: string; message: string }>(
            "/admin/invite",
            {
                method: "POST",
                body: JSON.stringify({ email, displayName }),
            }
        ),

    updateOperator: (
        id: string,
        update: Partial<Pick<OperatorListItem, "role" | "status">>
    ) =>
        operatorRequest<{
            id: string;
            role: OperatorRole;
            status: OperatorStatus;
        }>(`/admin/operators/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(update),
        }),
};
