
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    TrendingUp,
} from "lucide-react";
import type { Incident } from "./incidents";

type Props = {
    incidents: Incident[];
};

const severityColors: Record<Incident["severity"], string> = {
    High: "#FF5A4E",
    Medium: "#FFC93C",
    Low: "#3DBE7A",
};

const statusColors: Record<Incident["status"], string> = {
    New: "#FFC93C",
    "Under Review": "#2EC4B6",
    Resolved: "#3DBE7A",
};

function Metric({
    icon: Icon,
    title,
    value,
    detail,
    background,
}: {
    icon: typeof Activity;
    title: string;
    value: string;
    detail: string;
    background: string;
}) {
    return (
        <article className="rounded-[18px] border border-[#DED6C8] bg-[#FFFCF5] p-5">
            <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold text-[#686778]">
                    {title}
                </span>
                <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: background }}
                >
                    <Icon size={20} />
                </span>
            </div>
            <p className="nx-display mt-4 text-4xl font-extrabold">
                {value}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#777587]">
                {detail}
            </p>
        </article>
    );
}

function Distribution({
    title,
    rows,
    total,
}: {
    title: string;
    rows: { label: string; count: number; color: string }[];
    total: number;
}) {
    return (
        <section className="rounded-[20px] border border-[#DDD6C7] bg-[#FFFCF5] p-5 sm:p-7">
            <h3 className="nx-display text-xl font-extrabold">
                {title}
            </h3>

            <div className="mt-7 space-y-6">
                {rows.map(({ label, count, color }) => {
                    const percent =
                        total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={label}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-sm font-semibold">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    {label}
                                </span>
                                <span className="font-mono text-xs font-bold">
                                    {count} · {Math.round(percent)}%
                                </span>
                            </div>

                            <div
                                className="h-3 overflow-hidden rounded-full bg-[#EDE8DF]"
                                role="meter"
                                aria-label={`${label} incidents`}
                                aria-valuemin={0}
                                aria-valuemax={total || 1}
                                aria-valuenow={count}
                            >
                                <div
                                    className="h-full rounded-full transition-[width] duration-500"
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor: color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function IncidentAnalytics({ incidents }: Props) {
    const total = incidents.length;

    const resolved = incidents.filter(
        (incident) => incident.status === "Resolved"
    ).length;

    const active = incidents.filter(
        (incident) => incident.status !== "Resolved"
    ).length;

    const high = incidents.filter(
        (incident) =>
            incident.severity === "High" &&
            incident.status !== "Resolved"
    ).length;

    const resolutionRate =
        total === 0 ? 0 : (resolved / total) * 100;

    const severities: Incident["severity"][] = [
        "High",
        "Medium",
        "Low",
    ];

    const statuses: Incident["status"][] = [
        "New",
        "Under Review",
        "Resolved",
    ];

    const severityRows = severities.map((severity) => ({
        label: severity,
        count: incidents.filter(
            (incident) => incident.severity === severity
        ).length,
        color: severityColors[severity],
    }));

    const statusRows = statuses.map((status) => ({
        label: status,
        count: incidents.filter(
            (incident) => incident.status === status
        ).length,
        color: statusColors[status],
    }));

    const recent = [...incidents]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#D64D43]">
                    Data from incident records
                </span>
                <h2 className="nx-display mt-3 text-3xl font-extrabold sm:text-4xl">
                    Incident analytics<span className="text-[#FF5A4E]">.</span>
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#686778]">
                    An overview of the reports currently loaded in this
                    environment. These figures are calculated from incident
                    records, not generated estimates.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric
                    icon={ClipboardList}
                    title="Total reports"
                    value={String(total)}
                    detail="All incidents in the current dataset"
                    background="#DDECE9"
                />
                <Metric
                    icon={Activity}
                    title="Active"
                    value={String(active)}
                    detail="New and under-review incidents"
                    background="#CFEFEA"
                />
                <Metric
                    icon={AlertTriangle}
                    title="High priority"
                    value={String(high)}
                    detail="High-severity incidents not yet resolved"
                    background="#FFE0D8"
                />
                <Metric
                    icon={CheckCircle2}
                    title="Resolved"
                    value={`${Math.round(resolutionRate)}%`}
                    detail={`${resolved} out of ${total} incidents`}
                    background="#D9F3DF"
                />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <Distribution
                    title="Severity breakdown"
                    rows={severityRows}
                    total={total}
                />
                <Distribution
                    title="Resolution progress"
                    rows={statusRows}
                    total={total}
                />
            </div>

            <section className="overflow-hidden rounded-[20px] border border-[#DDD6C7] bg-[#FFFCF5]">
                <div className="flex items-center justify-between gap-3 border-b border-[#E7E0D5] px-5 py-5 sm:px-7">
                    <div>
                        <h3 className="nx-display text-xl font-extrabold">
                            Recent reports
                        </h3>
                        <p className="mt-1 text-xs text-[#777587]">
                            Five most recently created incidents
                        </p>
                    </div>
                    <TrendingUp size={21} className="text-[#378F80]" />
                </div>

                {recent.length === 0 ? (
                    <div className="flex flex-col items-center px-5 py-12 text-center">
                        <CircleDot size={28} className="text-[#8B8791]" />
                        <p className="mt-4 text-sm font-bold">
                            No incidents to analyze yet.
                        </p>
                        <p className="mt-2 text-xs text-[#777587]">
                            Reports will appear as they become available.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#ECE5DA]">
                        {recent.map((incident) => (
                            <div
                                key={incident.id}
                                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-7"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold">
                                        {incident.title}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-[#777587]">
                                        {incident.location}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span
                                        className="inline-block rounded-full px-3 py-1 text-[10px] font-bold"
                                        style={{
                                            backgroundColor:
                                                `${statusColors[incident.status]}33`,
                                        }}
                                    >
                                        {incident.status}
                                    </span>
                                    <p className="mt-1 text-[10px] text-[#777587]">
                                        {Number.isFinite(
                                            new Date(incident.createdAt).getTime()
                                        )
                                            ? new Date(incident.createdAt).toLocaleDateString()
                                            : "Date unavailable"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <p className="text-xs leading-6 text-[#777587]">
                Analytics reflect the currently loaded incident collection.
                The public preview may include fictional browser-local Rescue
                Run reports. These are not live city statistics.
            </p>
        </div>
    );
}
