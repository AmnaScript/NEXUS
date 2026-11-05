
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    CircleAlert,
    Gamepad2,
    LockKeyhole,
    MapPin,
    Radio,
    ShieldCheck,
    TrafficCone,
} from "lucide-react";
import { Link } from "react-router-dom";

const sampleIncidents = [
    {
        id: "NX-001",
        title: "Road obstruction",
        location: "Central Avenue",
        severity: "High",
        color: "#FF5A4E",
    },
    {
        id: "NX-002",
        title: "Water supply issue",
        location: "District 01",
        severity: "Medium",
        color: "#FFC93C",
    },
    {
        id: "NX-003",
        title: "Streetlight repair",
        location: "Market Road",
        severity: "Low",
        color: "#3DBE7A",
    },
];

function DashboardIllustration() {
    return (
        <div
            aria-label="Illustration of the NEXUS incident dashboard"
            className="overflow-hidden rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFDF7] shadow-[5px_6px_0_#1B1F3B]"
        >
            <div className="flex items-center justify-between border-b-2 border-[#1B1F3B] bg-[#FFC93C] px-4 py-3">
                <span className="font-mono text-[11px] font-bold">
                    NEXUS / OPERATIONS
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold">
                    <span className="h-2 w-2 rounded-full bg-[#3DBE7A]" />
                    DEMO
                </span>
            </div>

            <div className="grid grid-cols-[1fr_1.15fr] gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="space-y-2">
                    <div className="rounded-lg bg-[#1B1F3B] p-3 text-white">
                        <p className="text-[9px] uppercase tracking-wider text-white/70">
                            Reports
                        </p>
                        <p className="nx-display mt-1 text-3xl font-bold">03</p>
                    </div>

                    {sampleIncidents.map((incident) => (
                        <div
                            key={incident.id}
                            className="rounded-lg border border-[#E6DDCE] bg-white p-2.5"
                        >
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: incident.color }}
                                />
                                <p className="truncate text-[10px] font-extrabold">
                                    {incident.title}
                                </p>
                            </div>

                            <p className="mt-1 truncate text-[9px] text-[#777587]">
                                {incident.location}
                            </p>

                            <p className="mt-1 font-mono text-[9px] text-[#777587]">
                                {incident.severity} priority
                            </p>
                        </div>
                    ))}
                </div>

                <div className="relative min-h-[245px] overflow-hidden rounded-lg bg-[#E0EAD9]">
                    <div className="absolute inset-y-0 left-[34%] w-[18%] bg-[#667681]" />
                    <div className="absolute inset-x-0 top-[42%] h-[17%] bg-[#667681]" />

                    <div className="absolute left-[42.5%] top-0 h-full border-l border-dashed border-[#FCECB9]" />
                    <div className="absolute left-0 top-[50%] w-full border-t border-dashed border-[#FCECB9]" />

                    {[
                        { left: "7%", top: "8%", width: "20%", height: "24%" },
                        { left: "59%", top: "8%", width: "31%", height: "26%" },
                        { left: "9%", top: "67%", width: "20%", height: "23%" },
                        { left: "63%", top: "68%", width: "28%", height: "21%" },
                    ].map((building, index) => (
                        <div
                            key={index}
                            className="absolute rounded-sm border border-[#BACAB9] bg-[#F9EBD2]"
                            style={building}
                        />
                    ))}

                    {[
                        { left: "43%", top: "27%", color: "#FF5A4E" },
                        { left: "73%", top: "49%", color: "#FFC93C" },
                        { left: "43%", top: "76%", color: "#3DBE7A" },
                    ].map((pin, index) => (
                        <span
                            key={index}
                            className="absolute h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-md"
                            style={{
                                left: pin.left,
                                top: pin.top,
                                backgroundColor: pin.color,
                            }}
                        />
                    ))}

                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold shadow">
                        DISTRICT 01
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E6DDCE] px-4 py-3">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#616577]">
                    <Radio size={12} />
                    Incident monitoring
                </span>

                <CheckCircle2 size={16} className="text-[#3DBE7A]" />
            </div>
        </div>
    );
}

