
import { ArrowLeft, ArrowUpRight, MapPin, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#FFF6E5] text-[#1B1F3B]">
            <header className="relative z-10 border-b-2 border-[#1B1F3B] px-5 py-5 sm:px-10">
                <Link
                    to="/"
                    className="nx-display text-3xl font-extrabold"
                >
                    nexus<span className="text-[#FF5A4E]">.</span>
                </Link>
            </header>

            <div className="mx-auto grid w-full max-w-[1280px] flex-1 items-center gap-12 px-5 py-14 sm:px-10 lg:grid-cols-2">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#1B1F3B] bg-[#FFC93C] px-4 py-2 font-mono text-xs font-extrabold">
                        <SearchX size={17} />
                        ERROR / 404
                    </span>

                    <h1 className="nx-display mt-8 text-[clamp(3.5rem,9vw,7rem)] font-extrabold leading-[0.95] tracking-tight">
                        Wrong
                        <br />
                        turn<span className="text-[#FF5A4E]">.</span>
                    </h1>

                    <p className="mt-7 max-w-md text-base leading-8 text-[#676678]">
                        We couldn't find that route in NEXUS. The page may
                        have moved, or the address may be incorrect.
                    </p>

                    <div className="mt-9 flex flex-wrap gap-3">
                        <Link to="/" className="nx-button nx-button-ink">
                            <ArrowLeft size={17} />
                            Back to homepage
                        </Link>

                        <Link to="/preview" className="nx-button nx-button-yellow">
                            Explore Control Room
                            <ArrowUpRight size={17} />
                        </Link>
                    </div>
                </div>

                <div
                    aria-hidden="true"
                    className="relative flex aspect-square max-h-[500px] items-center justify-center rounded-[30px] border-2 border-[#1B1F3B] bg-[#D5EBD9] p-8 shadow-[7px_8px_0_#1B1F3B]"
                >
                    <svg
                        viewBox="0 0 360 360"
                        className="h-full w-full"
                        fill="none"
                    >
                        <rect x="12" y="12" width="336" height="336" rx="20" fill="#C6E5CF" />

                        <path
                            d="M122 12 V348 M236 12 V348 M12 122 H348 M12 236 H348"
                            stroke="#526677"
                            strokeWidth="35"
                        />

                        <path
                            d="M122 12 V348 M236 12 V348 M12 122 H348 M12 236 H348"
                            stroke="#FFF0B6"
                            strokeWidth="2"
                            strokeDasharray="10 15"
                        />

                        <rect x="25" y="25" width="62" height="62" rx="8" fill="#FFBEA5" />
                        <rect x="162" y="25" width="38" height="62" rx="7" fill="#A5D9E2" />
                        <rect x="272" y="24" width="57" height="65" rx="8" fill="#FFD778" />
                        <rect x="25" y="164" width="62" height="42" rx="7" fill="#FFF6E5" />
                        <rect x="270" y="164" width="61" height="42" rx="7" fill="#F2C9DE" />
                        <rect x="25" y="272" width="62" height="57" rx="8" fill="#A2D0A1" />
                        <rect x="164" y="274" width="36" height="56" rx="7" fill="#FFBEA5" />
                        <rect x="272" y="272" width="58" height="58" rx="7" fill="#9FCEDB" />

                        <path
                            d="M122 303 V236 H236 V122 H301"
                            stroke="#FF5A4E"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="13 12"
                        />

                        <circle cx="301" cy="122" r="22" fill="#FF5A4E" stroke="#FFF6E5" strokeWidth="5" />
                        <path d="M301 111 V124 M301 132 V134" stroke="white" strokeWidth="5" strokeLinecap="round" />

                        <circle cx="122" cy="303" r="13" fill="#2EC4B6" stroke="#1B1F3B" strokeWidth="4" />
                    </svg>

                    <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-[#1B1F3B] bg-[#FFF6E5] px-4 py-2 text-xs font-extrabold">
                        <MapPin size={16} />
                        ROUTE NOT FOUND
                    </div>
                </div>
            </div>

            <footer className="border-t border-[#D8D0C1] px-5 py-5 text-xs text-[#777587] sm:px-10">
                NEXUS / The City That Thinks
            </footer>
        </main>
    );
}
