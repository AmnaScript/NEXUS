
import { useCallback, useEffect, useState } from "react";
import {
    Activity,
    ArrowLeft,
    ArrowUpRight,
    BarChart3,
    Bell,
    Check,
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
    Settings2,
    ShieldCheck,
    X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import CityMap from "../features/city-map/CityMap";
import CreateIncident from "../features/incidents/CreateIncident";
import IncidentDetails from "../features/incidents/IncidentDetails";
import IncidentAnalytics from "../features/incidents/IncidentAnalytics";
import ControlRoomPreferences, {
    readControlRoomSettings,
    saveControlRoomSettings,
} from "../features/incidents/ControlRoomPreferences";

import type { ControlRoomSettings } from
    "../features/incidents/ControlRoomPreferences";
import type { Incident } from "../features/incidents/incidents";

import {
    getDemoIncidents,
    getIncidents,
} from "../features/incidents/incidentApi";

import { supabase } from "../lib/supabase";
import OperatorAlertsButton from "../features/incidents/OperatorAlertsButton";
import { operatorApi } from "../lib/operatorApi";

type Props = { preview?: boolean };
type View = "overview" | "analytics" | "settings";
type Filter = "All" | "Active" | "High" | "Resolved";

const READ_ALERTS_KEY = "nexus-read-incident-alerts-v1";

const FILTERS: Filter[] = [
    "All",
    "Active",
    "High",
    "Resolved",
];

const severityStyles: Record<Incident["severity"], string> = {
    High: "border-[#F2B3AB] bg-[#FFE2DD] text-[#AB372F]",
    Medium: "border-[#E8D18A] bg-[#FFF1BE] text-[#795B13]",
    Low: "border-[#AEDBCC] bg-[#DEF6E9] text-[#176B4B]",
};

const statusStyles: Record<Incident["status"], string> = {
    New: "bg-[#FFF0BE] text-[#755714]",
    "Under Review": "bg-[#DBEEEF] text-[#216B76]",
    Resolved: "bg-[#DCF5E5] text-[#176B4B]",
};

function readSeenAlerts(): string[] {
    try {
        const value = JSON.parse(
            localStorage.getItem(READ_ALERTS_KEY) || "[]"
        ) as unknown;

        return Array.isArray(value)
            ? value.filter((id): id is string => typeof id === "string")
            : [];
    } catch {
        return [];
    }
}

function saveSeenAlerts(ids: string[]) {
    try {
        localStorage.setItem(
            READ_ALERTS_KEY,
            JSON.stringify(ids.slice(-200))
        );
    } catch {
        // Read/unread state still works during this session.
    }
}

function Metric({
    title,
    value,
    icon: Icon,
    accent,
    loading,
}: {
    title: string;
    value: number;
    icon: typeof Activity;
    accent: string;
    loading: boolean;
}) {
    return (
        <div className="relative overflow-hidden rounded-[18px] border border-[#DDD6C7] bg-[#FFFCF5] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-[#686778]">{title}</p>
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

function IncidentStatus({ status }: { status: Incident["status"] }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
}

export default function ControlRoom({ preview = false }: Props) {
    const navigate = useNavigate();

    const [view, setView] = useState<View>("overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedIncident, setSelectedIncident] =
        useState<Incident | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [filter, setFilter] = useState<Filter>("All");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedCoordinates, setPickedCoordinates] =
        useState<[number, number] | null>(null);

    const [signingOut, setSigningOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const [settings, setSettings] = useState<ControlRoomSettings>(
        readControlRoomSettings
    );
    const [settingsLoading, setSettingsLoading] = useState(!preview);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsError, setSettingsError] = useState("");

    const [seenAlerts, setSeenAlerts] = useState<string[]>(
        readSeenAlerts
    );

    const loadIncidents = useCallback(async () => {
        const data = preview
            ? await getDemoIncidents()
            : await getIncidents();

        setIncidents(data);
        setSelectedIncident((previous) =>
            previous
                ? data.find((item) => item.id === previous.id) ?? null
                : null
        );

        setError("");
    }, [preview]);

    // Initial load
    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const data = preview
                    ? await getDemoIncidents()
                    : await getIncidents();

                if (!active) return;
                setIncidents(data);
                setError("");
            } catch {
                if (active) {
                    setError("Unable to load incident records.");
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

    // Refresh the public preview when Rescue Run writes local incidents.
    useEffect(() => {
        if (!preview) return;

        const refresh = () => {
            void loadIncidents().catch(() => {
                setError("Unable to refresh demo incidents.");
            });
        };

        const onStorage = (event: StorageEvent) => {
            if (
                event.key === "nexus-rescue-demo-incidents-v1" ||
                event.key === null
            ) {
                refresh();
            }
        };

        window.addEventListener("nexus:game-incidents-updated", refresh);
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener(
                "nexus:game-incidents-updated",
                refresh
            );
            window.removeEventListener("storage", onStorage);
        };
    }, [preview, loadIncidents]);

    // Public preview uses browser-local settings; operators use PostgreSQL.
    useEffect(() => {
        if (preview) saveControlRoomSettings(settings);
    }, [preview, settings]);

    useEffect(() => {
        if (preview) return;
        let mounted = true;

        void operatorApi.me().then((account) => {
            if (!mounted) return;
            setSettings({
                compactCards: account.preferences.compactCards,
                highlightHighPriority: account.preferences.highlightHighPriority,
                autoRefresh: account.preferences.autoRefresh,
            });
            setSettingsError("");
        }).catch((cause: unknown) => {
            if (!mounted) return;
            setSettingsError(cause instanceof Error
                ? `Unable to load operator preferences: ${cause.message}`
                : "Unable to load operator preferences.");
        }).finally(() => {
            if (mounted) setSettingsLoading(false);
        });

        return () => { mounted = false; };
    }, [preview]);

    async function changeOperatorSettings(next: ControlRoomSettings) {
        if (preview) {
            setSettings(next);
            return;
        }
        if (settingsLoading || settingsSaving) return;
        setSettingsSaving(true);
        setSettingsError("");
        try {
            const account = await operatorApi.me();
            const saved = await operatorApi.savePreferences({
                compactCards: next.compactCards,
                highlightHighPriority: next.highlightHighPriority,
                autoRefresh: next.autoRefresh,
                notificationsEnabled: account.preferences.notificationsEnabled,
            });
            setSettings({
                compactCards: saved.compactCards,
                highlightHighPriority: saved.highlightHighPriority,
                autoRefresh: saved.autoRefresh,
            });
        } catch (cause) {
            setSettingsError(cause instanceof Error
                ? `Unable to save operator preferences: ${cause.message}`
                : "Unable to save operator preferences.");
        } finally {
            setSettingsSaving(false);
        }
    }

    async function openOperatorAlert(incidentId: string) {
        setView("overview");
        setFilter("All");
        setMobileMenuOpen(false);
        const found = incidents.find((incident) => incident.id === incidentId);
        if (found) {
            setSelectedIncident(found);
            return;
        }
        // The alert may refer to an incident created since the last refresh.
        try {
            const data = await getIncidents();
            setIncidents(data);
            const fresh = data.find((incident) => incident.id === incidentId);
            if (fresh) {
                setSelectedIncident(fresh);
                setError("");
            } else {
                setError("This incident is no longer available in the current queue.");
            }
        } catch {
            setError("Couldn't load the incident from this notification. Refresh and try again.");
        }
    }

    // Optional automatic refresh, every 60 seconds.
    useEffect(() => {
        if (!settings.autoRefresh || (!preview && settingsLoading)) return;

        const interval = window.setInterval(() => {
            void loadIncidents().catch(() => {
                setError("Automatic refresh failed. Previous data is shown.");
            });
        }, 60000);

        return () => window.clearInterval(interval);
    }, [settings.autoRefresh, settingsLoading, preview, loadIncidents]);

    async function refreshIncidents() {
        if (refreshing || loading) return;

        setRefreshing(true);

        try {
            await loadIncidents();
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

    function openCreate() {
        if (preview) return;

        setView("overview");
        setSelectedIncident(null);
        setPickedCoordinates(null);
        setIsPickingLocation(false);
        setShowCreateForm(true);
    }

    function closeCreate() {
        setShowCreateForm(false);
        setIsPickingLocation(false);
        setPickedCoordinates(null);
    }

    function handleCreated(incident: Incident) {
        setIncidents((previous) => [incident, ...previous]);
        setSelectedIncident(incident);
        setView("overview");
        setFilter("All");
        closeCreate();
    }

    function handleStatusUpdated(updated: Incident) {
        setIncidents((previous) =>
            previous.map((item) =>
                item.id === updated.id ? updated : item
            )
        );
        setSelectedIncident(updated);
    }

    function changeView(next: View) {
        setView(next);
        setMobileMenuOpen(false);
        setAlertsOpen(false);

        if (next !== "overview") {
            setSelectedIncident(null);
        }
    }

    function markSeen(id: string) {
        setSeenAlerts((previous) => {
            if (previous.includes(id)) return previous;

            const next = [...previous, id];
            saveSeenAlerts(next);
            return next;
        });
    }

    const alerts = [...incidents]
        .filter(
            (incident) =>
                incident.status === "New" ||
                (incident.severity === "High" &&
                    incident.status !== "Resolved")
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

    const unreadCount = alerts.filter(
        (incident) => !seenAlerts.includes(incident.id)
    ).length;

    function markAllSeen() {
        const ids = new Set(seenAlerts);
        alerts.forEach((incident) => ids.add(incident.id));

        const next = [...ids];
        setSeenAlerts(next);
        saveSeenAlerts(next);
    }

    function openAlert(incident: Incident) {
        markSeen(incident.id);
        setView("overview");
        setFilter("All");
        setSelectedIncident(incident);
        setAlertsOpen(false);
        setMobileMenuOpen(false);
    }

    const active = incidents.filter(
        (incident) => incident.status !== "Resolved"
    ).length;

    const high = incidents.filter(
        (incident) =>
            incident.severity === "High" &&
            incident.status !== "Resolved"
    ).length;

    const awaiting = incidents.filter(
        (incident) => incident.status === "New"
    ).length;

    const resolved = incidents.filter(
        (incident) => incident.status === "Resolved"
    ).length;

    const filtered = incidents.filter((incident) => {
        if (filter === "Active") return incident.status !== "Resolved";
        if (filter === "High") return incident.severity === "High";
        if (filter === "Resolved") return incident.status === "Resolved";
        return true;
    });

    const navigation = [
        { id: "overview" as const, title: "Overview", icon: LayoutDashboard },
        { id: "analytics" as const, title: "Analytics", icon: BarChart3 },
        { id: "settings" as const, title: "Settings", icon: Settings2 },
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

                    <nav
                        className="mt-4 flex flex-col gap-1"
                        aria-label="Control Room"
                    >
                        {navigation.map(({ id, title, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => changeView(id)}
                                aria-current={view === id ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${view === id
                                    ? "bg-[#343A58] text-white"
                                    : "text-[#C2C4D3] hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Icon size={19} strokeWidth={1.8} />
                                {title}
                            </button>
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
                            to="/operator"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#C2C4D3] hover:bg-white/10 hover:text-white"
                        >
                            <ShieldCheck size={19} />
                            My account & team
                        </Link>
                    )}

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

            {/* Main workspace */}
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
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => changeView(item.id)}
                                className="rounded-lg px-3 py-3 text-left text-sm font-bold hover:bg-[#F5E8D0]"
                            >
                                {item.title}
                            </button>
                        ))}

                        <Link
                            to="/"
                            className="rounded-lg px-3 py-3 text-sm font-bold"
                        >
                            Back to website
                        </Link>

                        {!preview && (
                            <Link
                                to="/operator"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-3 py-3 text-sm font-bold"
                            >
                                My account & team
                            </Link>
                        )}

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

                <main className="mx-auto max-w-[1700px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">
                    {/* Heading and actions */}
                    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <p className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#636273]">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#3DBE7A]" />
                                District 01
                                <span className="text-[#B3AA9D]">/</span>
                                {view}
                            </p>

                            <h1 className="nx-display mt-3 text-[clamp(2.15rem,4vw,3.8rem)] font-extrabold leading-[1.02]">
                                City Control Room
                                <span className="text-[#FF5A4E]">.</span>
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#646478]">
                                Incident records, city mapping, and operational insight
                                in one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Read receipts are account-backed for operators; local only for preview. */}
                            {preview ? (
                                <>
                                    {/* Notifications */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setAlertsOpen((value) => !value)}
                                            aria-label={`Incident alerts, ${unreadCount} unread`}
                                            aria-expanded={alertsOpen}
                                            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#D7CEBE] bg-white hover:border-[#1B1F3B]"
                                        >
                                            <Bell size={18} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5A4E] px-1 text-[10px] font-extrabold text-white">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {alertsOpen && (
                                            <div className="absolute right-0 top-14 z-40 w-[min(88vw,360px)] overflow-hidden rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFCF5] shadow-[5px_6px_0_#1B1F3B]">
                                                <div className="flex items-center justify-between gap-3 border-b border-[#E4DDD0] px-4 py-4">
                                                    <div>
                                                        <h2 className="nx-display text-lg font-extrabold">
                                                            Incident alerts
                                                        </h2>
                                                        <p className="mt-1 text-[11px] text-[#777587]">
                                                            {unreadCount} unread
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={markAllSeen}
                                                        disabled={unreadCount === 0}
                                                        className="flex items-center gap-1 text-[11px] font-bold disabled:opacity-50"
                                                    >
                                                        <Check size={14} />
                                                        Mark read
                                                    </button>
                                                </div>

                                                <div className="max-h-[350px] overflow-y-auto p-2">
                                                    {alerts.length === 0 ? (
                                                        <div className="px-4 py-10 text-center">
                                                            <CheckCircle2
                                                                size={27}
                                                                className="mx-auto text-[#3DBE7A]"
                                                            />
                                                            <p className="mt-3 text-sm font-bold">
                                                                No current alerts
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        alerts.slice(0, 20).map((incident) => {
                                                            const unread = !seenAlerts.includes(incident.id);

                                                            return (
                                                                <button
                                                                    key={incident.id}
                                                                    type="button"
                                                                    onClick={() => openAlert(incident)}
                                                                    className={`mb-1 w-full rounded-xl border p-3 text-left hover:border-[#1B1F3B] ${unread
                                                                        ? "border-[#EBC4AC] bg-[#FFF1E4]"
                                                                        : "border-transparent bg-white"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`h-2 w-2 shrink-0 rounded-full ${unread
                                                                                ? "bg-[#FF5A4E]"
                                                                                : "bg-[#C8C3B9]"
                                                                                }`}
                                                                        />
                                                                        <span className="truncate text-xs font-extrabold">
                                                                            {incident.title}
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-2 pl-4 text-[11px] text-[#777587]">
                                                                        {incident.severity} priority · {incident.status}
                                                                    </p>
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                <div className="border-t border-[#E4DDD0] px-4 py-3 text-[10px] leading-5 text-[#777587]">
                                                    Alerts are based on loaded incidents. Read
                                                    state is saved in this browser.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </>
                            ) : (
                                <OperatorAlertsButton onOpenIncident={(id) => void openOperatorAlert(id)} />
                            )}

                            <button
                                type="button"
                                onClick={() => void refreshIncidents()}
                                disabled={loading || refreshing}
                                className="flex h-11 items-center gap-2 rounded-full border border-[#D7CEBE] bg-white px-4 text-xs font-bold hover:border-[#1B1F3B] disabled:opacity-50"
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

                    {preview && (
                        <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#E3CF8D] bg-[#FFF1BE] px-4 py-3">
                            <ShieldCheck size={19} className="shrink-0" />
                            <p className="text-xs leading-6">
                                <strong>Public demonstration.</strong> Browse
                                fictional incident records and analytics without
                                editing protected data.
                            </p>
                        </div>
                    )}

                    {logoutError && (
                        <p role="alert" className="mt-4 text-sm text-[#B23932]">
                            {logoutError}
                        </p>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#EFBBB4] bg-[#FFE3DD] px-4 py-3"
                        >
                            <span className="text-sm text-[#9F3833]">{error}</span>
                            <button
                                type="button"
                                onClick={() => void refreshIncidents()}
                                className="text-xs font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {view === "overview" && (
                        <>
                            {/* Incident metrics */}
                            <section
                                aria-label="Incident summary"
                                className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4"
                            >
                                <Metric
                                    title="Active incidents"
                                    value={active}
                                    icon={Activity}
                                    accent="#2EC4B6"
                                    loading={loading}
                                />
                                <Metric
                                    title="High priority"
                                    value={high}
                                    icon={CircleAlert}
                                    accent="#FF8F7A"
                                    loading={loading}
                                />
                                <Metric
                                    title="Awaiting review"
                                    value={awaiting}
                                    icon={ClipboardList}
                                    accent="#FFC93C"
                                    loading={loading}
                                />
                                <Metric
                                    title="Resolved"
                                    value={resolved}
                                    icon={CheckCircle2}
                                    accent="#3DBE7A"
                                    loading={loading}
                                />
                            </section>

                            <div className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_355px]">
                                {/* Existing interactive map */}
                                <section className="overflow-hidden rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5]">
                                    <div className="flex items-center justify-between gap-3 border-b border-[#E4DED2] px-5 py-4 sm:px-6">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <MapIcon
                                                    size={18}
                                                    className="text-[#D95247]"
                                                />
                                                <h2 className="nx-display text-lg font-extrabold">
                                                    City map
                                                </h2>
                                            </div>
                                            <p className="mt-1 text-xs text-[#777587]">
                                                Select a marker to inspect an incident
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-[#E0F3E8] px-3 py-1.5 text-[10px] font-bold text-[#176B4B]">
                                            MAP VIEW
                                        </span>
                                    </div>

                                    <div className="relative h-[390px] w-full sm:h-[520px]">
                                        <CityMap
                                            incidents={incidents}
                                            selectedIncident={selectedIncident}
                                            onSelectIncident={(incident) => {
                                                if (!isPickingLocation) {
                                                    setSelectedIncident(incident);
                                                }
                                            }}
                                            isPickingLocation={isPickingLocation}
                                            pickedCoordinates={pickedCoordinates}
                                            onPickLocation={setPickedCoordinates}
                                        />

                                        {loading && (
                                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#FFF6E5]/75">
                                                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold shadow">
                                                    <LoaderCircle
                                                        size={19}
                                                        className="animate-spin"
                                                    />
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
                                        <div className="flex gap-3 text-[11px] font-semibold">
                                            {[
                                                ["High", "#FF5A4E"],
                                                ["Medium", "#D9A72E"],
                                                ["Low", "#2FAE79"],
                                            ].map(([label, color]) => (
                                                <span
                                                    key={label}
                                                    className="flex items-center gap-1.5"
                                                >
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

                                {/* Incident queue */}
                                <section className="overflow-hidden rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5]">
                                    <div className="border-b border-[#E4DED2] px-5 py-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="nx-display text-xl font-extrabold">
                                                    Incident queue
                                                </h2>
                                                <p className="mt-1 text-xs text-[#777587]">
                                                    {loading
                                                        ? "Loading reports..."
                                                        : `${filtered.length} of ${incidents.length} reports`}
                                                </p>
                                            </div>

                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE2DD] text-[#B9443B]">
                                                <ClipboardList size={20} />
                                            </span>
                                        </div>

                                        <div
                                            className="mt-5 flex flex-wrap gap-2"
                                            role="group"
                                            aria-label="Filter incidents"
                                        >
                                            {FILTERS.map((item) => (
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

                                    <div className="max-h-[650px] space-y-2 overflow-y-auto p-3 sm:p-4">
                                        {loading &&
                                            Array.from({ length: 3 }, (_, index) => (
                                                <div
                                                    key={index}
                                                    className="h-28 animate-pulse rounded-xl bg-[#F1EDE4]"
                                                />
                                            ))}

                                        {!loading && filtered.length === 0 && (
                                            <div className="px-5 py-14 text-center">
                                                <CheckCircle2
                                                    size={30}
                                                    className="mx-auto text-[#3DBE7A]"
                                                />

                                                <h3 className="nx-display mt-4 text-lg font-extrabold">
                                                    Nothing in this view.
                                                </h3>

                                                <p className="mt-2 text-xs leading-6 text-[#777587]">
                                                    Try another filter or refresh the records.
                                                </p>

                                                {filter !== "All" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFilter("All")}
                                                        className="mt-4 text-xs font-bold underline"
                                                    >
                                                        Show all incidents
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {!loading &&
                                            filtered.map((incident) => {
                                                const selected =
                                                    selectedIncident?.id === incident.id;

                                                const priority =
                                                    incident.severity === "High" &&
                                                    incident.status !== "Resolved" &&
                                                    settings.highlightHighPriority;

                                                return (
                                                    <button
                                                        key={incident.id}
                                                        type="button"
                                                        onClick={() => setSelectedIncident(incident)}
                                                        className={`w-full rounded-[14px] border text-left transition ${settings.compactCards ? "p-3" : "p-4"
                                                            } ${selected
                                                                ? "border-[#1B1F3B] bg-[#FFF0C9] shadow-[2px_3px_0_#1B1F3B]"
                                                                : priority
                                                                    ? "border-[#FF9B8D] bg-[#FFF3EF] hover:border-[#D74940]"
                                                                    : "border-[#E5DED1] bg-white hover:border-[#1B1F3B]"
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="break-all font-mono text-[10px] font-bold text-[#7A7680]">
                                                                {incident.id}
                                                            </span>

                                                            <span
                                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${severityStyles[incident.severity]}`}
                                                            >
                                                                {incident.severity}
                                                            </span>
                                                        </div>

                                                        <h3
                                                            className={`text-sm font-extrabold leading-5 ${settings.compactCards ? "mt-2" : "mt-3"
                                                                }`}
                                                        >
                                                            {incident.title}
                                                        </h3>

                                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-[#747486]">
                                                            <MapPin
                                                                size={14}
                                                                className="mt-0.5 shrink-0"
                                                            />
                                                            <span>{incident.location}</span>
                                                        </div>

                                                        <div
                                                            className={`flex items-center justify-between gap-2 border-t border-[#E8E3D9] ${settings.compactCards
                                                                ? "mt-2 pt-2"
                                                                : "mt-4 pt-3"
                                                                }`}
                                                        >
                                                            <IncidentStatus status={incident.status} />
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
                        </>
                    )}

                    {view === "analytics" && (
                        <section className="mt-8">
                            {loading ? (
                                <p className="flex items-center gap-2 text-sm">
                                    <LoaderCircle size={18} className="animate-spin" />
                                    Loading analytics...
                                </p>
                            ) : (
                                <IncidentAnalytics incidents={incidents} />
                            )}
                        </section>
                    )}

                    {view === "settings" && (
                        <section className="mt-8">
                            {settingsLoading && !preview ? (
                                <p className="flex items-center gap-2 text-sm" role="status">
                                    <LoaderCircle size={18} className="animate-spin" />
                                    Loading operator preferences...
                                </p>
                            ) : (
                                <>
                                    {settingsError && (
                                        <div role="alert" className="mb-4 rounded-xl border border-[#EFBBB4] bg-[#FFE3DD] p-4 text-sm text-[#9F3833]">
                                            {settingsError}
                                            {!preview && (
                                                <Link to="/operator" className="ml-2 font-bold underline">
                                                    Open account settings
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                    {settingsSaving && (
                                        <p role="status" className="mb-3 flex items-center gap-2 text-sm text-[#686778]">
                                            <LoaderCircle size={16} className="animate-spin" />
                                            Saving preferences...
                                        </p>
                                    )}
                                    <div className={settingsSaving ? "pointer-events-none opacity-60" : ""}>
                                        <ControlRoomPreferences
                                            settings={settings}
                                            onChange={(next) => void changeOperatorSettings(next)}
                                            preview={preview}
                                        />
                                    </div>
                                </>
                            )}
                        </section>
                    )}

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

            {/* Existing incident details workflow */}
            {selectedIncident && view === "overview" && !isPickingLocation && (
                <IncidentDetails
                    key={selectedIncident.id}
                    incident={selectedIncident}
                    preview={preview}
                    onClose={() => setSelectedIncident(null)}
                    onStatusUpdated={handleStatusUpdated}
                />
            )}

            {/* Map location selection */}
            {!preview && showCreateForm && isPickingLocation && (
                <div className="fixed inset-x-3 bottom-4 z-[80] mx-auto max-w-[510px] rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFDF7] p-4 shadow-[5px_6px_0_#1B1F3B]">
                    <div className="flex items-start gap-3">
                        <MapPin
                            size={20}
                            className="mt-0.5 shrink-0 text-[#D94C42]"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold">
                                Location selection
                            </p>
                            <p className="mt-1 text-xs text-[#6B6979]">
                                {pickedCoordinates
                                    ? `${pickedCoordinates[1].toFixed(5)}°, ${pickedCoordinates[0].toFixed(5)}°`
                                    : "Tap a location on the city map."}
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

            {/* Keep form mounted during map picking */}
            {!preview && showCreateForm && (
                <div className={isPickingLocation ? "hidden" : "contents"}>
                    <CreateIncident
                        onClose={closeCreate}
                        onCreated={handleCreated}
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
