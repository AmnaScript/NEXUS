
import CityWorld from "../city-world/CityWorld";
import { Activity, ArrowUpRight, HeartPulse } from "lucide-react";

export default function HeroCity() {
    return (
        <div className="relative h-full min-h-[420px] w-full">
            <CityWorld mode="hero" />

            <div className="pointer-events-none absolute right-2 top-8 hidden rounded-2xl border border-[#E3E8E1] bg-white/95 p-4 shadow-[0_12px_35px_rgba(33,55,49,0.09)] sm:block">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#E7F5EE] p-3 text-[#217F79]">
                        <Activity size={22} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#202A31]">
                            City simulation
                        </p>
                        <p className="text-xs text-[#70827B]">
                            Interactive 3D environment
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xs text-[#217F79]">
                            <span className="h-2 w-2 rounded-full bg-[#39B98D]" />
                            Ready to explore
                        </p>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-[25%] left-2 hidden items-center gap-3 rounded-xl bg-[#202A31] px-4 py-3 text-white shadow-xl lg:flex">
                <div className="rounded-lg bg-[#C75D4A] p-2">
                    <Activity size={19} />
                </div>
                <div>
                    <p className="text-sm font-medium">Incident response</p>
                    <p className="text-xs text-white/65">
                        Explore simulated scenarios
                    </p>
                </div>
                <ArrowUpRight size={17} />
            </div>

            <div className="pointer-events-none absolute bottom-[19%] right-1 hidden items-center gap-3 rounded-xl border border-[#E1E9E2] bg-white px-4 py-3 shadow-lg lg:flex">
                <HeartPulse size={21} className="text-[#217F79]" />
                <div>
                    <p className="text-sm font-medium text-[#202A31]">
                        Connected infrastructure
                    </p>
                    <p className="text-xs text-[#70827B]">
                        Hospitals · Roads · Utilities
                    </p>
                </div>
            </div>
        </div>
    );
}
