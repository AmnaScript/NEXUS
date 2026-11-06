
import {
    LayoutList,
    RefreshCw,
    ShieldCheck,
    SlidersHorizontal,
} from "lucide-react";

export type ControlRoomSettings = {
    compactCards: boolean;
    highlightHighPriority: boolean;
    autoRefresh: boolean;
};

export const DEFAULT_CONTROL_ROOM_SETTINGS: ControlRoomSettings = {
    compactCards: false,
    highlightHighPriority: true,
    autoRefresh: false,
};

const STORAGE_KEY = "nexus-control-room-settings-v1";

export function readControlRoomSettings(): ControlRoomSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { ...DEFAULT_CONTROL_ROOM_SETTINGS };

        const parsed: unknown = JSON.parse(stored);

        if (!parsed || typeof parsed !== "object") {
            return { ...DEFAULT_CONTROL_ROOM_SETTINGS };
        }

        const value = parsed as Partial<ControlRoomSettings>;

        return {
            compactCards:
                typeof value.compactCards === "boolean"
                    ? value.compactCards
                    : false,
            highlightHighPriority:
                typeof value.highlightHighPriority === "boolean"
                    ? value.highlightHighPriority
                    : true,
            autoRefresh:
                typeof value.autoRefresh === "boolean"
                    ? value.autoRefresh
                    : false,
        };
    } catch {
        return { ...DEFAULT_CONTROL_ROOM_SETTINGS };
    }
}

export function saveControlRoomSettings(
    settings: ControlRoomSettings
): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Preferences still work for the current session.
    }
}

function SettingRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-5 border-b border-[#E7E0D5] py-5 last:border-b-0">
            <div>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="mt-2 max-w-lg text-xs leading-6 text-[#747284]">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={title}
                onClick={() => onChange(!checked)}
                className={`relative h-8 w-14 shrink-0 rounded-full border-2 border-[#1B1F3B] transition ${checked ? "bg-[#3DBE7A]" : "bg-[#E7E0D5]"
                    }`}
            >
                <span
                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-[#1B1F3B] transition-transform ${checked ? "translate-x-6" : ""
                        }`}
                />
            </button>
        </div>
    );
}

export default function ControlRoomPreferences({
    settings,
    onChange,
    preview,
}: {
    settings: ControlRoomSettings;
    onChange: (next: ControlRoomSettings) => void;
    preview: boolean;
}) {
    function update<K extends keyof ControlRoomSettings>(
        key: K,
        value: ControlRoomSettings[K]
    ) {
        onChange({ ...settings, [key]: value });
    }

    return (
        <div className="max-w-4xl">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC93C]">
                    <SlidersHorizontal size={25} />
                </div>
                <div>
                    <h2 className="nx-display text-3xl font-extrabold sm:text-4xl">
                        Workspace settings<span className="text-[#FF5A4E]">.</span>
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#686778]">
                        Customize how incident information appears. These
                        preferences are saved to this browser only.
                    </p>
                </div>
            </div>

            <section className="mt-8 rounded-[20px] border border-[#DDD6C7] bg-[#FFFCF5] px-5 sm:px-7">
                <div className="flex items-center gap-3 border-b border-[#E7E0D5] py-5">
                    <LayoutList size={19} />
                    <h3 className="nx-display text-xl font-extrabold">
                        Incident display
                    </h3>
                </div>

                <SettingRow
                    title="Compact incident cards"
                    description="Reduce spacing in the incident queue so more reports fit on screen."
                    checked={settings.compactCards}
                    onChange={(value) => update("compactCards", value)}
                />

                <SettingRow
                    title="Highlight high-priority reports"
                    description="Give unresolved high-severity incidents a stronger visual outline."
                    checked={settings.highlightHighPriority}
                    onChange={(value) =>
                        update("highlightHighPriority", value)
                    }
                />

                <SettingRow
                    title="Automatic incident refresh"
                    description="Refresh records approximately every 60 seconds while this Control Room is open. The Refresh button is always available."
                    checked={settings.autoRefresh}
                    onChange={(value) => update("autoRefresh", value)}
                />
            </section>

            <section className="mt-5 flex items-start gap-4 rounded-[18px] border border-[#D2DECB] bg-[#E4F2E0] p-5">
                {preview ? (
                    <RefreshCw size={22} className="shrink-0" />
                ) : (
                    <ShieldCheck size={22} className="shrink-0" />
                )}

                <div>
                    <h3 className="text-sm font-extrabold">
                        {preview ? "Public preview mode" : "Protected operator mode"}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#53685B]">
                        {preview
                            ? "These settings change only the way you view demo records. They do not grant permission to edit incidents."
                            : "Preferences affect your browser's display. They do not change server permissions, incident records, or other operators' settings."}
                    </p>
                </div>
            </section>
        </div>
    );
}
