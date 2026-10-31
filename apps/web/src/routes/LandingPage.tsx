import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import CityScene from "../features/cinematic-intro/CityScene";
import { Link } from "react-router-dom";

export default function LandingPage() {
    const heroRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const progress = useRef({ t: 0, reserve: 0 });

    // keep track of how tall the text block is
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
                gsap.set(content, { autoAlpha: 1, y: 0, pointerEvents: "auto" });
                return;
            }

            progress.current.t = 0;

            gsap.set(content, {
                autoAlpha: 0,
                y: 25,
                pointerEvents: "none",
            });

            const tl = gsap.timeline({ delay: 0.2 });

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
                    delay: 0.3
                },
                "-=1"
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <main className="overflow-x-clip bg-[#F7F6F2] text-[#202A31]">
            {/* Navigation */}
            <nav className="relative z-20 mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 md:px-10">
                <a href="/" className="text-2xl font-bold tracking-[-0.07em]">
                    NEXUS<span className="text-[#217F79]">.</span>
                </a>

                <div className="hidden items-center gap-8 md:flex">
                    <a href="#about" className="text-sm text-[#617078]">
                        How it works
                    </a>
                    <a href="#technology" className="text-sm text-[#617078]">
                        Technology
                    </a>
                </div>

                 <Link to="/preview"
                    className="rounded-full bg-[#202A31] px-5 py-3 text-sm font-medium text-white hover:bg-[#217F79]"
                >
                    Enter Demo
                </Link>
            </nav>

            {/* Cinematic hero */}
            <section
                ref={heroRef}
                className="relative isolate h-[calc(100dvh-72px)] min-h-[420px] overflow-hidden"
            >
                <div className="absolute inset-0 z-0">
                    <CityScene progress={progress} />
                </div>

                <div
                    ref={contentRef}
                    className="invisible absolute bottom-4 left-1/2 z-10 flex w-[calc(100%-32px)] max-w-4xl -translate-x-1/2 flex-col items-center text-center opacity-0"
                >
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#217F79] sm:text-xs">
                        Intelligent Urban Systems
                    </p>

                    <h1 className="text-3xl font-semibold tracking-[-0.06em] sm:text-4xl lg:text-5xl">
                        Every city has a pulse.
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#617078] md:text-base">
                        Understand yours. Explore an intelligent city
                        where every signal tells a story.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <Link to="/preview"
                            className="inline-flex items-center gap-2 rounded-full bg-[#217F79] px-6 py-3 text-sm font-medium text-white hover:bg-[#17645F]"
                        >
                            Explore Live Demo
                            <ArrowUpRight size={18} />
                        </Link>
                        <Link
                            to="/login"
                            className="text-sm font-medium text-[#52646B] transition hover:text-white"
                        >
                            Operator Login →
                        </Link>

                        <a
                            href="#about"
                            className="rounded-full border border-[#D7DEDA] px-6 py-3 text-sm font-medium hover:bg-white"
                        >
                            How it works
                        </a>
                    </div>
                </div>
            </section>

            <section id="about" className="mx-auto max-w-7xl px-6 py-24">
                <p className="mb-4 text-sm font-medium text-[#217F79]">THE IDEA</p>
                <h2 className="max-w-3xl text-3xl font-semibold md:text-5xl">
                    A smarter way to understand the world around us.
                </h2>
            </section>

            <section id="technology" className="mx-auto max-w-7xl px-6 py-16">
                <h2 className="text-3xl font-semibold">
                    Built for intelligent decisions.
                </h2>
            </section>

            <section id="demo" className="mx-auto max-w-7xl px-6 py-16">
                <h2 className="text-3xl font-semibold">City simulation</h2>
                <p className="mt-3 text-[#617078]">
                    The interactive control room is coming next.
                </p>
            </section>
        </main>
    );
}