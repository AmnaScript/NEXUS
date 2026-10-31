
import { useState } from "react";
import {
    ArrowUpRight,
    ArrowRight,
    Activity,
    AlertTriangle,
    Droplets,
    TrafficCone,
    Radio,
} from "lucide-react";

const signals = [
    {
        id: "01",
        name: "Road obstruction",
        district: "CENTRAL DISTRICT",
        category: "MOBILITY",
        severity: "HIGH PRIORITY",
        color: "#F0A17E",
        Icon: TrafficCone,
        description:
            "An obstruction interrupts a major route. NEXUS brings the report, location, and priority into one operational view.",
        response: "Inspect the incident and coordinate a response",
        bars: [32, 48, 39, 72, 60, 89, 55, 76, 95, 68, 82, 100],
    },
    {
        id: "02",
        name: "Water infrastructure",
        district: "WEST DISTRICT",
        category: "UTILITIES",
        severity: "NEEDS REVIEW",
        color: "#9FC8DE",
        Icon: Droplets,
        description:
            "A pipeline issue is reported in a residential area. Operators can track its status and preserve an activity history.",
        response: "Assess location, severity, and available evidence",
        bars: [28, 35, 48, 40, 62, 51, 75, 64, 85, 72, 69, 79],
    },
    {
        id: "03",
        name: "Traffic signal failure",
        district: "NORTH JUNCTION",
        category: "INFRASTRUCTURE",
        severity: "MONITORING",
        color: "#A9D4BD",
        Icon: AlertTriangle,
        description:
            "A traffic control fault creates uncertainty at an intersection. The incident is visible alongside other city reports.",
        response: "Monitor the report and record the resolution",
        bars: [48, 38, 52, 44, 56, 50, 63, 54, 67, 58, 62, 65],
    },
];

