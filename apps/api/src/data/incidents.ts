
export type IncidentStatus =
    | "New"
    | "Under Review"
    | "Resolved";

export type Incident = {
    id: string;
    title: string;
    location: string;
    severity: "High" | "Medium" | "Low";
    status: IncidentStatus;
    coordinates: [number, number];
    createdAt: string;
};

export const incidents: Incident[] = [
    {
        id: "NX-1042",
        title: "Road obstruction",
        location: "Central Avenue",
        severity: "High",
        status: "Under Review",
        coordinates: [73.0479, 33.6844],
        createdAt: new Date().toISOString(),
    },
    {
        id: "NX-1043",
        title: "Water pipeline leakage",
        location: "West District",
        severity: "Medium",
        status: "New",
        coordinates: [73.0395, 33.6905],
        createdAt: new Date().toISOString(),
    },
    {
        id: "NX-1044",
        title: "Traffic signal failure",
        location: "North Junction",
        severity: "Low",
        status: "Under Review",
        coordinates: [73.0555, 33.6945],
        createdAt: new Date().toISOString(),
    },
];
