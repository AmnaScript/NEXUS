export type Incident = {
    id: string;
    title: string;
    location: string;
    severity: "High" | "Medium" | "Low";
    status: "New" | "Under Review" | "Resolved";
    coordinates: [number, number];
    createdAt: string;
};

export function getIncidentColor(severity: Incident["severity"]) {
    return {
        High: "#EA7954",
        Medium: "#D4A04A",
        Low: "#217F79",
    }[severity];
}