function FeatureCard({
    number,
    eyebrow,
    title,
    description,
    href,
    action,
    accent,
    icon: Icon,
}: {
    number: string;
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    action: string;
    accent: string;
    icon: typeof Activity;
}) {
    return (
        <article className="group flex h-full flex-col rounded-[20px] border-2 border-[#1B1F3B] bg-[#FFFCF5] p-6 transition-transform hover:-translate-y-1 sm:p-7">
            <div className="flex items-start justify-between">
                <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: accent }}
                >
                    <Icon size={24} strokeWidth={1.8} />
                </span>

                <span className="font-mono text-xs font-bold text-[#777587]">
                    {number}
                </span>
            </div>

            <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#666577]">
                {eyebrow}
            </p>

            <h3 className="nx-display mt-3 text-2xl font-extrabold leading-tight">
                {title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-7 text-[#6E6C7D]">
                {description}
            </p>

            <Link
                to={href}
                className="mt-8 inline-flex min-h-11 items-center justify-between gap-3 border-t border-[#DCD4C5] pt-4 text-sm font-extrabold transition-colors hover:text-[#D94D42]"
            >
                {action}
                <ArrowUpRight
                    size={19}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
            </Link>
        </article>
    );
}

export default function ProductExperience() {
    return (
        <section
            id="experience"
            className="scroll-mt-20 bg-[#FFF6E5] px-5 py-20 text-[#1B1F3B] sm:px-8 sm:py-28 lg:px-12"
        >
            <div className="mx-auto max-w-[1480px]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#1B1F3B] pt-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">
                        02 / EXPLORE NEXUS
                    </span>

                    <span className="flex items-center gap-2 text-xs font-semibold text-[#656477]">
                        <span className="h-2 w-2 rounded-full bg-[#3DBE7A]" />
                        Interactive demonstration
                    </span>
                </div>

                <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                    <h2 className="nx-display max-w-[930px] text-[clamp(3rem,7.5vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.065em]">
                        A city is more than
                        <br />
                        <span className="text-[#FF5A4E]">a map.</span>
                    </h2>

                    <p className="max-w-md text-base leading-8 text-[#676676] lg:ml-auto">
                        NEXUS combines incident management, interactive mapping,
                        and an explorable city simulation. Choose how you want
                        to experience it.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[22px] bg-[#D7EFE8] p-5 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                            <span className="font-mono text-xs font-bold">
                                PRODUCT PREVIEW
                            </span>
                            <MapPin size={19} />
                        </div>

                        <div className="mt-6">
                            <DashboardIllustration />
                        </div>

                        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                            <div>
                                <h3 className="nx-display text-2xl font-extrabold">
                                    See the system in action.
                                </h3>
                                <p className="mt-2 max-w-md text-sm leading-6 text-[#4F6462]">
                                    Explore a fictional district, inspect incidents,
                                    and see how reports are organized.
                                </p>
                            </div>

                            <Link
                                to="/preview"
                                className="nx-button nx-button-ink shrink-0"
                            >
                                Open preview
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                        <FeatureCard
                            number="01"
                            eyebrow="Operator workspace"
                            title="Manage the city."
                            description="Authorized operators can create incidents, select map locations, change report statuses, and review activity history."
                            href="/login"
                            action="Operator login"
                            accent="#FFC93C"
                            icon={ShieldCheck}
                        />

                        <FeatureCard
                            number="02"
                            eyebrow="Interactive experience"
                            title="Take the wheel."
                            description="Drive through the miniature city, respond to fictional emergency calls, and complete timed rescue missions."
                            href="/play"
                            action="Play Rescue Run"
                            accent="#FF8F7A"
                            icon={Gamepad2}
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[#DCD4C5] bg-[#FFFCF5] px-5 py-4">
                    <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-[#686778]">
                        <span className="flex items-center gap-2">
                            <CircleAlert size={16} className="text-[#FF5A4E]" />
                            Incident reports
                        </span>

                        <span className="flex items-center gap-2">
                            <TrafficCone size={16} className="text-[#D7A02D]" />
                            City simulation
                        </span>

                        <span className="flex items-center gap-2">
                            <LockKeyhole size={16} className="text-[#29896C]" />
                            Protected operations
                        </span>
                    </div>

                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#777587]">
                        BUILT AS A DEMONSTRATION
                    </span>
                </div>
            </div>
        </section>
    );
}