export default function CityPulseSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const active = signals[activeIndex];

    return (
        <section
            id="about"
            aria-labelledby="city-pulse-heading"
            className="relative scroll-mt-20 overflow-hidden bg-[#F7F6F2] py-24 md:py-36"
        >
            <div className="mx-auto max-w-7xl px-5 md:px-10">
                {/* Editorial introduction */}
                <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_0.7fr]">
                    <div>
                        <p className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#217F79]">
                            <span className="h-px w-9 bg-[#217F79]" />
                            01 / THE URBAN PULSE
                        </p>

                        <h2
                            id="city-pulse-heading"
                            className="max-w-4xl text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[0.95] tracking-[-0.075em]"
                        >
                            The city
                            <br />
                            never{" "}
                            <span className="font-serif font-normal italic text-[#217F79]">
                                stops.
                            </span>
                        </h2>
                    </div>

                    <div className="lg:pb-3">
                        <p className="max-w-sm text-lg leading-relaxed text-[#617078]">
                            Every street, intersection, and neighborhood tells a
                            story. The challenge isn't a lack of information.
                            It's knowing what deserves attention.
                        </p>
                        <div className="mt-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.15em] text-[#217F79]">
                            <Activity size={17} />
                            A DIFFERENT WAY TO SEE THE CITY
                        </div>
                    </div>
                </div>

                {/* Operational monitor */}
                <div className="mt-20 overflow-hidden rounded-[28px] bg-[#18272A] text-[#EAF0EA] shadow-[0_35px_90px_-45px_rgba(15,34,35,0.45)] md:mt-24">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-9">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#8FD3C5]">
                                <Radio size={18} />
                            </span>
                            <div>
                                <p className="text-xs font-semibold tracking-[0.22em]">
                                    NEXUS / SIGNAL MONITOR
                                </p>
                                <p className="mt-1 text-xs text-[#91A5A5]">
                                    Interactive system demonstration
                                </p>
                            </div>
                        </div>

                        <span className="flex items-center gap-2 rounded-full border border-[#42756D] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A4DACB]">
                            <span className="h-2 w-2 rounded-full bg-[#75C8A9]" />
                            SIMULATION ACTIVE
                        </span>
                    </div>

                    <div className="grid lg:grid-cols-[0.42fr_0.58fr]">
                        {/* Signal list */}
                        <div className="border-b border-white/10 p-5 md:p-8 lg:border-b-0 lg:border-r">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#91A5A5]">
                                    Incoming signals
                                </span>
                                <span className="font-mono text-xs text-[#91A5A5]">
                                    03 EVENTS
                                </span>
                            </div>

                            <div className="space-y-3">
                                {signals.map((signal, index) => {
                                    const Icon = signal.Icon;
                                    const selected = index === activeIndex;

                                    return (
                                        <button
                                            key={signal.id}
                                            type="button"
                                            onClick={() => setActiveIndex(index)}
                                            aria-pressed={selected}
                                            className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 ${selected
                                                    ? "border-[#66A89A] bg-[#29423F]"
                                                    : "border-white/10 bg-white/[0.025] hover:border-white/30 hover:bg-white/[0.06]"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                                                    style={{
                                                        backgroundColor: `${signal.color}18`,
                                                        color: signal.color,
                                                    }}
                                                >
                                                    <Icon size={20} />
                                                </div>
                                                <ArrowUpRight
                                                    size={17}
                                                    className={`transition-transform ${selected
                                                            ? "text-[#A8DACE]"
                                                            : "text-[#718788] group-hover:-translate-y-1 group-hover:translate-x-1"
                                                        }`}
                                                />
                                            </div>

                                            <p className="mt-5 text-[10px] font-medium tracking-[0.18em] text-[#91A5A5]">
                                                {signal.id} / {signal.district}
                                            </p>
                                            <h3 className="mt-2 text-lg font-medium tracking-tight">
                                                {signal.name}
                                            </h3>
                                            <p className="mt-2 text-xs" style={{ color: signal.color }}>
                                                {signal.severity}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active signal analysis */}
                        <div
                            className="flex min-w-0 flex-col justify-between p-6 md:p-10"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#91A5A5]">
                                        Selected event / {active.id}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] tracking-[0.15em]">
                                        {active.category}
                                    </span>
                                </div>

                                <h3 className="mt-10 max-w-lg text-3xl font-medium leading-tight tracking-[-0.045em] md:text-5xl">
                                    A signal becomes
                                    <br />
                                    <span className="text-[#8FD3C5]">a decision.</span>
                                </h3>

                                <p className="mt-6 max-w-lg text-sm leading-7 text-[#AEC0BE] md:text-base">
                                    {active.description}
                                </p>

                                {/* Stylized signal visualization */}
                                <div className="mt-10 rounded-2xl border border-white/10 bg-[#142123] p-5 md:p-7">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[11px] tracking-widest text-[#8FA9A5]">
                                            SIGNAL PROFILE / {active.id}
                                        </span>
                                        <span className="font-mono text-xs" style={{ color: active.color }}>
                                            ◉ DETECTED
                                        </span>
                                    </div>

                                    <div
                                        key={active.id}
                                        className="mt-7 flex h-32 items-end gap-2 border-b border-white/10 pb-1"
                                        role="img"
                                        aria-label={`Illustrative activity profile for ${active.name}`}
                                    >
                                        {active.bars.map((height, index) => (
                                            <div
                                                key={index}
                                                className="min-w-0 flex-1 rounded-t-sm transition-all duration-500"
                                                style={{
                                                    height: `${height}%`,
                                                    backgroundColor: active.color,
                                                    opacity: 0.25 + index / 16,
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-4 flex justify-between font-mono text-[10px] text-[#738B89]">
                                        <span>OBSERVATION WINDOW</span>
                                        <span>ILLUSTRATIVE DATA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-9 flex items-start gap-4 border-t border-white/10 pt-7">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#315D54] text-[#B6E5D8]">
                                    <ArrowRight size={18} />
                                </span>
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#91A5A5]">
                                        OPERATIONAL NEXT STEP
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-white">
                                        {active.response}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Closing editorial note */}
                <div className="mt-10 flex flex-col gap-4 border-t border-[#D8DEDA] pt-7 md:flex-row md:items-start md:justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#217F79]">
                        DESIGNED FOR CLARITY
                    </span>
                    <p className="max-w-xl text-sm leading-7 text-[#617078]">
                        The signals above are fictional scenarios. NEXUS is being
                        developed to turn incident reports into structured,
                        traceable decisions—not to replace human judgment.
                    </p>
                </div>
            </div>
        </section>
    );
}
