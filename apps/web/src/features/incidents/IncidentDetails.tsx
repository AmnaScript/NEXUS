
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
    X,
    MapPin,
    Clock3,
    BrainCircuit,
    Activity,
} from "lucide-react";
import type { Incident } from "./incidents";
import { getIncidentColor } from "./incidents";
import {
    getIncidentActivities,
    type IncidentActivity,
} from "./incidentApi";
import { updateIncidentStatus } from "./incidentApi";

type Props = {
    incident: Incident;
    onClose: () => void;
    onStatusUpdated: (updated: Incident) => void;
    preview?: boolean;
};

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
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [activitiesError, setActivitiesError] = useState("");

    useEffect(() => {
        if (preview) {
            setActivities([]);
            setActivitiesLoading(false);
            setActivitiesError("");
            return;
        }

        let active = true;

        async function loadActivities() {
            setActivitiesLoading(true);
            setActivitiesError("");

            try {
                const data = await getIncidentActivities(incident.id);
                if (active) setActivities(data);
            } catch {
                if (active) {
                    setActivitiesError("Unable to load activity history.");
                }
            } finally {
                if (active) setActivitiesLoading(false);
            }
        }

        loadActivities();

        return () => {
            active = false;
        };
    }, [incident.id, incident.status, preview]);

    async function handleStatusChange(
        status: Incident["status"]
    ) {
        if (updating || status === incident.status) return;

        setUpdating(true);
        setError("");

        try {
            const updated = await updateIncidentStatus(
                incident.id,
                status
            );

            onStatusUpdated(updated);
        } catch {
            setError("Unable to update incident status. Please retry.");
        } finally {
            setUpdating(false);
        }
    }

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
                duration: reducedMotion ? 0 : 0.4,
                ease: "power3.out",
                onComplete: () => closeRef.current?.focus(),
            }
        );

        return () => {
            tween.kill();
        };
    }, []);

    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <aside
            ref={panelRef}
            aria-label="Incident details"
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#DFE4E0] bg-white shadow-2xl sm:w-[420px]"
        >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#DFE4E0] p-6">
                <div>
                    <p className="text-xs tracking-wider text-[#617078]">
                        INCIDENT / {incident.id}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                        {incident.title}
                    </h2>
                </div>

                <button
                    ref={closeRef}
                    onClick={onClose}
                    aria-label="Close incident details"
                    className="rounded-lg p-2 hover:bg-[#F1F3F0]"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-fit items-center rounded-full bg-[#EAF3EF] px-3 py-1 text-xs text-[#217F79]">
                        {incident.status}
                    </span>

                    <span
                        className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs"
                        style={{
                            color: getIncidentColor(incident.severity),
                            backgroundColor: `${getIncidentColor(incident.severity)}15`,
                        }}
                    >
                        {incident.severity} priority
                    </span>
                </div>



                {/* Status selector — OUTSIDE badge container */}
                {!preview && (
                    <section className="mt-6 rounded-xl border border-[#DFE4E0] p-4">
                        <label
                            htmlFor="incident-status"
                            className="mb-3 block text-sm font-semibold"
                        >
                            Incident Status
                        </label>

                        <select
                            id="incident-status"
                            value={incident.status}
                            onChange={(e) =>
                                handleStatusChange(
                                    e.target.value as Incident["status"]
                                )
                            }
                            disabled={updating}
                            className="w-full rounded-lg border border-[#DFE4E0] bg-white px-3 py-3 text-sm outline-none focus:border-[#217F79] disabled:opacity-50"
                        >
                            <option value="New">New</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                        </select>

                        {updating && (
                            <p role="status" className="mt-2 text-xs text-[#617078]">
                                Saving status...
                            </p>
                        )}

                        {error && (
                            <p role="alert" className="mt-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}
                    </section>
                )}


                <section className="mt-8">
                    <h3 className="text-sm font-semibold">
                        Incident information
                    </h3>

                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={17} className="text-[#617078]" />
                            {incident.location}
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Clock3 size={17} className="text-[#617078]" />
                            Fictional demonstration report
                        </div>
                    </div>
                </section>

                {/* Activity timeline */}

                <section className="mt-8 border-t border-[#DFE4E0] pt-6">
                    <div className="flex items-center gap-2">
                        <Activity size={17} className="text-[#217F79]" />
                        <h3 className="text-sm font-semibold">
                            Activity Timeline
                        </h3>
                        {preview && (
                            <p className="mt-4 text-sm text-[#617078]">
                                Activity history is available to authorized operators.
                            </p>
                        )}
                    </div>

                    {!preview && activitiesLoading && (
                        <p className="mt-4 text-sm text-[#617078]">
                            Loading activity...
                        </p>
                    )}

                    {!preview && activitiesError && (
                        <p role="alert" className="mt-4 text-sm text-red-600">
                            {activitiesError}
                        </p>
                    )}

                    {!preview && !activitiesLoading && !activitiesError && (
                        <div className="mt-5 border-l-2 border-[#DFE4E0] pl-5">
                            {activities.length === 0 && (
                                <p className="text-sm text-[#617078]">
                                    No activity recorded yet.
                                </p>
                            )}

                            {activities.map((activity) => (
                                <div key={activity.id} className="relative pb-6 last:pb-0">
                                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-[#217F79]" />

                                    <p className="text-sm font-medium">
                                        {activity.action === "CREATED"
                                            ? "Incident created"
                                            : "Status updated"}
                                    </p>

                                    {activity.action === "STATUS_CHANGED" && (
                                        <p className="mt-1 text-xs text-[#617078]">
                                            {activity.oldStatus} → {activity.newStatus}
                                        </p>
                                    )}

                                    {activity.action === "CREATED" && (
                                        <p className="mt-1 text-xs text-[#617078]">
                                            Initial status: {activity.newStatus}
                                        </p>
                                    )}

                                    <time
                                        dateTime={activity.createdAt}
                                        className="mt-2 block text-xs text-[#879399]"
                                    >
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </time>
                                </div>
                            ))}
                        </div>
                    )}
                </section>


                {/* AI analysis */}
                <section className="mt-8 rounded-2xl bg-[#F7F6F2] p-5">
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={19} className="text-[#217F79]" />
                        <h3 className="font-semibold">
                            NEXUS AI Analysis
                        </h3>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#617078]">
                        AI analysis is not available yet.
                        Once the backend is connected, this section
                        will show classification, missing information,
                        and evidence-based recommendations.
                    </p>
                </section>
            </div>

            {/* Footer */}
            <div className="border-t border-[#DFE4E0] p-5">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl bg-[#202A31] px-5 py-3 text-sm font-medium text-white hover:bg-[#35454E]"
                >
                    Back to Control Room
                </button>
            </div>
        </aside>
    );
}
