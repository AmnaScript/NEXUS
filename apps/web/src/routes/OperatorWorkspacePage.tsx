
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Bell,
    Check,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    UserPlus,
    Users,
} from "lucide-react";

import { operatorApi } from "../lib/operatorApi";
import type {
    OperatorListItem,
    OperatorNotification,
    OperatorPreferences,
    OperatorProfile,
} from "../lib/operatorApi";

type Tab = "profile" | "notifications" | "team";

function SwitchRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-[#E4DCCE] py-4 last:border-0">
            <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#707084]">
                    {description}
                </span>
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-5 w-5 accent-[#3DBE7A]"
            />
        </label>
    );
}

export default function OperatorWorkspacePage() {
    const [tab, setTab] = useState<Tab>("profile");
    const [profile, setProfile] = useState<OperatorProfile | null>(null);
    const [team, setTeam] = useState<OperatorListItem[]>([]);
    const [notifications, setNotifications] =
        useState<OperatorNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [displayName, setDisplayName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");

    const [preferences, setPreferences] =
        useState<OperatorPreferences | null>(null);

    const loadData = useCallback(async () => {
        const me = await operatorApi.me();

        setProfile(me);
        setDisplayName(me.displayName);
        setPreferences(me.preferences);

        const inbox = await operatorApi.notifications();
        setNotifications(inbox.notifications);

        if (me.role === "ADMIN") {
            setTeam(await operatorApi.listOperators());
        }
    }, []);

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                await loadData();
            } catch (cause) {
                if (active) {
                    setError(
                        cause instanceof Error
                            ? cause.message
                            : "Unable to load the operator workspace."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, [loadData]);

    // Refresh alerts approximately every 30 seconds.
    useEffect(() => {
        if (!profile?.preferences.notificationsEnabled) return;

        const timer = window.setInterval(() => {
            void operatorApi
                .notifications()
                .then((result) => setNotifications(result.notifications))
                .catch(() => undefined);
        }, 30000);

        return () => window.clearInterval(timer);
    }, [profile?.preferences.notificationsEnabled]);

    async function perform(action: () => Promise<unknown>) {
        if (busy) return;

        setBusy(true);
        setError("");
        setMessage("");

        try {
            await action();
            await loadData();
            setMessage("Changes saved successfully.");
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to save changes."
            );
        } finally {
            setBusy(false);
        }
    }

    function saveName(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void perform(() => operatorApi.updateProfile(displayName));
    }

    function savePreferences(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!preferences) return;

        void perform(() => operatorApi.savePreferences(preferences));
    }

    function sendInvite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        void perform(async () => {
            await operatorApi.invite(inviteEmail, inviteName);
            setInviteEmail("");
            setInviteName("");
        });
    }

    const unread = notifications.filter((item) => !item.read).length;

    return (
        <main className="min-h-[100dvh] bg-[#FFF6E5] px-5 py-8 text-[#1B1F3B] sm:px-8">
            <div className="mx-auto max-w-[1120px]">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1B1F3B] pb-5">
                    <Link to="/" className="nx-display text-3xl font-extrabold">
                        nexus<span className="text-[#FF5A4E]">.</span>
                    </Link>

                    <Link
                        to="/demo"
                        className="inline-flex items-center gap-2 text-sm font-bold"
                    >
                        <ArrowLeft size={17} />
                        Back to Control Room
                    </Link>
                </header>

                <div className="mt-10">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[#D64D43]">
                        Operator workspace
                    </p>
                    <h1 className="nx-display mt-3 text-4xl font-extrabold sm:text-5xl">
                        My NEXUS account<span className="text-[#FF5A4E]">.</span>
                    </h1>
                </div>

                <nav
                    aria-label="Operator account sections"
                    className="mt-8 flex flex-wrap gap-2 border-b border-[#DCD4C5] pb-4"
                >
                    {(
                        [
                            ["profile", "Profile & settings"],
                            ["notifications", `Notifications (${unread})`],
                            ["team", "Team management"],
                        ] as const
                    )
                        .filter(([key]) => key !== "team" || profile?.role === "ADMIN")
                        .map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                aria-pressed={tab === key}
                                className={`rounded-full px-4 py-2 text-xs font-bold ${tab === key
                                    ? "bg-[#1B1F3B] text-white"
                                    : "border border-[#DDD4C5] bg-white"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                </nav>

                {error && (
                    <p role="alert" className="mt-6 rounded-xl bg-[#FFE0DA] p-4 text-sm">
                        {error}
                    </p>
                )}

                {message && (
                    <p role="status" className="mt-6 rounded-xl bg-[#D9F3DF] p-4 text-sm">
                        {message}
                    </p>
                )}

                {loading || !profile ? (
                    <div className="mt-10 flex items-center gap-3 text-sm">
                        <LoaderCircle size={19} className="animate-spin" />
                        Loading operator information...
                    </div>
                ) : tab === "profile" ? (
                    <div className="mt-7 grid gap-5 lg:grid-cols-2">
                        <section className="rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5] p-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={21} />
                                <h2 className="nx-display text-xl font-extrabold">
                                    Operator profile
                                </h2>
                            </div>

                            <p className="mt-5 text-sm">
                                <strong>Email:</strong> {profile.email}
                            </p>
                            <p className="mt-2 text-sm">
                                <strong>Role:</strong> {profile.role}
                            </p>
                            <p className="mt-2 text-sm">
                                <strong>Account:</strong> {profile.status}
                            </p>

                            <form onSubmit={saveName} className="mt-7 space-y-3">
                                <label
                                    htmlFor="operator-display-name"
                                    className="block text-sm font-bold"
                                >
                                    Display name
                                </label>

                                <input
                                    id="operator-display-name"
                                    className="nx-input"
                                    value={displayName}
                                    maxLength={70}
                                    required
                                    onChange={(event) =>
                                        setDisplayName(event.target.value)
                                    }
                                />

                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="nx-button nx-button-ink disabled:opacity-50"
                                >
                                    Save profile
                                </button>
                            </form>

                            <Link
                                to="/forgot-password"
                                className="mt-6 inline-block text-sm font-bold underline"
                            >
                                Password recovery
                            </Link>
                        </section>

                        <section className="rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5] p-6">
                            <h2 className="nx-display text-xl font-extrabold">
                                Workspace preferences
                            </h2>

                            {preferences && (
                                <form onSubmit={savePreferences} className="mt-4">
                                    <SwitchRow
                                        title="Compact incident cards"
                                        description="Show more incident records at once."
                                        checked={preferences.compactCards}
                                        onChange={(value) =>
                                            setPreferences({
                                                ...preferences,
                                                compactCards: value,
                                            })
                                        }
                                    />
                                    <SwitchRow
                                        title="Highlight high priority"
                                        description="Emphasize unresolved high-severity reports."
                                        checked={preferences.highlightHighPriority}
                                        onChange={(value) =>
                                            setPreferences({
                                                ...preferences,
                                                highlightHighPriority: value,
                                            })
                                        }
                                    />
                                    <SwitchRow
                                        title="Auto-refresh"
                                        description="Refresh incident records periodically."
                                        checked={preferences.autoRefresh}
                                        onChange={(value) =>
                                            setPreferences({
                                                ...preferences,
                                                autoRefresh: value,
                                            })
                                        }
                                    />
                                    <SwitchRow
                                        title="Incident notifications"
                                        description="Show account notification alerts."
                                        checked={preferences.notificationsEnabled}
                                        onChange={(value) =>
                                            setPreferences({
                                                ...preferences,
                                                notificationsEnabled: value,
                                            })
                                        }
                                    />

                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="nx-button nx-button-yellow mt-6 disabled:opacity-50"
                                    >
                                        <Check size={17} />
                                        Save preferences
                                    </button>
                                </form>
                            )}
                        </section>
                    </div>
                ) : tab === "notifications" ? (
                    <section className="mt-7 rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5] p-5 sm:p-7">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="nx-display text-xl font-extrabold">
                                    Incident inbox
                                </h2>
                                <p className="mt-2 text-xs text-[#717082]">
                                    {unread} unread reports
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => void perform(async () => {
                                        const result = await operatorApi.notifications();
                                        setNotifications(result.notifications);
                                    })}
                                    className="nx-button nx-button-paper"
                                    disabled={busy}
                                >
                                    <RefreshCw size={16} />
                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    disabled={busy || unread === 0}
                                    onClick={() =>
                                        void perform(() => operatorApi.markAllRead())
                                    }
                                    className="nx-button nx-button-ink disabled:opacity-50"
                                >
                                    <Check size={16} />
                                    Mark all read
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 divide-y divide-[#E5DDCF]">
                            {notifications.length === 0 ? (
                                <p className="py-10 text-sm text-[#707084]">
                                    There are no active incident alerts.
                                </p>
                            ) : (
                                notifications.map((item) => (
                                    <div
                                        key={item.eventKey}
                                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={`mt-2 h-2.5 w-2.5 rounded-full ${item.read ? "bg-[#D0C9BE]" : "bg-[#FF5A4E]"
                                                    }`}
                                            />

                                            <div>
                                                <p className="text-sm font-extrabold">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 text-xs text-[#717082]">
                                                    {item.severity} priority · {item.status}
                                                </p>
                                                <p className="mt-1 text-[11px] text-[#888394]">
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {!item.read && (
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    void perform(() =>
                                                        operatorApi.markRead(item.eventKey)
                                                    )
                                                }
                                                className="rounded-full border border-[#1B1F3B] px-3 py-2 text-xs font-bold disabled:opacity-50"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <p className="mt-5 text-xs leading-6 text-[#717082]">
                            New and unresolved high-priority incidents generate
                            alerts. Read status is linked to your operator account.
                        </p>
                    </section>
                ) : (
                    <section className="mt-7 space-y-5">
                        <form
                            onSubmit={sendInvite}
                            className="rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5] p-6"
                        >
                            <div className="flex items-center gap-3">
                                <UserPlus size={22} />
                                <h2 className="nx-display text-xl font-extrabold">
                                    Invite an operator
                                </h2>
                            </div>

                            <p className="mt-3 text-xs leading-6 text-[#717082]">
                                Only administrators can send invitations. An invited
                                user receives operator access after completing their
                                Supabase account activation.
                            </p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="invite-name"
                                        className="mb-2 block text-xs font-bold"
                                    >
                                        Display name
                                    </label>
                                    <input
                                        id="invite-name"
                                        className="nx-input"
                                        value={inviteName}
                                        maxLength={70}
                                        onChange={(event) =>
                                            setInviteName(event.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="invite-email"
                                        className="mb-2 block text-xs font-bold"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="invite-email"
                                        type="email"
                                        required
                                        className="nx-input"
                                        value={inviteEmail}
                                        onChange={(event) =>
                                            setInviteEmail(event.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                disabled={busy}
                                type="submit"
                                className="nx-button nx-button-ink mt-5 disabled:opacity-50"
                            >
                                <UserPlus size={17} />
                                Send invitation
                            </button>
                        </form>

                        <section className="rounded-[20px] border border-[#DCD4C5] bg-[#FFFCF5] p-6">
                            <div className="flex items-center gap-3">
                                <Users size={22} />
                                <h2 className="nx-display text-xl font-extrabold">
                                    Operators
                                </h2>
                            </div>

                            <div className="mt-5 space-y-3">
                                {team.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E1D9CA] bg-white p-4"
                                    >
                                        <div>
                                            <p className="text-sm font-extrabold">
                                                {person.displayName || person.email}
                                            </p>
                                            <p className="mt-1 text-xs text-[#707084]">
                                                {person.email}
                                            </p>
                                            <p className="mt-1 text-xs font-bold">
                                                {person.role} · {person.status}
                                            </p>
                                        </div>

                                        {person.id !== profile.id && (
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void perform(() =>
                                                            operatorApi.updateOperator(person.id, {
                                                                status:
                                                                    person.status === "ACTIVE"
                                                                        ? "SUSPENDED"
                                                                        : "ACTIVE",
                                                            })
                                                        )
                                                    }
                                                    className="rounded-full border border-[#1B1F3B] px-3 py-2 text-xs font-bold disabled:opacity-50"
                                                >
                                                    {person.status === "ACTIVE"
                                                        ? "Suspend"
                                                        : "Reactivate"}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        void perform(() =>
                                                            operatorApi.updateOperator(person.id, {
                                                                role:
                                                                    person.role === "ADMIN"
                                                                        ? "OPERATOR"
                                                                        : "ADMIN",
                                                            })
                                                        )
                                                    }
                                                    className="rounded-full border border-[#1B1F3B] px-3 py-2 text-xs font-bold disabled:opacity-50"
                                                >
                                                    {person.role === "ADMIN"
                                                        ? "Remove admin"
                                                        : "Make admin"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </section>
                )}
            </div>
        </main>
    );
}
