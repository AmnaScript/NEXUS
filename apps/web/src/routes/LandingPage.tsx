
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Check,
    ChevronRight,
    CircleAlert,
    Cross,
    Gamepad2,
    MapPin,
    Menu,
    MoveUpRight,
    Navigation,
    Play,
    Radio,
    ShieldCheck,
    TrafficCone,
    Truck,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";
import CityScene from "../features/cinematic-intro/CityScene";


function Eyebrow({
    children,
    color = "var(--nx-red)",
}: {
    children: ReactNode;
    color?: string;
}) {
    return (
        <span className="nx-eyebrow" style={{ color }}>
            {children}
        </span>
    );
}

function SectionNumber({
    number,
    title,
}: {
    number: string;
    title: string;
}) {
    return (
        <div className="flex items-center gap-4 border-t-2 border-[#1B1F3B] pt-3">
            <span className="font-mono text-[11px] font-bold">
                {number}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                {title}
            </span>
            <div className="ml-auto h-2 w-2 rounded-full bg-[#FF5A4E]" />
        </div>
    );
}

function ArrowLink({
    to,
    children,
    dark = false,
}: {
    to: string;
    children: ReactNode;
    dark?: boolean;
}) {
    return (
        <Link
            to={to}
            className={`nx-link inline-flex items-center gap-3 border-b-2 pb-2 text-sm font-bold transition hover:gap-5 ${dark
                    ? "border-white text-white"
                    : "border-[#1B1F3B] text-[#1B1F3B]"
                }`}
        >
            {children}
            <ArrowUpRight size={17} />
        </Link>
    );
}

