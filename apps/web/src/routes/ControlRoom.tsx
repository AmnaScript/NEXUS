
import { useEffect, useState } from "react";
import {
    Activity,
    ArrowLeft,
    ArrowUpRight,
    Bell,
    CheckCircle2,
    CircleAlert,
    ClipboardList,
    LayoutDashboard,
    LoaderCircle,
    LogOut,
    Map as MapIcon,
    MapPin,
    Menu,
    Plus,
    RefreshCw,
    ShieldCheck,
    X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import CityMap from "../features/city-map/CityMap";
import CreateIncident from "../features/incidents/CreateIncident";
import IncidentDetails from "../features/incidents/IncidentDetails";
import type { Incident } from "../features/incidents/incidents";
import {
    getDemoIncidents,
    getIncidents,
} from "../features/incidents/incidentApi";
import { supabase } from "../lib/supabase";

type Props = {
    preview?: boolean;
};

type Filter = "All" | "Active" | "High" | "Resolved";

const severityStyles: Record<Incident["severity"], string> = {
    High: "border-[#F2B3AB] bg-[#FFE2DD] text-[#AB372F]",
    Medium: "border-[#E8D18A] bg-[#FFF1BE] text-[#795B13]",
    Low: "border-[#AEDBCC] bg-[#DEF6E9] text-[#176B4B]",
};

const filters: Filter[] = [
    "All",
    "Active",
    "High",
    "Resolved",
];

function StatusTag({ status }: { status: Incident["status"] }) {
    const styles = {
        New: "bg-[#FFF0BE] text-[#755714]",
        "Under Review": "bg-[#DBEEEF] text-[#216B76]",
        Resolved: "bg-[#DCF5E5] text-[#176B4B]",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
        >
            {status}
        </span>
    );
}

function Metric({
    label,
    value,
    accent,
    icon: Icon,
    loading,
}: {
    label: string;
    value: number;
    accent: string;
    icon: typeof Activity;
    loading: boolean;
}) {
    return (
        <div className="relative overflow-hidden rounded-[18px] border border-[#DDD6C7] bg-[#FFFCF5] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-[#686778]">
                    {label}
                </p>

                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: accent }}
                >
                    <Icon size={18} strokeWidth={1.9} />
                </span>
            </div>

            {loading ? (
                <div className="mt-5 h-9 w-14 animate-pulse rounded bg-[#E9E2D7]" />
            ) : (
                <p className="nx-display mt-4 text-[38px] font-extrabold leading-none tracking-tight">
                    {String(value).padStart(2, "0")}
                </p>
            )}

            <div
                className="absolute bottom-0 left-0 h-[3px] w-full"
                style={{ backgroundColor: accent }}
            />
        </div>
    );
}

