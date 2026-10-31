
import { useEffect, useState, type FormEvent } from "react";
import { X, Plus } from "lucide-react";
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

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;

        setError("");

        const lng = Number(longitude);
        const lat = Number(latitude);

        if (
            !title.trim() ||
            !location.trim() ||
            !longitude.trim() ||
            !latitude.trim() ||
            !Number.isFinite(lng) ||
            !Number.isFinite(lat) ||
            lng < -180 ||
            lng > 180 ||
            lat < -90 ||
            lat > 90
        ) {
            setError("Please enter valid incident details and coordinates.");
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
            onClose();
        } catch {
            setError("Unable to create incident. Check your backend connection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex justify-end bg-[#202A31]/40">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-incident-title"
                className="flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-[440px]"
            >
                <header className="flex items-center justify-between border-b border-[#DFE4E0] p-6">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#217F79]">
                            NEXUS / REPORT
                        </p>
                        <h2
                            id="create-incident-title"
                            className="mt-2 text-xl font-semibold"
                        >
                            Create Incident
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close form"
                        className="rounded-lg p-2 hover:bg-[#F1F3F0] disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        <div>
                            <label htmlFor="incident-title" className="mb-2 block text-sm font-medium">
                                Incident title
                            </label>
                            <input
                                id="incident-title"
                                required
                                maxLength={120}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Road obstruction"
                                className="w-full rounded-xl border border-[#DFE4E0] px-4 py-3 outline-none focus:border-[#217F79]"
                            />
                        </div>

                        <div>
                            <label htmlFor="incident-location" className="mb-2 block text-sm font-medium">
                                Location
                            </label>
                            <input
                                id="incident-location"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Central Avenue"
                                className="w-full rounded-xl border border-[#DFE4E0] px-4 py-3 outline-none focus:border-[#217F79]"
                            />
                        </div>

                        <div>
                            <label htmlFor="incident-severity" className="mb-2 block text-sm font-medium">
                                Severity
                            </label>
                            <select
                                id="incident-severity"
                                value={severity}
                                onChange={(e) =>
                                    setSeverity(e.target.value as Incident["severity"])
                                }
                                className="w-full rounded-xl border border-[#DFE4E0] bg-white px-4 py-3 focus:border-[#217F79]"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div>
                            <p className="mb-3 text-sm font-medium">
                                Map coordinates
                            </p>
                            <p className="mb-3 text-xs text-[#617078]">
                                Enter coordinates in longitude, latitude order.
                                Map click selection comes next.
                            </p>
                            <button
                                type="button"
                                onClick={onStartPicking}
                                className="mb-4 w-full rounded-xl border border-[#217F79] px-4 py-3 text-sm font-medium text-[#217F79] hover:bg-[#EAF3EF]"
                            >
                                Select Location on Map
                            </button>
                            <div className="grid grid-cols-2 gap-3">

                                <div>
                                    <label htmlFor="incident-lng" className="mb-2 block text-xs">
                                        Longitude
                                    </label>
                                    <input
                                        id="incident-lng"
                                        type="number"
                                        step="any"
                                        required
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        className="w-full rounded-xl border border-[#DFE4E0] px-3 py-3"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="incident-lat" className="mb-2 block text-xs">
                                        Latitude
                                    </label>
                                    <input
                                        id="incident-lat"
                                        type="number"
                                        step="any"
                                        required
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        className="w-full rounded-xl border border-[#DFE4E0] px-3 py-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </p>
                        )}
                    </div>

                    <footer className="flex gap-3 border-t border-[#DFE4E0] p-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-xl border border-[#DFE4E0] px-4 py-3 text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#217F79] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                        >
                            <Plus size={17} />
                            {loading ? "Creating..." : "Create Incident"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
