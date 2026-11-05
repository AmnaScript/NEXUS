
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Check,
    Gamepad2,
    MapPin,
    Menu,
    MoveUpRight,
    Play,
    ShieldCheck,
    Siren,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";

import CityScene from "../features/cinematic-intro/CityScene";
import ProductExperience from "../features/landing/ProductExperience";

const NAV_ITEMS = [
    { label: "The idea", href: "#vision" },
    { label: "Explore", href: "#experience" },
    { label: "Rescue Run", href: "#game" },
] as const;

function SectionHeading({
    number,
    label,
}: {
    number: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-4 border-t-2 border-[#1B1F3B] pt-4">
            <span className="font-mono text-[11px] font-bold">
                {number}
            </span>

            <span className="text-[11px] font-extrabold uppercase tracking-[0.17em]">
                {label}
            </span>

            <span className="ml-auto h-2 w-2 rounded-full bg-[#FF5A4E]" />
        </div>
    );
}

function RescueRunVisual() {
    return (
        <div className="relative overflow-hidden rounded-[22px] border-2 border-[#1B1F3B] bg-[#FCE4C1] p-4 shadow-[6px_7px_0_#1B1F3B] sm:p-6">
            <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-[#1B1F3B] bg-white px-3 py-2 text-[10px] font-extrabold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF5A4E]" />
                EMERGENCY DISPATCH
            </div>

            <svg
                viewBox="0 0 560 360"
                role="img"
                aria-label="Illustration of an ambulance driving through the miniature NEXUS city"
                className="h-auto w-full"
            >
                <rect width="560" height="360" rx="15" fill="#FCE4C1" />

                {/* City plots */}
                <rect x="20" y="20" width="165" height="120" rx="12" fill="#BEE3B6" />
                <rect x="230" y="20" width="130" height="120" rx="12" fill="#B9E6E4" />
                <rect x="405" y="20" width="135" height="120" rx="12" fill="#FFD4B6" />

                <rect x="20" y="190" width="165" height="145" rx="12" fill="#FFD5CE" />
                <rect x="230" y="190" width="130" height="145" rx="12" fill="#DDE5F3" />
                <rect x="405" y="190" width="135" height="145" rx="12" fill="#BEE3B6" />

                {/* Roads */}
                <rect x="185" y="0" width="45" height="360" fill="#53616E" />
                <rect x="360" y="0" width="45" height="360" fill="#53616E" />
                <rect x="0" y="140" width="560" height="50" fill="#53616E" />

                {[20, 85, 275, 460].map((x) => (
                    <line
                        key={x}
                        x1={x}
                        y1="165"
                        x2={x + 30}
                        y2="165"
                        stroke="#FFE39C"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                ))}

                {[20, 85, 240, 305].map((y) => (
                    <g key={y} stroke="#FFE39C" strokeWidth="3">
                        <line x1="207" y1={y} x2="207" y2={y + 23} />
                        <line x1="382" y1={y} x2="382" y2={y + 23} />
                    </g>
                ))}

                {/* Park */}
                {[
                    [55, 62],
                    [110, 52],
                    [151, 101],
                    [443, 248],
                    [496, 213],
                    [504, 302],
                ].map(([x, y], index) => (
                    <g key={index}>
                        <rect
                            x={x - 3}
                            y={y}
                            width="6"
                            height="16"
                            fill="#80664F"
                        />
                        <circle cx={x} cy={y} r="17" fill="#398E61" />
                        <circle cx={x - 5} cy={y - 4} r="12" fill="#6FC17B" />
                    </g>
                ))}

                {/* Downtown */}
                <rect x="247" y="43" width="42" height="78" rx="5" fill="#4A99A8" />
                <rect x="297" y="28" width="45" height="93" rx="5" fill="#318695" />

                {[0, 1, 2, 3].map((row) => (
                    <g key={row}>
                        <rect x="256" y={54 + row * 16} width="24" height="7" rx="2" fill="#C9EEE8" />
                        <rect x="305" y={40 + row * 17} width="27" height="7" rx="2" fill="#C9EEE8" />
                    </g>
                ))}

                {/* Hospital */}
                <rect x="421" y="38" width="104" height="84" rx="8" fill="#FFFFFF" />
                <rect x="431" y="49" width="83" height="20" rx="4" fill="#B8E4EB" />
                <rect x="458" y="79" width="31" height="32" rx="3" fill="#8BC9D9" />
                <rect x="470" y="82" width="7" height="26" fill="#FF5A4E" />
                <rect x="461" y="92" width="25" height="7" fill="#FF5A4E" />

                {/* Fire station */}
                <rect x="34" y="214" width="135" height="98" rx="8" fill="#FFF9EE" />
                <rect x="45" y="245" width="33" height="56" fill="#E98577" />
                <rect x="85" y="245" width="33" height="56" fill="#E98577" />
                <rect x="125" y="245" width="33" height="56" fill="#E98577" />
                <rect x="44" y="227" width="115" height="9" rx="3" fill="#D94D43" />

                {/* Buildings */}
                <rect x="247" y="215" width="42" height="82" rx="5" fill="#F59E87" />
                <rect x="299" y="225" width="43" height="71" rx="5" fill="#FFC93C" />
                {[0, 1, 2].map((row) => (
                    <g key={row} fill="#FFF7E7">
                        <rect x="254" y={227 + row * 18} width="11" height="9" rx="1" />
                        <rect x="272" y={227 + row * 18} width="11" height="9" rx="1" />
                        <rect x="306" y={235 + row * 17} width="12" height="9" rx="1" />
                        <rect x="323" y={235 + row * 17} width="12" height="9" rx="1" />
                    </g>
                ))}

                {/* Suggested route */}
                <path
                    d="M207 285 L207 165 L382 165 L382 90"
                    fill="none"
                    stroke="#FFC93C"
                    strokeWidth="6"
                    strokeDasharray="12 9"
                    strokeLinecap="round"
                />

                {/* Ambulance */}
                <g transform="translate(181 259)">
                    <rect
                        width="51"
                        height="34"
                        rx="9"
                        fill="white"
                        stroke="#1B1F3B"
                        strokeWidth="3"
                    />
                    <rect x="9" y="5" width="33" height="9" rx="2" fill="#A7DCE4" />
                    <rect x="22" y="17" width="7" height="14" fill="#FF5A4E" />
                    <rect x="18" y="21" width="15" height="7" fill="#FF5A4E" />
                    <rect x="14" y="-4" width="23" height="5" rx="2" fill="#FF5A4E" />
                </g>

                {/* Mission destination */}
                <g transform="translate(382 90)">
                    <circle r="28" fill="#FF5A4E" opacity=".2" />
                    <circle r="18" fill="#FF5A4E" stroke="white" strokeWidth="3" />
                    <text
                        x="0"
                        y="7"
                        fontSize="22"
                        fontWeight="800"
                        textAnchor="middle"
                        fill="white"
                    >
                        !
                    </text>
                </g>
            </svg>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1B1F3B]/25 pt-4">
                <div className="flex items-center gap-2 text-[11px] font-extrabold">
                    <Siren size={16} className="text-[#D54C42]" />
                    YOU ARE THE FIRST RESPONDER
                </div>

                <span className="font-mono text-[10px] font-bold">
                    PLAYABLE / BROWSER GAME
                </span>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Retains the interface expected by CityScene/CityAnimation.
    const progress = useRef({
        t: 0,
        reserve: 0,
    });

    const [menuOpen, setMenuOpen] = useState(false);

    // Measure the hero copy for responsive camera framing.
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

    // Original cinematic timing is preserved.
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

            const timeline = gsap.timeline({
                delay: 0.2,
            });

            timeline.to(progress.current, {
                t: 1,
                duration: 2,
                delay: 5,
                ease: "power3.inOut",
            });

            timeline.to(
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
                <nav
                    className="nx-container flex h-[76px] items-center justify-between"
                    aria-label="Main navigation"
                >
                    <Link
                        to="/"
                        aria-label="NEXUS homepage"
                        className="nx-display text-[29px] font-extrabold"
                    >
                        nexus<span className="text-[#FF5A4E]">.</span>
                    </Link>

                    <div className="hidden items-center gap-9 md:flex">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="nx-link text-[13px] font-bold hover:text-[#E24D43]"
                            >
                                {item.label}
                            </a>
                        ))}

                        <Link
                            to="/login"
                            className="nx-link text-[13px] font-bold hover:text-[#E24D43]"
                        >
                            Operator login
                        </Link>
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
                            aria-controls="nexus-mobile-navigation"
                            aria-label={
                                menuOpen ? "Close navigation" : "Open navigation"
                            }
                            className="nx-icon-button rounded-lg border-2 border-[#1B1F3B] p-2 md:hidden"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </nav>

                {menuOpen && (
                    <div
                        id="nexus-mobile-navigation"
                        className="nx-container flex flex-col gap-1 border-t border-[#1B1F3B]/20 py-4 md:hidden"
                    >
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="px-2 py-3 text-sm font-bold hover:text-[#E24D43]"
                            >
                                {item.label}
                            </a>
                        ))}

                        <Link
                            to="/play"
                            onClick={() => setMenuOpen(false)}
                            className="px-2 py-3 text-sm font-bold"
                        >
                            Play Rescue Run
                        </Link>

                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="px-2 py-3 text-sm font-bold"
                        >
                            Operator login
                        </Link>

                        <Link
                            to="/preview"
                            onClick={() => setMenuOpen(false)}
                            className="nx-button nx-button-ink mt-3 sm:hidden"
                        >
                            Open public demo
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

                <div className="pointer-events-none absolute left-5 top-6 z-10 hidden items-center gap-3 lg:left-10 lg:flex">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#3DBE7A]" />

                    <span className="font-mono text-[10px] font-bold tracking-[0.13em]">
                        AN INTERACTIVE CITY EXPERIENCE
                    </span>
                </div>

                <div className="absolute right-5 top-6 z-10 hidden rotate-[5deg] border-2 border-[#1B1F3B] bg-[#FFC93C] px-4 py-2 text-[11px] font-extrabold shadow-[3px_3px_0_#1B1F3B] lg:right-10 lg:block">
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
                        Step inside a miniature city. Discover incidents,
                        explore response systems, and experience how
                        everything connects.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/preview"
                            className="nx-button nx-button-ink"
                        >
                            Explore Control Room
                            <ArrowUpRight size={17} />
                        </Link>

                        <Link
                            to="/play"
                            className="nx-button nx-button-yellow"
                        >
                            Play Rescue Run
                            <Play size={16} fill="currentColor" />
                        </Link>
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
                    <SectionHeading
                        number="01"
                        label="The big picture"
                    />

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
                                Roads. People. Buildings. Emergencies.
                                They all connect. NEXUS brings those
                                moving parts into one visual experience,
                                making incident management easier to
                                understand.
                            </p>

                            <Link
                                to="/preview"
                                className="mt-8 inline-flex items-center gap-3 border-b-2 border-[#1B1F3B] pb-2 text-sm font-bold hover:gap-5"
                            >
                                See the Control Room
                                <ArrowUpRight size={17} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Single comprehensive product overview */}
            <ProductExperience />

            {/* Playable Rescue Run feature */}
            <section
                id="game"
                className="scroll-mt-20 bg-[#3DBE7A] py-20 sm:py-28"
            >
                <div className="nx-container">
                    <SectionHeading
                        number="03"
                        label="Interactive city simulation"
                    />

                    <div className="mt-12 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 border-2 border-[#1B1F3B] bg-[#FFC93C] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em]">
                                <Gamepad2 size={17} />
                                PLAYABLE NOW
                            </div>

                            <h2 className="nx-display mt-7 text-[clamp(3.2rem,6vw,6.6rem)] font-extrabold leading-[0.92]">
                                Rescue
                                <br />
                                <span className="text-[#FFF6E5]">
                                    Run.
                                </span>
                            </h2>

                            <p className="mt-7 max-w-[450px] text-base leading-8">
                                Take control of an ambulance in the
                                NEXUS city. Navigate traffic, find
                                patients, reach the hospital, and complete
                                timed rescue missions.
                            </p>

                            <div className="mt-7 space-y-3">
                                {[
                                    "Three driving camera perspectives",
                                    "AI-controlled traffic and working signals",
                                    "Timed rescues with live mission objectives",
                                ].map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-3 text-sm font-bold"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#CFF1D2]">
                                            <Check size={16} />
                                        </span>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/play"
                                className="nx-button nx-button-ink mt-9"
                            >
                                <Play size={17} fill="currentColor" />
                                Start Rescue Run
                                <ArrowRight size={17} />
                            </Link>

                            <p className="mt-4 text-xs font-semibold text-[#245C40]">
                                Free browser experience · No login required
                            </p>
                        </div>

                        <RescueRunVisual />
                    </div>
                </div>
            </section>

            {/* Operator workflow teaser */}
            <section
                className="border-b-2 border-[#1B1F3B] bg-[#FFF6E5] py-20 sm:py-28"
            >
                <div className="nx-container">
                    <SectionHeading
                        number="04"
                        label="Real application functionality"
                    />

                    <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
                        <div>
                            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.17em] text-[#D94D43]">
                                <ShieldCheck size={18} />
                                Authorized operations
                            </span>

                            <h2 className="nx-display mt-5 max-w-[740px] text-[clamp(2.7rem,5vw,5.4rem)] font-extrabold leading-[1.02]">
                                Behind every report,
                                <span className="text-[#FF5A4E]">
                                    {" "}there's a workflow.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-[540px] text-base leading-8 text-[#626276]">
                                NEXUS isn't just a 3D scene. Its operator
                                workspace includes protected access,
                                map-based incident reporting, priority
                                management, status updates, and an
                                activity timeline.
                            </p>

                            <div className="mt-9 flex flex-wrap gap-3">
                                <Link
                                    to="/preview"
                                    className="nx-button nx-button-ink"
                                >
                                    Explore public demo
                                    <ArrowUpRight size={17} />
                                </Link>

                                <Link
                                    to="/login"
                                    className="nx-button nx-button-paper"
                                >
                                    Operator access
                                    <ArrowRight size={17} />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[24px] border-2 border-[#1B1F3B] bg-[#FCE2C9] p-6 shadow-[6px_7px_0_#1B1F3B] sm:p-9">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-extrabold">
                                    INCIDENT LIFECYCLE
                                </span>

                                <MapPin size={21} />
                            </div>

                            <div className="mt-8 space-y-3">
                                {[
                                    {
                                        number: "01",
                                        title: "Report",
                                        text: "Create a new incident and pin its location.",
                                        color: "#FFC93C",
                                    },
                                    {
                                        number: "02",
                                        title: "Assess",
                                        text: "Review severity and change its status.",
                                        color: "#2EC4B6",
                                    },
                                    {
                                        number: "03",
                                        title: "Resolve",
                                        text: "Close the incident and retain its history.",
                                        color: "#3DBE7A",
                                    },
                                ].map((step) => (
                                    <div
                                        key={step.number}
                                        className="flex items-start gap-4 rounded-[14px] border border-[#1B1F3B] bg-[#FFFCF5] p-4"
                                    >
                                        <span
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-extrabold"
                                            style={{ backgroundColor: step.color }}
                                        >
                                            {step.number}
                                        </span>

                                        <div>
                                            <h3 className="nx-display text-lg font-extrabold">
                                                {step.title}
                                            </h3>

                                            <p className="mt-1 text-sm leading-6 text-[#626276]">
                                                {step.text}
                                            </p>
                                        </div>

                                        <ArrowUpRight
                                            size={18}
                                            className="ml-auto shrink-0"
                                        />
                                    </div>
                                ))}
                            </div>

                            <p className="mt-5 text-xs leading-6 text-[#58596C]">
                                Public visitors can inspect demonstration
                                incidents. Changes to protected incident
                                records require an authorized operator.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="overflow-hidden bg-[#FF5A4E] py-20 sm:py-28">
                <div className="nx-container relative">
                    <div className="absolute -right-20 -top-24 hidden h-64 w-64 rounded-full border-[30px] border-[#FFC93C] lg:block" />

                    <p className="text-xs font-extrabold uppercase tracking-[0.19em]">
                        READY TO EXPLORE?
                    </p>

                    <div className="relative mt-6 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                        <h2 className="nx-display max-w-[890px] text-[clamp(3.4rem,8vw,8rem)] font-extrabold leading-[0.91]">
                            A city worth
                            <br />
                            exploring.
                        </h2>

                        <Link
                            to="/preview"
                            className="nx-button nx-button-yellow shrink-0"
                        >
                            Enter NEXUS
                            <MoveUpRight size={19} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1B1F3B] py-12 text-[#FFF6E5]">
                <div className="nx-container">
                    <div className="flex flex-col justify-between gap-10 md:flex-row">
                        <div>
                            <Link
                                to="/"
                                className="nx-display text-4xl font-extrabold"
                            >
                                nexus
                                <span className="text-[#FFC93C]">
                                    .
                                </span>
                            </Link>

                            <p className="mt-3 text-sm leading-6 text-[#C2C4D1]">
                                The City That Thinks.
                                <br />
                                An interactive full-stack portfolio project.
                            </p>
                        </div>

                        <nav
                            aria-label="Footer navigation"
                            className="flex flex-wrap items-start gap-x-10 gap-y-5 text-sm font-semibold"
                        >
                            <a
                                href="#vision"
                                className="hover:text-[#FFC93C]"
                            >
                                The idea
                            </a>

                            <a
                                href="#experience"
                                className="hover:text-[#FFC93C]"
                            >
                                Explore
                            </a>

                            <Link
                                to="/play"
                                className="hover:text-[#FFC93C]"
                            >
                                Rescue Run
                            </Link>

                            <Link
                                to="/preview"
                                className="hover:text-[#FFC93C]"
                            >
                                Public demo
                            </Link>

                            <Link
                                to="/login"
                                className="hover:text-[#FFC93C]"
                            >
                                Operator access
                            </Link>
                        </nav>
                    </div>

                    <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/20 pt-5 text-[11px] text-[#B4B7C8] sm:flex-row">
                        <span>
                            © {new Date().getFullYear()} NEXUS
                        </span>

                        <span>
                            Fictional city · Simulated incidents · Real interactions
                        </span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