export default function ControlRoom({ preview = false }: Props) {
    const navigate = useNavigate();

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedIncident, setSelectedIncident] =
        useState<Incident | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [filter, setFilter] = useState<Filter>("All");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedCoordinates, setPickedCoordinates] =
        useState<[number, number] | null>(null);

    const [signingOut, setSigningOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const data = preview
                    ? await getDemoIncidents()
                    : await getIncidents();

                if (active) {
                    setIncidents(data);
                    setError("");
                }
            } catch {
                if (active) {
                    setError(
                        preview
                            ? "We couldn't load the public demo incidents."
                            : "We couldn't load the incident records."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, [preview]);

    async function refreshIncidents() {
        if (refreshing) return;

        setRefreshing(true);
        setError("");

        try {
            const data = preview
                ? await getDemoIncidents()
                : await getIncidents();

            setIncidents(data);

            if (selectedIncident) {
                setSelectedIncident(
                    data.find((item) => item.id === selectedIncident.id) ?? null
                );
            }
        } catch {
            setError("Unable to refresh incidents. Try again.");
        } finally {
            setRefreshing(false);
        }
    }

    async function handleLogout() {
        if (signingOut) return;

        setSigningOut(true);
        setLogoutError("");

        try {
            const { error: authError } = await supabase.auth.signOut();
            if (authError) throw authError;

            navigate("/login", { replace: true });
        } catch {
            setLogoutError("Sign out failed. Please try again.");
            setSigningOut(false);
        }
    }

    function closeCreate() {
        setShowCreateForm(false);
        setIsPickingLocation(false);
        setPickedCoordinates(null);
    }

    function openCreate() {
        setPickedCoordinates(null);
        setIsPickingLocation(false);
        setShowCreateForm(true);
    }

    function handleIncidentCreated(incident: Incident) {
        setIncidents((previous) => [incident, ...previous]);
        setSelectedIncident(incident);
        setFilter("All");
        closeCreate();
    }

    function handleStatusUpdated(updated: Incident) {
        setIncidents((previous) =>
            previous.map((incident) =>
                incident.id === updated.id ? updated : incident
            )
        );
        setSelectedIncident(updated);
    }

    const activeCount = incidents.filter(
        (incident) => incident.status !== "Resolved"
    ).length;

    const highCount = incidents.filter(
        (incident) =>
            incident.severity === "High" && incident.status !== "Resolved"
    ).length;

    const awaitingCount = incidents.filter(
        (incident) => incident.status === "New"
    ).length;

    const resolvedCount = incidents.filter(
        (incident) => incident.status === "Resolved"
    ).length;

    const filteredIncidents = incidents.filter((incident) => {
        switch (filter) {
            case "Active":
                return incident.status !== "Resolved";
            case "High":
                return incident.severity === "High";
            case "Resolved":
                return incident.status === "Resolved";
            default:
                return true;
        }
    });

    const navigation = [
        { id: "overview", title: "Overview", icon: LayoutDashboard },
        { id: "city-map", title: "City Map", icon: MapIcon },
        { id: "incident-list", title: "Incidents", icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-[#FFF6E5] font-sans text-[#1B1F3B]">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r-2 border-[#1B1F3B] bg-[#1B1F3B] text-[#FFF6E5] lg:flex">
                <Link
                    to="/"
                    className="nx-display border-b border-white/15 px-7 py-6 text-3xl font-extrabold"
                >
                    nexus<span className="text-[#FFC93C]">.</span>
                </Link>

                <div className="px-5 pt-9">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#AEB4C7]">
                        Workspace
                    </p>

                    <nav className="mt-4 flex flex-col gap-1" aria-label="Control Room">
                        {navigation.map(({ id, title, icon: Icon }, index) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${index === 0
                                        ? "bg-[#343A58] text-white"
                                        : "text-[#C2C4D3] hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Icon size={19} strokeWidth={1.8} />
                                {title}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className="mt-9 px-5">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#AEB4C7]">
                        Navigation
                    </p>

                    <Link
                        to="/"
                        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#C2C4D3] hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft size={19} />
                        Website
                    </Link>

                    {!preview && (
                        <Link
                            to="/preview"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#C2C4D3] hover:bg-white/10 hover:text-white"
                        >
                            <ShieldCheck size={19} />
                            Public preview
                        </Link>
                    )}
                </div>

                <div className="mt-auto px-5 pb-6">
                    <div className="rounded-[16px] border border-white/20 bg-white/10 p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#3DBE7A]" />
                            <p className="text-xs font-bold">
                                {preview ? "Public preview" : "Operator workspace"}
                            </p>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#C8C7D4]">
                            {preview
                                ? "Read-only fictional incident data."
                                : "Protected incident management."}
                        </p>
                    </div>

                    {!preview && (
                        <button
                            type="button"
                            onClick={() => void handleLogout()}
                            disabled={signingOut}
                            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#E9C7C3] hover:bg-white/10 disabled:opacity-60"
                        >
                            <LogOut size={18} />
                            {signingOut ? "Signing out..." : "Sign out"}
                        </button>
                    )}
                </div>
            </aside>

            {/* Workspace */}
            <div className="min-w-0 lg:pl-[232px]">
                {/* Mobile header */}
                <div className="sticky top-0 z-30 flex h-[67px] items-center justify-between border-b-2 border-[#1B1F3B] bg-[#FFF6E5] px-4 lg:hidden">
                    <Link to="/" className="nx-display text-[26px] font-extrabold">
                        nexus<span className="text-[#FF5A4E]">.</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((value) => !value)}
                        aria-label="Toggle navigation"
                        aria-expanded={mobileMenuOpen}
                        className="rounded-xl border-2 border-[#1B1F3B] p-2"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <nav className="sticky top-[67px] z-30 flex flex-col border-b-2 border-[#1B1F3B] bg-[#FFF6E5] p-4 lg:hidden">
                        {navigation.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-3 py-3 text-sm font-bold hover:bg-[#F5E8D0]"
                            >
                                {item.title}
                            </a>
                        ))}

                        <Link
                            to="/"
                            className="rounded-lg px-3 py-3 text-sm font-bold"
                        >
                            Back to website
                        </Link>

                        {preview ? (
                            <Link
                                to="/login"
                                className="rounded-lg px-3 py-3 text-sm font-bold text-[#D64C42]"
                            >
                                Operator login
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => void handleLogout()}
                                disabled={signingOut}
                                className="px-3 py-3 text-left text-sm font-bold text-[#D64C42]"
                            >
                                Sign out
                            </button>
                        )}
                    </nav>
                )}

                <main
                    id="overview"
                    className="mx-auto max-w-[1700px] scroll-mt-24 px-4 py-6 sm:px-7 sm:py-8 xl:px-10"
                >
                    {/* Header */}
                    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#3DBE7A]" />
                                <span className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#636273]">
                                    District 01
                                </span>
                                <span className="text-[#B3AA9D]">/</span>
                                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#636273]">
                                    {preview ? "Demo mode" : "Operations"}
                                </span>
                            </div>

                            <h1 className="nx-display mt-3 text-[clamp(2.15rem,4vw,3.8rem)] font-extrabold leading-[1.02]">
                                City Control Room<span className="text-[#FF5A4E]">.</span>
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#646478]">
                                Everything happening across your city, in one clear view.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => void refreshIncidents()}
                                disabled={loading || refreshing}
                                aria-label="Refresh incidents"
                                title="Refresh incident records"
                                className="flex h-[44px] items-center gap-2 rounded-full border border-[#D7CEBE] bg-white px-4 text-xs font-bold transition hover:border-[#1B1F3B] disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            {preview ? (
                                <Link
                                    to="/login"
                                    className="nx-button nx-button-ink min-h-[44px] px-4"
                                >
                                    Operator login
                                    <ArrowUpRight size={16} />
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="nx-button nx-button-yellow min-h-[44px] px-4"
                                >
                                    <Plus size={17} />
                                    New incident
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Public preview notice */}
                    {preview && (
                        <div className="mt-7 flex flex-wrap items-center gap-3 rounded-xl border border-[#E3CF8D] bg-[#FFF1BE] px-4 py-3">
                            <ShieldCheck size={19} className="shrink-0" />
                            <p className="flex-1 text-xs leading-6">
                                <strong>Public demonstration.</strong> You can explore incidents,
                                but creating reports and changing statuses requires operator access.
                            </p>
                            <Link to="/login" className="text-xs font-extrabold underline">
                                Sign in
                            </Link>
                        </div>
                    )}

                    {logoutError && (
                        <p role="alert" className="mt-5 text-sm font-semibold text-[#B23932]">
                            {logoutError}
                        </p>
                    )}

                    {/* Metrics */}
                    <section
                        aria-label="Incident summary"
                        className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4"
                    >
                        <Metric
                            label="Active incidents"
                            value={activeCount}
                            icon={Activity}
                            accent="#2EC4B6"
                            loading={loading}
                        />
                        <Metric
                            label="High priority"
                            value={highCount}
                            icon={CircleAlert}
                            accent="#FF8F7A"
                            loading={loading}
                        />
                        <Metric
                            label="Awaiting review"
                            value={awaitingCount}
                            icon={ClipboardList}
                            accent="#FFC93C"
                            loading={loading}
                        />
                        <Metric
                            label="Resolved"
                            value={resolvedCount}
                            icon={CheckCircle2}
                            accent="#3DBE7A"
                            loading={loading}
                        />
                    </section>

                    {error && (
                        <div
                            role="alert"
                            className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#EFBBB4] bg-[#FFE3DD] px-4 py-3"
                        >
                            <span className="text-sm font-medium text-[#9F3833]">
                                {error}
                            </span>
                            <button
                                type="button"
                                onClick={() => void refreshIncidents()}
                                className="shrink-0 text-xs font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Map and incident queue */}
                    <div className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_355px]">
                        <section
                            id="city-map"
                            className="scroll-mt-24 overflow-hidden rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5]"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DED2] px-5 py-4 sm:px-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <MapIcon size={18} className="text-[#D95247]" />
                                        <h2 className="font-display text-lg font-extrabold">
                                            City map
                                        </h2>
                                    </div>
                                    <p className="mt-1 text-xs text-[#777587]">
                                        District 01 · Select a marker to inspect an incident
                                    </p>
                                </div>

                                <span className="rounded-full bg-[#E0F3E8] px-3 py-1.5 text-[10px] font-bold text-[#176B4B]">
                                    MAP VIEW
                                </span>
                            </div>

                            {/* Map must remain mounted for map-based location picking */}
                            <div className="relative h-[390px] w-full sm:h-[520px]">
                                <CityMap
                                    incidents={incidents}
                                    selectedIncident={selectedIncident}
                                    onSelectIncident={(incident) => {
                                        if (isPickingLocation) return;
                                        setSelectedIncident(incident);
                                    }}
                                    isPickingLocation={isPickingLocation}
                                    pickedCoordinates={pickedCoordinates}
                                    onPickLocation={setPickedCoordinates}
                                />

                                {loading && (
                                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#FFF6E5]/75">
                                        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow">
                                            <LoaderCircle size={19} className="animate-spin" />
                                            Loading city incidents...
                                        </div>
                                    </div>
                                )}

                                {isPickingLocation && (
                                    <div className="pointer-events-none absolute left-1/2 top-4 z-20 w-[calc(100%-24px)] max-w-[340px] -translate-x-1/2 rounded-xl border border-[#1B1F3B] bg-[#FFC93C] px-4 py-3 text-center shadow-[3px_4px_0_#1B1F3B]">
                                        <p className="text-xs font-extrabold">
                                            Choose an incident location
                                        </p>
                                        <p className="mt-1 text-[11px]">
                                            Click or tap the map to place a marker.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4DED2] px-5 py-3 sm:px-6">
                                <p className="text-xs text-[#777587]">
                                    Map data © OpenStreetMap contributors
                                </p>
                                <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
                                    {[
                                        ["High", "#FF5A4E"],
                                        ["Medium", "#D9A72E"],
                                        ["Low", "#2FAE79"],
                                    ].map(([label, color]) => (
                                        <span key={label} className="flex items-center gap-1.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section
                            id="incident-list"
                            className="scroll-mt-24 overflow-hidden rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5]"
                        >
                            <div className="border-b border-[#E4DED2] px-5 py-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-display text-xl font-extrabold">
                                            Incident queue
                                        </h2>
                                        <p className="mt-1 text-xs text-[#777587]">
                                            {loading
                                                ? "Loading reports..."
                                                : `${filteredIncidents.length} of ${incidents.length} reports`}
                                        </p>
                                    </div>

                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE2DD] text-[#B9443B]">
                                        <Bell size={20} />
                                    </span>
                                </div>

                                <div
                                    className="mt-5 flex flex-wrap gap-2"
                                    role="group"
                                    aria-label="Filter incidents"
                                >
                                    {filters.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setFilter(item)}
                                            aria-pressed={filter === item}
                                            className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${filter === item
                                                    ? "border-[#1B1F3B] bg-[#1B1F3B] text-white"
                                                    : "border-[#DED8CB] bg-white text-[#626174] hover:border-[#1B1F3B]"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="max-h-[650px] space-y-2 overflow-y-auto p-3 sm:p-4 xl:max-h-[610px]">
                                {loading &&
                                    Array.from({ length: 3 }, (_, i) => (
                                        <div
                                            key={i}
                                            className="h-[125px] animate-pulse rounded-xl bg-[#F1EDE4]"
                                        />
                                    ))}

                                {!loading && filteredIncidents.length === 0 && (
                                    <div className="flex flex-col items-center px-5 py-16 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DCF5E5]">
                                            <CheckCircle2 size={30} className="text-[#25885B]" />
                                        </div>

                                        <h3 className="nx-display mt-5 text-xl font-extrabold">
                                            Nothing in this view.
                                        </h3>

                                        <p className="mt-2 max-w-[240px] text-sm leading-6 text-[#777587]">
                                            {filter === "All"
                                                ? "No incidents have been reported yet."
                                                : "Try another filter to explore the incident queue."}
                                        </p>

                                        {filter !== "All" && (
                                            <button
                                                type="button"
                                                onClick={() => setFilter("All")}
                                                className="mt-5 text-xs font-bold underline"
                                            >
                                                Show all incidents
                                            </button>
                                        )}
                                    </div>
                                )}

                                {!loading &&
                                    filteredIncidents.map((incident) => {
                                        const selected = selectedIncident?.id === incident.id;

                                        return (
                                            <button
                                                key={incident.id}
                                                type="button"
                                                onClick={() => setSelectedIncident(incident)}
                                                className={`w-full rounded-[14px] border p-4 text-left transition ${selected
                                                        ? "border-[#1B1F3B] bg-[#FFF0C9] shadow-[2px_3px_0_#1B1F3B]"
                                                        : "border-[#E5DED1] bg-white hover:border-[#1B1F3B]"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="break-all font-mono text-[10px] font-bold text-[#7A7680]">
                                                        {incident.id}
                                                    </span>

                                                    <span
                                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${severityStyles[incident.severity]
                                                            }`}
                                                    >
                                                        {incident.severity}
                                                    </span>
                                                </div>

                                                <h3 className="mt-3 text-[14px] font-extrabold leading-5">
                                                    {incident.title}
                                                </h3>

                                                <div className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#747486]">
                                                    <MapPin size={14} className="mt-0.5 shrink-0" />
                                                    <span>{incident.location}</span>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E8E3D9] pt-3">
                                                    <StatusTag status={incident.status} />
                                                    <span className="flex items-center gap-1 text-[11px] font-bold">
                                                        Details
                                                        <ArrowUpRight size={14} />
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        </section>
                    </div>

                    <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#D9D1C2] pt-5">
                        <p className="text-xs text-[#777587]">
                            NEXUS · The City That Thinks
                        </p>
                        <p className="text-xs text-[#777587]">
                            {preview
                                ? "Public read-only environment"
                                : "Authorized operator workspace"}
                        </p>
                    </footer>
                </main>
            </div>

            {/* Details drawer */}
            {selectedIncident && !isPickingLocation && (
                <IncidentDetails
                    key={selectedIncident.id}
                    incident={selectedIncident}
                    preview={preview}
                    onClose={() => setSelectedIncident(null)}
                    onStatusUpdated={handleStatusUpdated}
                />
            )}

            {/* Map picking controls */}
            {!preview && showCreateForm && isPickingLocation && (
                <div className="fixed inset-x-3 bottom-4 z-[80] mx-auto max-w-[510px] rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFDF7] p-4 shadow-[5px_6px_0_#1B1F3B]">
                    <div className="flex items-start gap-3">
                        <MapPin size={20} className="mt-0.5 shrink-0 text-[#D94C42]" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold">
                                Location selection
                            </p>
                            <p className="mt-1 text-xs text-[#6B6979]">
                                {pickedCoordinates
                                    ? `${pickedCoordinates[1].toFixed(5)}° N, ${pickedCoordinates[0].toFixed(5)}° E`
                                    : "Tap a place on the map to select it."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setPickedCoordinates(null);
                                setIsPickingLocation(false);
                            }}
                            className="nx-button nx-button-paper min-h-[42px] px-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!pickedCoordinates}
                            onClick={() => setIsPickingLocation(false)}
                            className="nx-button nx-button-yellow min-h-[42px] px-3"
                        >
                            Use location
                        </button>
                    </div>
                </div>
            )}

            {/* Keep form mounted while selecting a point, to preserve inputs */}
            {!preview && showCreateForm && (
                <div className={isPickingLocation ? "hidden" : "contents"}>
                    <CreateIncident
                        onClose={closeCreate}
                        onCreated={handleIncidentCreated}
                        onStartPicking={() => setIsPickingLocation(true)}
                        onFinishPicking={() => setIsPickingLocation(false)}
                        isPickingLocation={isPickingLocation}
                        pickedCoordinates={pickedCoordinates}
                    />
                </div>
            )}
        </div>
    );
}
