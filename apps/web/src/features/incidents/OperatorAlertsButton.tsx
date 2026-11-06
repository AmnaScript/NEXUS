
import { useCallback, useEffect, useState } from "react";
import { Bell, Check, LoaderCircle } from "lucide-react";

import { operatorApi } from "../../lib/operatorApi";
import type { OperatorNotification } from "../../lib/operatorApi";

type Props = {
    onOpenIncident: (incidentId: string) => void;
};

export default function OperatorAlertsButton({
    onOpenIncident,
}: Props) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<OperatorNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [enabled, setEnabled] = useState(true);

    const load = useCallback(async () => {
        const [inbox, profile] = await Promise.all([
            operatorApi.notifications(),
            operatorApi.me(),
        ]);

        setItems(inbox.notifications);
        setEnabled(profile.preferences.notificationsEnabled);
    }, []);

    useEffect(() => {
        void load().catch(() =>
            setError("Unable to load notifications.")
        );

        const timer = window.setInterval(() => {
            void load().catch(() => undefined);
        }, 30000);

        return () => window.clearInterval(timer);
    }, [load]);

    const unread = items.filter((item) => !item.read).length;

    async function markRead(item: OperatorNotification) {
        setLoading(true);
        setError("");

        try {
            await operatorApi.markRead(item.eventKey);
            await load();
            setOpen(false);
            onOpenIncident(item.incidentId);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to update notification."
            );
        } finally {
            setLoading(false);
        }
    }

    async function markAllRead() {
        setLoading(true);

        try {
            await operatorApi.markAllRead();
            await load();
        } catch {
            setError("Unable to mark notifications as read.");
        } finally {
            setLoading(false);
        }
    }

    if (!enabled) {
        return null;
    }

    return (
        <div className="relative">
            <button
                type="button"
                aria-label={`Operator notifications, ${unread} unread`}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#D7CEBE] bg-white"
            >
                <Bell size={18} />
                {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5A4E] px-1 text-[10px] font-bold text-white">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-14 z-50 w-[min(88vw,365px)] rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFFCF5] shadow-[4px_5px_0_#1B1F3B]">
                    <div className="flex items-center justify-between gap-3 border-b border-[#E3DACD] p-4">
                        <div>
                            <h2 className="nx-display text-lg font-extrabold">
                                Operator alerts
                            </h2>
                            <p className="text-xs text-[#717082]">
                                {unread} unread
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void markAllRead()}
                            disabled={loading || unread === 0}
                            className="flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                        >
                            <Check size={15} />
                            Mark all read
                        </button>
                    </div>

                    {error && (
                        <p role="alert" className="p-3 text-xs text-[#AC3832]">
                            {error}
                        </p>
                    )}

                    <div className="max-h-[350px] overflow-y-auto p-2">
                        {loading && (
                            <LoaderCircle
                                size={18}
                                className="mx-auto my-3 animate-spin"
                            />
                        )}

                        {items.length === 0 ? (
                            <p className="p-5 text-center text-sm text-[#717082]">
                                No current incident alerts.
                            </p>
                        ) : (
                            items.map((item) => (
                                <button
                                    key={item.eventKey}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => void markRead(item)}
                                    className="mb-1 w-full rounded-xl border border-transparent bg-white p-3 text-left hover:border-[#1B1F3B] disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-[#D1C8BC]" : "bg-[#FF5A4E]"
                                                }`}
                                        />
                                        <span className="truncate text-xs font-extrabold">
                                            {item.title}
                                        </span>
                                    </div>

                                    <p className="mt-1 pl-4 text-[11px] text-[#717082]">
                                        {item.severity} · {item.status}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
