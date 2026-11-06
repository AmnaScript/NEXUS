
import { LoaderCircle } from "lucide-react";

export default function RouteLoading() {
    return (
        <main
            className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FFF6E5] px-5 text-[#1B1F3B]"
            role="status"
            aria-live="polite"
            aria-label="Loading NEXUS"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFC93C]">
                <LoaderCircle
                    size={28}
                    className="animate-spin motion-reduce:animate-none"
                />
            </div>

            <p className="nx-display mt-6 text-3xl font-extrabold">
                nexus<span className="text-[#FF5A4E]">.</span>
            </p>

            <p className="mt-2 text-sm font-medium text-[#6B697A]">
                Loading your experience...
            </p>
        </main>
    );
}
