
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Check,
    LoaderCircle,
    MapPin,
    Plus,
    X,
} from "lucide-react";

import { createIncident } from "./incidentApi";
import type { Incident } from "./incidents";

type Props = {
    onClose: () => void;
    onCreated: (incident: Incident) => void;
    onStartPicking: () => void;
    onFinishPicking: () => void;
    isPickingLocation: boolean;
    pickedCoordinates: [number, number] | null;
};

const severityOptions: {
    value: Incident["severity"];
    description: string;
    style: string;
    dot: string;
}[] = [
        {
            value: "Low",
            description: "Routine issue",
            style: "bg-[#DEF6E9] border-[#3DBE7A]",
            dot: "bg-[#2FA66F]",
        },
        {
            value: "Medium",
            description: "Needs attention",
            style: "bg-[#FFF0BC] border-[#E4B439]",
            dot: "bg-[#D6A629]",
        },
        {
            value: "High",
            description: "Urgent response",
            style: "bg-[#FFE0DA] border-[#FF5A4E]",
            dot: "bg-[#FF5A4E]",
        },
    ];

export default function CreateIncident({
    onClose,
    onCreated,
    onStartPicking,
    onFinishPicking,
    isPickingLocation,
    pickedCoordinates,
}: Props) {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [severity, setSeverity] =
        useState<Incident["severity"]>("Low");

    const [longitude, setLongitude] = useState("73.0479");
    const [latitude, setLatitude] = useState("33.6844");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!pickedCoordinates) return;

        setLongitude(String(pickedCoordinates[0]));
        setLatitude(String(pickedCoordinates[1]));
    }, [pickedCoordinates]);

    useEffect(() => {
        if (isPickingLocation) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isPickingLocation, loading, onClose]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading || isPickingLocation) return;

        setError("");

        const lng = Number(longitude);
        const lat = Number(latitude);

        if (!title.trim()) {
            setError("Give this incident a clear title.");
            return;
        }

        if (!location.trim()) {
            setError("Enter a recognizable location.");
            return;
        }

        if (
            longitude.trim() === "" ||
            latitude.trim() === "" ||
            !Number.isFinite(lng) ||
            !Number.isFinite(lat) ||
            lng < -180 ||
            lng > 180 ||
            lat < -90 ||
            lat > 90
        ) {
            setError("Enter valid longitude and latitude coordinates.");
            return;
        }

        setLoading(true);

        try {
            const incident = await createIncident({
                title: title.trim(),
                location: location.trim(),
                severity,
                coordinates: [lng, lat],
            });

            onCreated(incident);
        } catch (err) {
            setError(
                err instanceof Error && err.message !== "Failed to create incident"
                    ? err.message
                    : "We couldn't create the incident. Check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[70] flex justify-end bg-[#1B1F3B]/45"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-incident-heading"
                className="flex h-full w-full max-w-[520px] flex-col border-l-2 border-[#1B1F3B] bg-[#FFF6E5] shadow-2xl"
            >
                <header className="relative overflow-hidden border-b-2 border-[#1B1F3B] bg-[#FFC93C] px-6 py-6 sm:px-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]">
                                NEXUS / NEW REPORT
                            </p>

                            <h2
                                id="create-incident-heading"
                                className="nx-display mt-3 text-3xl font-extrabold leading-tight sm:text-4xl"
                            >
                                Report an
                                <br />
                                incident<span className="text-[#FF5A4E]">.</span>
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Close incident form"
                            className="nx-icon-button flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1B1F3B] bg-[#FFF6E5] transition hover:bg-white disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="mt-4 max-w-sm text-sm leading-6">
                        Describe what happened, set its priority, and choose
                        the location on the city map.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-8 overflow-y-auto px-6 py-7 sm:px-8">
                        {/* Incident title */}
                        <section>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B1F3B] font-mono text-[10px] font-bold text-white">
                                    01
                                </span>

                                <label
                                    htmlFor="incident-title"
                                    className="text-sm font-extrabold"
                                >
                                    What happened?
                                </label>
                            </div>

                            <input
                                id="incident-title"
                                type="text"
                                required
                                maxLength={120}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="nx-input"
                                placeholder="e.g. Fallen tree blocking Central Avenue"
                            />

                            <p className="mt-2 text-xs leading-5 text-[#747385]">
                                Be specific, but keep it short.
                            </p>
                        </section>

                        {/* Location */}
                        <section>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B1F3B] font-mono text-[10px] font-bold text-white">
                                    02
                                </span>

                                <label
                                    htmlFor="incident-location"
                                    className="text-sm font-extrabold"
                                >
                                    Where is it?
                                </label>
                            </div>

                            <input
                                id="incident-location"
                                type="text"
                                required
                                maxLength={200}
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                className="nx-input"
                                placeholder="Street, landmark, or district"
                            />
                        </section>

                        {/* Severity */}
                        <fieldset>
                            <legend className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B1F3B] font-mono text-[10px] font-bold text-white">
                                    03
                                </span>
                                How urgent is it?
                            </legend>

                            <div className="grid grid-cols-3 gap-2">
                                {severityOptions.map((option) => {
                                    const selected = severity === option.value;

                                    return (
                                        <label
                                            key={option.value}
                                            className={`relative flex min-h-[105px] cursor-pointer flex-col justify-between rounded-[13px] border-2 p-3 transition ${selected
                                                    ? option.style
                                                    : "border-[#DDD6C7] bg-[#FFFCF5] hover:border-[#B6AEA0]"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="incident-severity"
                                                value={option.value}
                                                checked={selected}
                                                onChange={() => setSeverity(option.value)}
                                                className="sr-only"
                                            />

                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`h-3 w-3 rounded-full ${option.dot}`}
                                                />
                                                {selected && <Check size={15} />}
                                            </div>

                                            <div>
                                                <p className="text-xs font-extrabold">
                                                    {option.value}
                                                </p>
                                                <p className="mt-1 text-[10px] leading-4 text-[#636273]">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        {/* Coordinates */}
                        <section>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B1F3B] font-mono text-[10px] font-bold text-white">
                                    04
                                </span>
                                <h3 className="text-sm font-extrabold">
                                    Pin the location
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={onStartPicking}
                                className="flex w-full items-center justify-between gap-3 rounded-[14px] border-2 border-dashed border-[#1B1F3B] bg-[#DDF3E5] p-4 text-left transition hover:bg-[#C9E9D7]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3DBE7A]">
                                        <MapPin size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-extrabold">
                                            Choose on city map
                                        </p>
                                        <p className="mt-1 text-xs text-[#616578]">
                                            Click or tap to place the incident marker.
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight size={18} />
                            </button>

                            {pickedCoordinates && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#E1F3E8] px-3 py-2 text-xs font-bold text-[#176B4B]">
                                    <Check size={15} />
                                    Map coordinates selected
                                </div>
                            )}

                            <p className="mt-5 mb-3 text-xs font-semibold text-[#646477]">
                                Or enter coordinates manually
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="incident-longitude"
                                        className="mb-2 block text-xs font-bold"
                                    >
                                        Longitude
                                    </label>
                                    <input
                                        id="incident-longitude"
                                        type="number"
                                        step="any"
                                        min={-180}
                                        max={180}
                                        required
                                        value={longitude}
                                        onChange={(event) =>
                                            setLongitude(event.target.value)
                                        }
                                        className="nx-input"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="incident-latitude"
                                        className="mb-2 block text-xs font-bold"
                                    >
                                        Latitude
                                    </label>
                                    <input
                                        id="incident-latitude"
                                        type="number"
                                        step="any"
                                        min={-90}
                                        max={90}
                                        required
                                        value={latitude}
                                        onChange={(event) =>
                                            setLatitude(event.target.value)
                                        }
                                        className="nx-input"
                                    />
                                </div>
                            </div>
                        </section>

                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-3 rounded-xl border border-[#EFADA7] bg-[#FFE3DE] p-4 text-sm leading-6 text-[#96332F]"
                            >
                                <AlertTriangle size={19} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <footer className="border-t-2 border-[#1B1F3B] bg-[#FFFCF5] p-5 sm:px-8">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="nx-button nx-button-paper flex-1 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="nx-button nx-button-ink flex-1"
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={17} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={17} />
                                        Create report
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="mt-3 text-center text-[11px] text-[#777587]">
                            Only authorized operators can create incidents.
                        </p>
                    </footer>
                </form>
            </aside>
        </div>
    );
}
