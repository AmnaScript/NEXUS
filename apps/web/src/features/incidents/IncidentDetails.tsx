
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    LoaderCircle,
    MapPin,
    ShieldCheck,
    Sparkles,
    X,
} from "lucide-react";

import type { Incident } from "./incidents";
import {
    getIncidentActivities,
    updateIncidentStatus,
} from "./incidentApi";
import type { IncidentActivity } from "./incidentApi";

type Props = {
    incident: Incident;
    onClose: () => void;
    onStatusUpdated: (updated: Incident) => void;
    preview?: boolean;
};

const severityStyle: Record<
    Incident["severity"],
    { bg: string; text: string; border: string }
> = {
    High: {
        bg: "#FFE0DA",
        text: "#B43F37",
        border: "#EAA79E",
    },
    Medium: {
        bg: "#FFF0BF",
        text: "#7D5A14",
        border: "#E2CA7B",
    },
    Low: {
        bg: "#DCF4E8",
        text: "#176B4B",
        border: "#A7DBC3",
    },
};

const statusOptions: Incident["status"][] = [
    "New",
    "Under Review",
    "Resolved",
];

function ActivityTimelineItem({
    item,
    last,
}: {
    item: IncidentActivity;
    last: boolean;
}) {
    const isCreated = item.action === "CREATED";

    return (
        <div className="relative flex gap-4">
            <div className="flex flex-col items-center">
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1B1F3B] ${isCreated ? "bg-[#FFC93C]" : "bg-[#2EC4B6]"
                        }`}
                >
                    {isCreated ? (
                        <FileText size={16} />
                    ) : (
                        <Activity size={16} />
                    )}
                </span>

                {!last && (
                    <span className="my-2 min-h-[26px] w-0.5 flex-1 bg-[#DDD5C7]" />
                )}
            </div>

            <div className="min-w-0 flex-1 pb-7">
                <p className="text-sm font-extrabold">
                    {isCreated ? "Incident created" : "Status changed"}
                </p>

                <p className="mt-1 text-xs leading-6 text-[#6C6A7C]">
                    {isCreated
                        ? `Initial status: ${item.newStatus ?? "New"}`
                        : `${item.oldStatus ?? "Unknown"} → ${item.newStatus ?? "Unknown"
                        }`}
                </p>

                <time
                    dateTime={item.createdAt}
                    className="mt-2 block text-[11px] font-medium text-[#8A8692]"
                >
                    {new Date(item.createdAt).toLocaleString()}
                </time>
            </div>
        </div>
    );
}

export default function IncidentDetails({
    incident,
    onClose,
    onStatusUpdated,
    preview = false,
}: Props) {
    const panelRef = useRef<HTMLElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const [activities, setActivities] = useState<IncidentActivity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(!preview);
    const [activitiesError, setActivitiesError] = useState("");

    const priority = severityStyle[incident.severity];

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const tween = gsap.fromTo(
            panel,
            { x: reducedMotion ? 0 : "100%" },
            {
                x: 0,
                duration: reducedMotion ? 0 : 0.42,
                ease: "power3.out",
                onComplete: () => closeRef.current?.focus(),
            }
        );

        return () => tween.kill();
    }, []);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (preview) return;

        let active = true;

        async function loadActivities() {
            setActivitiesLoading(true);
            setActivitiesError("");

            try {
                const data = await getIncidentActivities(incident.id);
                if (active) setActivities(data);
            } catch {
                if (active) {
                    setActivitiesError("Couldn't load the activity history.");
                }
            } finally {
                if (active) setActivitiesLoading(false);
            }
        }

        void loadActivities();

        return () => {
            active = false;
        };
    }, [incident.id, incident.status, preview]);

    async function handleStatusChange(status: Incident["status"]) {
        if (
            preview ||
            updating ||
            status === incident.status
        ) {
            return;
        }

        setUpdating(true);
        setError("");

        try {
            const updated = await updateIncidentStatus(incident.id, status);
            onStatusUpdated(updated);
        } catch {
            setError("Couldn't save the status change. Please try again.");
        } finally {
            setUpdating(false);
        }
    }

    function getStatusColor(status: Incident["status"]) {
        switch (status) {
            case "New":
                return "#FFC93C";
            case "Under Review":
                return "#2EC4B6";
            case "Resolved":
                return "#3DBE7A";
        }
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex justify-end bg-[#1B1F3B]/45"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <aside
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="incident-details-title"
                className="flex h-full w-full max-w-[510px] flex-col border-l-2 border-[#1B1F3B] bg-[#FFF6E5] shadow-2xl"
            >
                {/* Header */}
                <div className="relative overflow-hidden border-b-2 border-[#1B1F3B] bg-[#1B1F3B] px-6 py-6 text-white sm:px-8">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="break-all font-mono text-[11px] font-bold tracking-wide text-[#C2C4D3]">
                                INCIDENT / {incident.id}
                            </p>

                            <h2
                                id="incident-details-title"
                                className="nx-display mt-4 text-3xl font-extrabold leading-[1.05] sm:text-4xl"
                            >
                                {incident.title}
                                <span className="text-[#FFC93C]">.</span>
                            </h2>
                        </div>

                        <button
                            type="button"
                            ref={closeRef}
                            onClick={onClose}
                            aria-label="Close incident details"
                            className="nx-icon-button flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/15"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span
                            className="rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase"
                            style={{
                                backgroundColor: priority.bg,
                                color: priority.text,
                                borderColor: priority.border,
                            }}
                        >
                            {incident.severity} priority
                        </span>

                        <span
                            className="rounded-full px-3 py-1.5 text-[11px] font-extrabold text-[#1B1F3B]"
                            style={{
                                backgroundColor: getStatusColor(incident.status),
                            }}
                        >
                            {incident.status}
                        </span>
                    </div>
                </div>

                {/* Scrollable details */}
                <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-7 sm:px-8">
                    {/* Summary */}
                    <section>
                        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#656477]">
                            Incident summary
                        </h3>

                        <div className="mt-4 divide-y divide-[#E5DDD0] rounded-[16px] border border-[#DCD4C5] bg-[#FFFCF6] px-5">
                            <div className="flex items-start gap-3 py-4">
                                <MapPin
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#D95247]"
                                />

                                <div>
                                    <p className="text-[11px] font-bold text-[#7A7788]">
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-6">
                                        {incident.location}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-4">
                                <Clock3
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#3B9187]"
                                />

                                <div>
                                    <p className="text-[11px] font-bold text-[#7A7788]">
                                        Reported
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {new Date(incident.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-4">
                                <MapPin
                                    size={19}
                                    className="mt-0.5 shrink-0 text-[#568CB2]"
                                />

                                <div>
                                    <p className="text-[11px] font-bold text-[#7A7788]">
                                        Coordinates
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs font-semibold">
                                        {incident.coordinates[1].toFixed(5)}° N,{" "}
                                        {incident.coordinates[0].toFixed(5)}° E
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Editable status */}
                    <section>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#656477]">
                                Resolution status
                            </h3>

                            {preview && (
                                <span className="rounded-full bg-[#E6E1D8] px-3 py-1 text-[10px] font-bold">
                                    READ ONLY
                                </span>
                            )}
                        </div>

                        {preview ? (
                            <div className="mt-4 rounded-[15px] border border-[#DDD4C4] bg-[#FFFCF5] p-4">
                                <p className="text-sm font-extrabold">
                                    {incident.status}
                                </p>
                                <p className="mt-2 text-xs leading-6 text-[#777587]">
                                    You're viewing the public demo. Status changes
                                    are available to authorized operators.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {statusOptions.map((status) => {
                                    const selected = incident.status === status;

                                    return (
                                        <button
                                            key={status}
                                            type="button"
                                            disabled={updating}
                                            onClick={() => void handleStatusChange(status)}
                                            className={`flex w-full items-center justify-between rounded-[14px] border-2 px-4 py-4 text-left transition disabled:opacity-60 ${selected
                                                ? "border-[#1B1F3B] bg-[#FFF0C7]"
                                                : "border-[#DDD6C7] bg-[#FFFCF5] hover:border-[#1B1F3B]"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor: getStatusColor(status),
                                                    }}
                                                />
                                                <span className="text-sm font-extrabold">
                                                    {status}
                                                </span>
                                            </div>

                                            {selected && <CheckCircle2 size={20} />}
                                        </button>
                                    );
                                })}

                                {updating && (
                                    <p
                                        role="status"
                                        className="flex items-center gap-2 text-xs text-[#666579]"
                                    >
                                        <LoaderCircle size={15} className="animate-spin" />
                                        Saving changes...
                                    </p>
                                )}

                                {error && (
                                    <p
                                        role="alert"
                                        className="rounded-lg bg-[#FFE2DD] px-3 py-3 text-sm font-semibold text-[#A83B34]"
                                    >
                                        {error}
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Timeline */}
                    <section>
                        <div className="flex items-center gap-3 border-b-2 border-[#1B1F3B] pb-4">
                            <Activity size={20} />
                            <h3 className="nx-display text-xl font-extrabold">
                                Activity history
                            </h3>
                        </div>

                        {preview ? (
                            <div className="mt-5 rounded-xl border border-[#DDD6C7] bg-[#FFFCF5] p-5">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={23} className="text-[#268B68]" />
                                    <p className="text-sm font-extrabold">
                                        Operator-only activity
                                    </p>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-[#777587]">
                                    History and status-change records are available
                                    in the authorized Control Room.
                                </p>
                            </div>
                        ) : activitiesLoading ? (
                            <div className="flex items-center gap-3 py-8 text-sm text-[#777587]">
                                <LoaderCircle size={19} className="animate-spin" />
                                Loading activity history...
                            </div>
                        ) : activitiesError ? (
                            <p
                                role="alert"
                                className="mt-5 rounded-xl bg-[#FFE2DD] p-4 text-sm text-[#A83B34]"
                            >
                                {activitiesError}
                            </p>
                        ) : activities.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-[#DDD6C7] bg-[#FFFCF5] p-5">
                                <p className="text-sm font-semibold">
                                    No recorded activity yet.
                                </p>
                                <p className="mt-2 text-xs leading-6 text-[#777587]">
                                    Updates will appear here once recorded.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6">
                                {activities.map((item, index) => (
                                    <ActivityTimelineItem
                                        key={item.id}
                                        item={item}
                                        last={index === activities.length - 1}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* AI placeholder, accurately labeled */}
                    <section className="rounded-[18px] border-2 border-[#1B1F3B] bg-[#DDF3E9] p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2EC4B6]">
                                <Sparkles size={21} />
                            </div>

                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#4D6B63]">
                                    Planned capability
                                </p>
                                <h3 className="nx-display text-lg font-extrabold">
                                    NEXUS AI Analysis
                                </h3>
                            </div>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-[#536A64]">
                            AI-assisted classification and response recommendations
                            are not available yet. This panel will be connected
                            when the supporting service is implemented.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <footer className="border-t-2 border-[#1B1F3B] bg-[#FFFCF5] p-5 sm:px-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="nx-button nx-button-ink w-full"
                    >
                        <ArrowLeft size={17} />
                        Back to Control Room
                    </button>
                </footer>
            </aside>
        </div>
    );
}
