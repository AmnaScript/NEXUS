
import {
    LayoutDashboard,
    Map,
    AlertTriangle,
    Route,
    BarChart3,
    Settings,
    Bell,
    Plus,
    Activity,
    LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import CityMap from "../features/city-map/CityMap";
import type { Incident } from "../features/incidents/incidents";
import IncidentDetails from "../features/incidents/IncidentDetails";
import { getIncidents } from "../features/incidents/incidentApi";
import { getIncidentColor } from "../features/incidents/incidents";
import CreateIncident from "../features/incidents/CreateIncident";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getDemoIncidents } from "../features/incidents/incidentApi";


export default function ControlRoom({
    preview = false,
}: {
    preview?: boolean;
}) {
    const [selectedIncident, setSelectedIncident] =
        useState<Incident | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);

    const [pickedCoordinates, setPickedCoordinates] =
        useState<[number, number] | null>(null);
    const navigate = useNavigate();
    const [signingOut, setSigningOut] = useState(false);

    async function handleLogout() {
        if (signingOut) return;

        setSigningOut(true);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Logout failed:", error);
            setSigningOut(false);
            return;
        }

        navigate("/login", { replace: true });
    }

    useEffect(() => {
        let active = true;

        async function loadIncidents() {
            try {
                const data = preview
                    ? await getDemoIncidents()
                    : await getIncidents();
                if (active) setIncidents(data);
            } catch {
                if (active) setError("Unable to load incidents.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadIncidents();

        return () => {
            active = false;
        };
    }, [preview]);
    return (
        <div className="flex min-h-screen bg-[#F7F6F2] text-[#202A31]">

            {/* Sidebar */}
            <aside className="hidden w-64 flex-col bg-[#202A31] p-6 text-white lg:flex">
                <h1 className="mb-12 text-2xl font-bold tracking-tight">
                    NEXUS<span className="text-[#69B5AE]">.</span>
                </h1>

                <nav className="flex flex-col gap-2">
                    {[
                        { icon: LayoutDashboard, label: "Overview" },
                        { icon: Map, label: "City Map" },
                        { icon: AlertTriangle, label: "Incidents" },
                        { icon: Route, label: "Simulations" },
                        { icon: BarChart3, label: "Analytics" },
                        { icon: Settings, label: "Settings" },
                    ].map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[#B4C0C1] transition hover:bg-white/10 hover:text-white"
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto rounded-xl bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Activity size={16} className="text-[#69B5AE]" />
                        Demo Environment
                    </div>
                    <p className="mt-2 text-xs text-[#B4C0C1]">
                        Fictional city simulation
                    </p>
                </div>
            </aside>

            {/* Main content */}
            <main className="min-w-0 flex-1 p-5 md:p-8">

                {/* Header */}
                <header className="mb-8 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-[#617078]">
                            District 01 / Overview
                        </p>
                        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                            City Control Room
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {preview && (
                            <Link
                                to="/login"
                                className="rounded-xl bg-[#217F79] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#196660]"
                            >
                                Operator Login
                            </Link>
                        )}
                        <button
                            aria-label="Notifications"
                            className="rounded-xl border border-[#DFE4E0] bg-white p-3"
                        >
                            <Bell size={19} />
                        </button>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCE6E2] font-semibold">
                            N
                        </div>
                        {!preview && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={signingOut}
                                title="Sign out"
                                aria-label="Sign out"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DFE4E0] bg-white text-[#617078] transition hover:border-[#217F79] hover:text-[#217F79] disabled:opacity-50"
                            >
                                <LogOut size={19} />
                            </button>
                        )}

                    </div>
                </header>

                {/* Statistics */}
                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            label: "Active incidents",
                            value: incidents.filter((i) => i.status !== "Resolved").length,
                        },
                        {
                            label: "High priority",
                            value: incidents.filter(
                                (i) => i.severity === "High" && i.status !== "Resolved"
                            ).length,
                        },
                        {
                            label: "Awaiting review",
                            value: incidents.filter((i) => i.status === "New").length,
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-[#DFE4E0] bg-white p-5"
                        >
                            <p className="text-sm text-[#617078]">{stat.label}</p>
                            <h3 className="mt-3 text-3xl font-semibold">
                                {String(stat.value).padStart(2, "0")}
                            </h3>
                        </div>
                    ))}
                </section>

                {/* Main dashboard grid */}
                <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">

                    {/* Map area */}
                    <div className="min-h-[440px] overflow-hidden rounded-2xl border border-[#DFE4E0] bg-white">
                        <div className="flex items-center justify-between border-b border-[#DFE4E0] p-5">
                            <div>
                                <h3 className="font-semibold">Live City Map</h3>
                                <p className="text-xs text-[#617078]">
                                    District 01 — simulated environment
                                </p>
                            </div>

                            <Map size={20} className="text-[#217F79]" />
                        </div>

                        <div className="h-[380px] w-full">
                            <CityMap
                                incidents={incidents}
                                selectedIncident={selectedIncident}
                                onSelectIncident={setSelectedIncident}
                                isPickingLocation={isPickingLocation}
                                pickedCoordinates={pickedCoordinates}
                                onPickLocation={setPickedCoordinates}
                            />
                        </div>
                    </div>

                    {/* Incident panel */}
                    <div className="rounded-2xl border border-[#DFE4E0] bg-white p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Recent Incidents</h3>
                                <p className="text-xs text-[#617078]">
                                    Latest simulated reports
                                </p>
                            </div>
                            {!preview && (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    aria-label="Add incident"
                                    className="rounded-lg bg-[#217F79] p-2 text-white"
                                >
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>

                        {loading && <p>Loading incidents...</p>}
                        {error && <p className="text-red-600">{error}</p>}

                        <div className="space-y-3">
                            {incidents.map((incident) => (
                                <button
                                    key={incident.id}
                                    type="button"
                                    onClick={() => setSelectedIncident(incident)}
                                    className={`w-full rounded-xl border p-4 text-left transition ${selectedIncident?.id === incident.id
                                        ? "border-[#217F79] bg-[#EAF3EF]"
                                        : "border-[#DFE4E0] bg-white hover:border-[#217F79]"
                                        }`}
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs text-[#617078]">
                                            {incident.id}
                                        </span>

                                        <span
                                            className="rounded-full px-2 py-1 text-xs"
                                            style={{
                                                color: getIncidentColor(incident.severity),
                                                backgroundColor: `${getIncidentColor(incident.severity)}15`,
                                            }}
                                        >
                                            {incident.severity}
                                        </span>
                                    </div>

                                    <h4 className="text-sm font-semibold">
                                        {incident.title}
                                    </h4>

                                    <p className="mt-1 text-xs text-[#617078]">
                                        {incident.location}
                                    </p>
                                    <p className="mt-2 text-xs font-medium text-[#217F79]">
                                        {incident.status}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
                {selectedIncident && (
                    <IncidentDetails
                        key={selectedIncident.id}
                        incident={selectedIncident}
                        onClose={() => setSelectedIncident(null)}
                        onStatusUpdated={(updated) => {
                            setIncidents((prev) =>
                                prev.map((incident) =>
                                    incident.id === updated.id ? updated : incident
                                )
                            );

                            setSelectedIncident(updated);
                        }}
                        preview={preview}
                    />
                )}
                {!preview && showCreateForm && isPickingLocation && (
                    <div className="fixed inset-x-0 bottom-5 z-[80] mx-auto flex w-fit max-w-[calc(100%-24px)] flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#DFE4E0] bg-white p-3 shadow-xl">
                        <span className="text-sm text-[#202A31]">
                            {pickedCoordinates
                                ? `${pickedCoordinates[1].toFixed(5)}, ${pickedCoordinates[0].toFixed(5)}`
                                : "Click the map to choose a location"}
                        </span>

                        <button
                            type="button"
                            onClick={() => setIsPickingLocation(false)}
                            className="rounded-xl bg-[#217F79] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            disabled={!pickedCoordinates}
                        >
                            Use This Location
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsPickingLocation(false)}
                            className="rounded-xl border border-[#DFE4E0] px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
                <div className={isPickingLocation ? "hidden" : "contents"}>

                    {!preview && showCreateForm && (
                        <CreateIncident
                            onClose={() => {
                                setShowCreateForm(false);
                                setIsPickingLocation(false);
                                setPickedCoordinates(null);
                            }}
                            onCreated={(incident) => {
                                setIncidents((prev) => [incident, ...prev]);
                                setSelectedIncident(incident);
                                setIsPickingLocation(false);
                                setPickedCoordinates(null);
                            }}
                            onStartPicking={() => setIsPickingLocation(true)}
                            pickedCoordinates={pickedCoordinates}
                            isPickingLocation={isPickingLocation}
                            onFinishPicking={() => setIsPickingLocation(false)}
                        />
                    )}
                </div>
            </main>
        </div >
    );
}