function MissionIllustration() {
    return (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-[#1B1F3B] bg-[#FDE5C1] p-4 sm:p-6">
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-[#1B1F3B]/20 bg-white px-3 py-1.5 text-[10px] font-bold">
                <span className="nx-pulse h-2 w-2 rounded-full bg-[#FF5A4E]" />
                CITY RESPONSE
            </div>

            <svg
                viewBox="0 0 560 340"
                role="img"
                aria-label="Illustrated city district with roads, an ambulance, a hospital, and an incident"
                className="h-auto w-full"
            >
                <rect width="560" height="340" rx="16" fill="#FDE5C1" />

                {/* District plots */}
                <rect x="20" y="20" width="160" height="115" rx="13" fill="#BEE3B6" />
                <rect x="221" y="20" width="135" height="115" rx="13" fill="#B8E9DF" />
                <rect x="397" y="20" width="143" height="115" rx="13" fill="#FFD9B0" />

                <rect x="20" y="178" width="160" height="142" rx="13" fill="#FFD5CE" />
                <rect x="221" y="178" width="135" height="142" rx="13" fill="#DBE5F1" />
                <rect x="397" y="178" width="143" height="142" rx="13" fill="#BEE3B6" />

                {/* Road grid */}
                <rect x="180" y="0" width="41" height="340" fill="#55667C" />
                <rect x="356" y="0" width="41" height="340" fill="#55667C" />
                <rect x="0" y="135" width="560" height="43" fill="#55667C" />

                {[36, 92, 202, 260, 310].map((x) => (
                    <line
                        key={x}
                        x1={x}
                        y1="156"
                        x2={x + 24}
                        y2="156"
                        stroke="#FFE89C"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                ))}

                {[20, 82, 220, 285].map((y) => (
                    <g key={y}>
                        <line
                            x1="200"
                            y1={y}
                            x2="200"
                            y2={y + 24}
                            stroke="#FFE89C"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <line
                            x1="376"
                            y1={y}
                            x2="376"
                            y2={y + 24}
                            stroke="#FFE89C"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </g>
                ))}

                {/* Park and trees */}
                <path
                    d="M37 46 Q85 92 163 106"
                    fill="none"
                    stroke="#FFF3CF"
                    strokeWidth="9"
                    strokeLinecap="round"
                />
                {[
                    [53, 55],
                    [97, 37],
                    [135, 70],
                    [61, 106],
                    [140, 111],
                    [425, 214],
                    [503, 204],
                    [458, 281],
                    [514, 290],
                ].map(([x, y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r="16" fill="#338A5A" />
                        <circle cx={x - 5} cy={y - 5} r="12" fill="#3DBE7A" />
                        <circle cx={x + 6} cy={y + 2} r="9" fill="#8DDA8C" />
                    </g>
                ))}

                {/* Office towers */}
                <rect x="245" y="37" width="42" height="72" rx="5" fill="#438FA0" />
                <rect x="292" y="22" width="45" height="87" rx="5" fill="#1B8290" />
                {Array.from({ length: 4 }, (_, i) => (
                    <g key={i}>
                        <rect x="253" y={48 + i * 14} width="25" height="6" rx="2" fill="#D0F6EC" />
                        <rect x="300" y={36 + i * 17} width="28" height="7" rx="2" fill="#B8E9DF" />
                    </g>
                ))}

                {/* Hospital */}
                <rect x="411" y="37" width="114" height="85" rx="8" fill="#FFFFFF" />
                <rect x="423" y="48" width="90" height="22" rx="5" fill="#C4EAF2" />
                <rect x="450" y="78" width="36" height="33" rx="4" fill="#8DC8DB" />
                <rect x="465" y="81" width="6" height="25" fill="#FF5A4E" />
                <rect x="456" y="90" width="24" height="6" fill="#FF5A4E" />

                {/* Fire station */}
                <rect x="34" y="200" width="130" height="100" rx="8" fill="#FFF8EE" />
                <rect x="45" y="227" width="30" height="62" rx="3" fill="#FF8F7A" />
                <rect x="83" y="227" width="30" height="62" rx="3" fill="#FF8F7A" />
                <rect x="121" y="227" width="30" height="62" rx="3" fill="#FF8F7A" />
                <rect x="45" y="212" width="107" height="9" rx="3" fill="#D84742" />

                {/* Buildings */}
                <rect x="237" y="199" width="48" height="46" rx="6" fill="#FF8F7A" />
                <rect x="292" y="205" width="51" height="65" rx="6" fill="#FFC93C" />
                <rect x="242" y="261" width="44" height="43" rx="6" fill="#3DBE7A" />
                {[
                    [251, 215],
                    [263, 215],
                    [306, 220],
                    [321, 220],
                    [306, 240],
                    [321, 240],
                    [254, 279],
                ].map(([x, y], i) => (
                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width="7"
                        height="11"
                        rx="1"
                        fill="#FFFFFF"
                        opacity=".8"
                    />
                ))}

                {/* Route */}
                <path
                    d="M201 281 L201 157 L377 157 L377 87"
                    fill="none"
                    stroke="#FFC93C"
                    strokeWidth="5"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                />

                {/* Ambulance */}
                <g transform="translate(180 256)">
                    <rect width="42" height="28" rx="8" fill="#FFFFFF" stroke="#1B1F3B" strokeWidth="2" />
                    <rect x="8" y="4" width="25" height="8" rx="2" fill="#B8E9DF" />
                    <rect x="17" y="17" width="8" height="4" fill="#FF5A4E" />
                    <rect x="19" y="15" width="4" height="8" fill="#FF5A4E" />
                    <rect x="11" y="-3" width="20" height="4" rx="2" fill="#FF5A4E" />
                </g>

                {/* Alert */}
                <g transform="translate(377 87)">
                    <circle r="26" fill="#FF5A4E" opacity=".18" />
                    <circle r="17" fill="#FF5A4E" stroke="#FFFFFF" strokeWidth="3" />
                    <text
                        x="0"
                        y="6"
                        textAnchor="middle"
                        fontSize="19"
                        fontWeight="800"
                        fill="#FFFFFF"
                    >
                        !
                    </text>
                </g>
            </svg>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#1B1F3B]/20 pt-4">
                <div className="flex items-center gap-2 text-xs font-bold">
                    <Navigation size={15} className="text-[#FF5A4E]" />
                    FROM INCIDENT TO RESPONSE
                </div>
                <span className="font-mono text-[10px] text-[#54536B]">
                    CONCEPT / GAMEPLAY DESIGN
                </span>
            </div>
        </div>
    );
}

function InterfacePreview() {
    return (
        <div className="overflow-hidden rounded-[20px] border-2 border-[#1B1F3B] bg-[#FFFDF7] shadow-[7px_8px_0_#1B1F3B]">
            <div className="flex h-10 items-center justify-between border-b-2 border-[#1B1F3B] bg-[#FFF6E5] px-4">
                <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5A4E]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFC93C]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3DBE7A]" />
                </div>
                <span className="font-mono text-[10px] font-bold">
                    NEXUS / CONTROL
                </span>
                <MoveUpRight size={14} />
            </div>

            <div className="grid grid-cols-[55px_minmax(0,1fr)] sm:grid-cols-[105px_minmax(0,1fr)]">
                <aside className="min-h-[335px] bg-[#1B1F3B] px-2 py-5 text-white">
                    <div className="text-center font-display text-lg font-extrabold">
                        N<span className="text-[#FFC93C]">.</span>
                    </div>
                    <div className="mt-10 space-y-2">
                        {[Activity, MapPin, CircleAlert, Radio].map((Icon, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2 rounded-md p-2 ${i === 0 ? "bg-[#313757] text-white" : "text-[#AAB1C5]"
                                    }`}
                            >
                                <Icon size={15} />
                                <span className="hidden text-[9px] sm:inline">
                                    {["Overview", "Map", "Incidents", "Activity"][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="min-w-0 p-3 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <p className="text-[9px] font-bold text-[#777989]">
                                DISTRICT 01
                            </p>
                            <h3 className="mt-1 font-display text-lg font-extrabold tracking-tight sm:text-2xl">
                                City overview
                            </h3>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BEEAD3]">
                            <Activity size={16} />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                            ["03", "Active", "#FFF0C0"],
                            ["01", "High", "#FFE0D9"],
                            ["02", "Review", "#DDF3EA"],
                        ].map(([count, title, bg]) => (
                            <div
                                key={title}
                                className="rounded-lg border border-[#E5DED0] p-2 sm:p-3"
                                style={{ backgroundColor: bg }}
                            >
                                <strong className="font-display text-lg sm:text-2xl">
                                    {count}
                                </strong>
                                <p className="text-[9px] text-[#696C79]">
                                    {title}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="relative mt-3 h-[140px] overflow-hidden rounded-lg border border-[#E1D9C9] bg-[#D9E9D1]">
                        <div className="absolute left-[20%] top-0 h-full w-5 bg-[#FFF8E9]" />
                        <div className="absolute left-0 top-[45%] h-5 w-full bg-[#FFF8E9]" />
                        <div className="absolute left-[52%] top-[10%] h-10 w-[26%] rounded bg-[#AED5A8]" />
                        <div className="absolute left-[57%] bottom-[10%] h-10 w-[30%] rounded bg-[#B8D5C3]" />
                        <div className="absolute left-[10%] top-[15%] h-7 w-[20%] rounded bg-[#FFC93C]" />

                        <div className="absolute left-[18%] top-[35%] flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#FF5A4E] text-white shadow-md">
                            <CircleAlert size={13} />
                        </div>

                        <div className="absolute bottom-2 right-2 rounded bg-white px-2 py-1 font-mono text-[8px] font-bold">
                            SIMULATED MAP
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const progress = useRef({ t: 0, reserve: 0 });
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const measure = () => {
            progress.current.reserve = content.offsetHeight + 32;
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(content);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const ctx = gsap.context(() => {
            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            if (reducedMotion) {
                progress.current.t = 1;
                gsap.set(content, {
                    autoAlpha: 1,
                    y: 0,
                    pointerEvents: "auto",
                });
                return;
            }

            progress.current.t = 0;

            gsap.set(content, {
                autoAlpha: 0,
                y: 26,
                pointerEvents: "none",
            });

            const tl = gsap.timeline({ delay: 0.2 });

            // Preserve the original cinematic timing.
            tl.to(progress.current, {
                t: 1,
                duration: 2,
                delay: 5,
                ease: "power3.inOut",
            });

            tl.to(
                content,
                {
                    autoAlpha: 1,
                    y: 0,
                    pointerEvents: "auto",
                    duration: 0.9,
                    ease: "power3.out",
                },
                "-=0.8"
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen overflow-x-clip bg-[#FFF6E5] text-[#1B1F3B]">
            {/* Navigation */}
            <header className="relative z-30 border-b-2 border-[#1B1F3B] bg-[#FFF6E5]">
                <nav className="nx-container flex h-[76px] items-center justify-between">
                    <Link
                        to="/"
                        className="nx-display text-[29px] font-extrabold"
                        aria-label="NEXUS homepage"
                    >
                        nexus<span className="text-[#FF5A4E]">.</span>
                    </Link>

                    <div className="hidden items-center gap-9 md:flex">
                        <a href="#vision" className="nx-link text-[13px] font-bold hover:text-[#E24D43]">
                            The idea
                        </a>
                        <a href="#simulation" className="nx-link text-[13px] font-bold hover:text-[#E24D43]">
                            Simulation
                        </a>
                        <a href="#game" className="nx-link text-[13px] font-bold hover:text-[#E24D43]">
                            Rescue Run
                        </a>
                        <a href="#control" className="nx-link text-[13px] font-bold hover:text-[#E24D43]">
                            Control Room
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/preview"
                            className="nx-button nx-button-ink hidden sm:inline-flex"
                        >
                            Open demo
                            <ArrowUpRight size={16} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((value) => !value)}
                            aria-expanded={menuOpen}
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                            className="nx-icon-button rounded-lg border-2 border-[#1B1F3B] p-2 md:hidden"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </nav>

                {menuOpen && (
                    <div className="nx-container flex flex-col gap-1 border-t border-[#1B1F3B]/20 py-4 md:hidden">
                        {[
                            ["The idea", "#vision"],
                            ["Simulation", "#simulation"],
                            ["Rescue Run", "#game"],
                            ["Control Room", "#control"],
                        ].map(([title, href]) => (
                            <a
                                key={href}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                className="px-2 py-3 text-sm font-bold hover:text-[#E24D43]"
                            >
                                {title}
                            </a>
                        ))}
                        <Link
                            to="/preview"
                            onClick={() => setMenuOpen(false)}
                            className="nx-button nx-button-ink mt-3 sm:hidden"
                        >
                            Open demo
                        </Link>
                    </div>
                )}
            </header>

            {/* Cinematic hero */}
            <section
                ref={heroRef}
                className="relative isolate h-[calc(100svh-76px)] min-h-[570px] overflow-hidden bg-[#FFF6E5]"
            >
                <div className="absolute inset-0">
                    <CityScene progress={progress} />
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[54%] bg-gradient-to-t from-[#FFF6E5] via-[#FFF6E5]/90 to-transparent" />

                <div className="pointer-events-none absolute left-5 top-6 z-10 hidden items-center gap-3 lg:flex lg:left-10">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3DBE7A]" />
                    <span className="font-mono text-[10px] font-bold tracking-[0.13em]">
                        AN INTERACTIVE CITY EXPERIENCE
                    </span>
                </div>

                <div className="absolute right-5 top-6 z-10 hidden rotate-[5deg] border-2 border-[#1B1F3B] bg-[#FFC93C] px-4 py-2 text-[11px] font-extrabold shadow-[3px_3px_0_#1B1F3B] lg:block lg:right-10">
                    BUILT TO EXPLORE
                </div>

                <div
                    ref={contentRef}
                    className="invisible absolute inset-x-4 bottom-5 z-10 mx-auto flex max-w-[760px] flex-col items-center text-center opacity-0 sm:bottom-9"
                >
                    <span className="nx-eyebrow mb-3 text-[#DC4D43]">
                        THE CITY THAT THINKS
                    </span>

                    <h1 className="nx-display max-w-[760px] text-[clamp(2.8rem,7vw,6.3rem)] font-extrabold leading-[0.94]">
                        Every city
                        <br />
                        has a{" "}
                        <span className="relative inline-block text-[#E94F45]">
                            pulse
                            <svg
                                viewBox="0 0 300 24"
                                aria-hidden="true"
                                className="absolute -bottom-3 left-0 h-4 w-full"
                            >
                                <path
                                    d="M7 15 Q95 -2 160 12 T294 8"
                                    fill="none"
                                    stroke="#FFC93C"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                        .
                    </h1>

                    <p className="mt-7 max-w-[535px] text-sm leading-7 text-[#53556B] sm:text-base">
                        Step inside a miniature city. Discover incidents, explore
                        response systems, and see how every street connects
                        to a bigger story.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link to="/preview" className="nx-button nx-button-ink">
                            Explore the city
                            <ArrowUpRight size={17} />
                        </Link>

                        <a href="#simulation" className="nx-button nx-button-yellow">
                            Try the simulation
                            <Play size={16} fill="currentColor" />
                        </a>
                    </div>
                </div>

                <a
                    href="#vision"
                    className="absolute bottom-6 right-6 z-20 hidden items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider xl:flex"
                >
                    SCROLL TO EXPLORE
                    <ArrowDownRight size={17} />
                </a>
            </section>

            {/* Manifesto */}
            <section
                id="vision"
                className="scroll-mt-20 border-y-2 border-[#1B1F3B] bg-[#FFC93C] py-20 sm:py-28"
            >
                <div className="nx-container">
                    <SectionNumber number="01" title="The big picture" />

                    <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                        <h2 className="nx-display max-w-[810px] text-[clamp(2.7rem,6vw,6.2rem)] font-extrabold leading-[0.98]">
                            The city isn't
                            <br />
                            a spreadsheet.
                            <br />
                            <span className="text-[#D8443D]">
                                So why treat
                                <br />
                                it like one?
                            </span>
                        </h2>

                        <div className="max-w-[420px] lg:ml-auto">
                            <p className="text-lg leading-[1.7]">
                                Roads. People. Buildings. Emergencies. They all
                                connect. NEXUS brings those moving parts into one
                                visual experience, so decisions feel less abstract
                                and more human.
                            </p>
                            <div className="mt-8">
                                <ArrowLink to="/preview">
                                    See the Control Room
                                </ArrowLink>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Uneven, editorial feature layout */}
            <section className="py-20 sm:py-28">
                <div className="nx-container">
                    <SectionNumber number="02" title="A closer look" />

                    <div className="mt-12 grid gap-7 lg:grid-cols-[0.92fr_1.08fr]">
                        <article className="flex min-h-[420px] flex-col justify-between border-2 border-[#1B1F3B] bg-[#2EC4B6] p-7 sm:p-10">
                            <div className="flex items-start justify-between">
                                <Radio size={35} strokeWidth={1.5} />
                                <span className="nx-stamp">
                                    Explore
                                </span>
                            </div>

                            <div>
                                <h3 className="nx-display max-w-[410px] text-[clamp(2.2rem,4vw,4.1rem)] font-extrabold leading-[1.01]">
                                    A living map.
                                    <br />
                                    Not a list
                                    of dots.
                                </h3>

                                <p className="mt-6 max-w-[370px] text-sm leading-7">
                                    See incidents in their geographical context,
                                    understand priorities, and navigate a city that
                                    feels connected.
                                </p>

                                <div className="mt-7">
                                    <ArrowLink to="/preview">
                                        Open the map
                                    </ArrowLink>
                                </div>
                            </div>
                        </article>

                        <article className="grid min-h-[420px] grid-rows-[auto_1fr] overflow-hidden border-2 border-[#1B1F3B] bg-[#FFFDF7]">
                            <div className="flex items-center justify-between p-7 sm:p-9">
                                <div>
                                    <Eyebrow>Behind every alert</Eyebrow>
                                    <h3 className="nx-display mt-4 text-3xl font-extrabold sm:text-4xl">
                                        Clarity when it counts.
                                    </h3>
                                </div>
                                <CircleAlert
                                    size={35}
                                    strokeWidth={1.5}
                                    className="text-[#FF5A4E]"
                                />
                            </div>

                            <div className="relative flex flex-col justify-end overflow-hidden bg-[#FCE1C8] px-5 pb-6 pt-10 sm:px-9">
                                <div className="absolute -right-7 -top-7 h-36 w-36 rounded-full border-[20px] border-[#FF8F7A]/50" />

                                <div className="relative max-w-[440px] rotate-[-2deg] border-2 border-[#1B1F3B] bg-white p-5 shadow-[6px_7px_0_#1B1F3B]">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold">
                                            INCIDENT / SAMPLE
                                        </span>
                                        <span className="rounded-full bg-[#FFE0DA] px-2 py-1 text-[10px] font-bold text-[#B33A32]">
                                            HIGH
                                        </span>
                                    </div>

                                    <div className="mt-5 flex items-start gap-3">
                                        <div className="rounded-lg bg-[#FFE5DF] p-2.5 text-[#D7473E]">
                                            <TrafficCone size={22} />
                                        </div>
                                        <div>
                                            <p className="font-display text-xl font-bold">
                                                Road obstruction
                                            </p>
                                            <p className="mt-1 text-xs text-[#696C79]">
                                                Central Avenue · District 01
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-3 border-t border-[#E7E5E0] pt-4">
                                        <span className="h-2 w-2 rounded-full bg-[#FFC93C]" />
                                        <span className="text-xs font-semibold">
                                            Awaiting assessment
                                        </span>
                                        <ArrowRight size={15} className="ml-auto" />
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="mt-7 grid gap-7 lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="min-h-[360px] border-2 border-[#1B1F3B] bg-[#FF8F7A] p-7 sm:p-10">
                            <div className="flex items-center justify-between">
                                <Truck size={36} strokeWidth={1.6} />
                                <span className="font-mono text-[11px] font-bold">
                                    SIMULATE / RESPOND
                                </span>
                            </div>
                            <h3 className="nx-display mt-14 max-w-[530px] text-3xl font-extrabold leading-tight sm:text-5xl">
                                What happens
                                <br />
                                after the alert?
                            </h3>
                            <p className="mt-5 max-w-[440px] text-sm leading-7">
                                Test simulated responses and follow incidents
                                through a visible resolution process.
                            </p>
                        </div>

                        <div className="flex min-h-[360px] flex-col justify-between border-2 border-[#1B1F3B] bg-[#1B1F3B] p-7 text-white sm:p-10">
                            <div className="flex items-center justify-between">
                                <ShieldCheck size={34} strokeWidth={1.5} />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#B7C1D3]">
                                    OPERATOR TOOLS
                                </span>
                            </div>

                            <div>
                                <h3 className="nx-display text-3xl font-extrabold leading-tight sm:text-5xl">
                                    Built to be used.
                                    <br />
                                    Not just admired.
                                </h3>
                                <p className="mt-5 max-w-[420px] text-sm leading-7 text-[#D5D6E0]">
                                    Protected operator access, incident reports,
                                    status tracking, and a dedicated dashboard.
                                </p>
                                <div className="mt-7">
                                    <ArrowLink to="/login" dark>
                                        Operator sign in
                                    </ArrowLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Future game feature, honestly labeled */}
            <section
                id="game"
                className="scroll-mt-20 bg-[#3DBE7A] py-20 sm:py-28"
            >
                <div className="nx-container">
                    <SectionNumber number="04" title="Coming in a later phase" />

                    <div className="mt-12 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 border-2 border-[#1B1F3B] bg-[#FFC93C] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em]">
                                <Gamepad2 size={17} />
                                IN DEVELOPMENT
                            </div>

                            <h2 className="nx-display mt-7 text-[clamp(3.2rem,6vw,6.6rem)] font-extrabold leading-[0.92]">
                                Rescue
                                <br />
                                <span className="text-[#FFF6E5]">Run.</span>
                            </h2>

                            <p className="mt-7 max-w-[450px] text-base leading-8">
                                An emergency-response driving game is being
                                designed for the NEXUS city. Navigate busy streets,
                                race against the clock, and complete ambulance,
                                fire, and police missions.
                            </p>

                            <p className="mt-5 text-xs font-bold uppercase tracking-wider">
                                PLAYABLE GAME / PLANNED FOR PHASE 5
                            </p>
                        </div>

                        <MissionIllustration />
                    </div>
                </div>
            </section>

            {/* Control Room preview */}
            <section
                id="control"
                className="scroll-mt-20 bg-[#FFF6E5] py-24 sm:py-32"
            >
                <div className="nx-container">
                    <SectionNumber number="05" title="Behind the scenes" />

                    <div className="mt-12 grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div>
                            <Eyebrow>THE OPERATOR VIEW</Eyebrow>

                            <h2 className="nx-display mt-5 text-[clamp(2.9rem,5vw,5.2rem)] font-extrabold leading-[1.01]">
                                The entire city.
                                <br />
                                <span className="text-[#E64D43]">
                                    One clear view.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-[430px] text-base leading-8 text-[#58596C]">
                                NEXUS combines incident records, a city map,
                                severity indicators, status changes, and operator
                                workflows in a single control room.
                            </p>

                            <div className="mt-8 space-y-4">
                                {[
                                    "Map-based incident discovery",
                                    "Priority and status tracking",
                                    "Operator-only incident changes",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-sm font-bold">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C8EBCF]">
                                            <Check size={16} />
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Link to="/preview" className="nx-button nx-button-ink">
                                    Open public preview
                                    <ArrowUpRight size={16} />
                                </Link>
                                <ArrowLink to="/login">
                                    Operator login
                                </ArrowLink>
                            </div>
                        </div>

                        <div>
                            <InterfacePreview />
                            <p className="mt-5 text-xs text-[#626579]">
                                Illustrative concept of the Control Room.
                                The live preview is available at /preview.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="overflow-hidden border-y-2 border-[#1B1F3B] bg-[#FF5A4E] py-20 sm:py-28">
                <div className="nx-container relative">
                    <div className="absolute -right-20 -top-24 hidden h-64 w-64 rounded-full border-[30px] border-[#FFC93C] lg:block" />

                    <p className="text-xs font-extrabold uppercase tracking-[0.19em]">
                        READY TO TAKE A LOOK?
                    </p>

                    <div className="relative mt-6 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                        <h2 className="nx-display max-w-[890px] text-[clamp(3.4rem,8vw,8rem)] font-extrabold leading-[0.91]">
                            A city worth
                            <br />
                            exploring.
                        </h2>

                        <Link to="/preview" className="nx-button nx-button-yellow shrink-0">
                            Enter NEXUS
                            <MoveUpRight size={19} />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="bg-[#1B1F3B] py-12 text-[#FFF6E5]">
                <div className="nx-container">
                    <div className="flex flex-col justify-between gap-10 md:flex-row">
                        <div>
                            <Link to="/" className="nx-display text-4xl font-extrabold">
                                nexus<span className="text-[#FFC93C]">.</span>
                            </Link>
                            <p className="mt-3 text-sm text-[#C2C4D1]">
                                The City That Thinks.
                                <br />
                                Built as an interactive portfolio project.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-start gap-x-12 gap-y-5 text-sm font-semibold">
                            <a href="#vision" className="hover:text-[#FFC93C]">
                                The idea
                            </a>
                            <a href="#simulation" className="hover:text-[#FFC93C]">
                                Simulation
                            </a>
                            <Link to="/preview" className="hover:text-[#FFC93C]">
                                Public demo
                            </Link>
                            <Link to="/login" className="hover:text-[#FFC93C]">
                                Operator access
                            </Link>
                        </div>
                    </div>

                    <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/20 pt-5 text-[11px] text-[#B4B7C8] sm:flex-row">
                        <span>© {new Date().getFullYear()} NEXUS</span>
                        <span>Fictional city · Simulated incidents · Real interactions</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
