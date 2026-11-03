
import type { Incident } from "./incidents";
import { supabase } from "../../lib/supabase";
import { getLocalGameIncidents } from "../rescue-run/gameIncidentBridge";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_URL = `${API_BASE_URL}/api/incidents`;

async function authorizedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
        throw new Error("Please sign in to continue.");
    }

    const headers = new Headers(options.headers);
    headers.set(
        "Authorization",
        `Bearer ${data.session.access_token}`
    );

    return fetch(url, {
        ...options,
        headers,
    });
}

export async function getIncidents(): Promise<Incident[]> {
    const response = await authorizedFetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch incidents");
    }

    return response.json() as Promise<Incident[]>;
}

export async function createIncident(
    data: Pick<
        Incident,
        "title" | "location" | "severity" | "coordinates"
    >
): Promise<Incident> {
    const response = await authorizedFetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to create incident");
    }

    return response.json() as Promise<Incident>;
}

export async function updateIncidentStatus(
    id: string,
    status: Incident["status"]
): Promise<Incident> {
    const response = await authorizedFetch(
        `${API_URL}/${encodeURIComponent(id)}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update incident status");
    }

    return response.json() as Promise<Incident>;
}

export type IncidentActivity = {
    id: string;
    incidentId: string;
    action: "CREATED" | "STATUS_CHANGED";
    oldStatus: string | null;
    newStatus: string | null;
    createdAt: string;
};

export async function getIncidentActivities(
    incidentId: string
): Promise<IncidentActivity[]> {
    const response = await authorizedFetch(
        `${API_URL}/${encodeURIComponent(incidentId)}/activities`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch incident activities");
    }

    return response.json() as Promise<IncidentActivity[]>;
}

export async function getDemoIncidents(): Promise<Incident[]> {
    const localGameIncidents = getLocalGameIncidents();

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/demo/incidents`
        );

        if (!response.ok) {
            throw new Error("Failed to load demo incidents");
        }

        const demoIncidents =
            (await response.json()) as Incident[];

        const localIds = new Set(
            localGameIncidents.map((item) => item.id)
        );

        return [
            ...localGameIncidents,
            ...demoIncidents.filter(
                (item) => !localIds.has(item.id)
            ),
        ];
    } catch (error) {
        // Local gameplay reports can still appear when the
        // public demo API is temporarily unavailable.
        if (localGameIncidents.length > 0) {
            return localGameIncidents;
        }

        throw error;
    }
}
