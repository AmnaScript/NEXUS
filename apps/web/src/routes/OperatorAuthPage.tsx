
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    KeyRound,
    LoaderCircle,
    ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { operatorApi } from "../lib/operatorApi";

type Mode = "activate" | "forgot" | "reset";

export default function OperatorAuthPage({
    mode,
}: {
    mode: Mode;
}) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [hasSession, setHasSession] = useState(false);
    const [checking, setChecking] = useState(mode !== "forgot");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (mode === "forgot") return;

        let active = true;

        async function checkSession() {
            const { data } = await supabase.auth.getSession();

            if (!active) return;

            setHasSession(Boolean(data.session));
            setChecking(false);
        }

        void checkSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!active) return;
                setHasSession(Boolean(session));
                setChecking(false);
            }
        );

        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, [mode]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        setBusy(true);
        setError("");
        setSuccess("");

        try {
            if (mode === "forgot") {
                const { error: authError } =
                    await supabase.auth.resetPasswordForEmail(email.trim(), {
                        redirectTo: `${window.location.origin}/reset-password`,
                    });

                if (authError) throw authError;

                setSuccess(
                    "If an account exists for that email, a recovery link will be sent."
                );

                return;
            }

            if (!hasSession) {
                throw new Error(
                    "No active invitation or recovery session. Open the link from your email again."
                );
            }

            if (password.length < 12) {
                throw new Error("Use a password with at least 12 characters.");
            }

            if (password !== confirm) {
                throw new Error("The passwords do not match.");
            }

            const { error: authError } =
                await supabase.auth.updateUser({ password });

            if (authError) throw authError;

            if (mode === "activate") {
                await operatorApi.me();
            }

            setSuccess("Your password has been saved.");
            navigate("/demo", { replace: true });
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to complete this request."
            );
        } finally {
            setBusy(false);
        }
    }

    const heading =
        mode === "activate"
            ? "Activate your account."
            : mode === "forgot"
                ? "Recover your access."
                : "Choose a new password.";

    return (
        <main className="flex min-h-[100dvh] items-center justify-center bg-[#FFF6E5] px-5 py-12 text-[#1B1F3B]">
            <div className="w-full max-w-[470px]">
                <Link
                    to="/"
                    className="nx-display text-3xl font-extrabold"
                >
                    nexus<span className="text-[#FF5A4E]">.</span>
                </Link>

                <section className="mt-8 rounded-[24px] border-2 border-[#1B1F3B] bg-[#FFFCF5] p-6 shadow-[5px_6px_0_#1B1F3B] sm:p-9">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC93C]">
                        {mode === "activate" ? (
                            <ShieldCheck size={24} />
                        ) : (
                            <KeyRound size={24} />
                        )}
                    </span>

                    <h1 className="nx-display mt-6 text-3xl font-extrabold">
                        {heading}
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#666579]">
                        {mode === "activate"
                            ? "You were invited to join NEXUS. Set a secure password to activate your operator login."
                            : mode === "forgot"
                                ? "Enter your operator email to receive a password recovery link."
                                : "Choose a new password for your existing operator account."}
                    </p>

                    {checking ? (
                        <div className="mt-7 flex items-center gap-3 text-sm">
                            <LoaderCircle className="animate-spin" size={18} />
                            Checking your session...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                            {mode === "forgot" ? (
                                <div>
                                    <label
                                        htmlFor="operator-recovery-email"
                                        className="mb-2 block text-sm font-bold"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        id="operator-recovery-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="nx-input"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                    />
                                </div>
                            ) : (
                                <>
                                    {!hasSession && (
                                        <p className="rounded-xl bg-[#FFE0DA] p-4 text-sm">
                                            No active session found. Reopen your invitation or
                                            recovery link.
                                        </p>
                                    )}

                                    <div>
                                        <label
                                            htmlFor="operator-password"
                                            className="mb-2 block text-sm font-bold"
                                        >
                                            New password
                                        </label>
                                        <input
                                            id="operator-password"
                                            type="password"
                                            required
                                            minLength={12}
                                            autoComplete="new-password"
                                            className="nx-input"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="operator-confirm-password"
                                            className="mb-2 block text-sm font-bold"
                                        >
                                            Confirm password
                                        </label>
                                        <input
                                            id="operator-confirm-password"
                                            type="password"
                                            required
                                            minLength={12}
                                            autoComplete="new-password"
                                            className="nx-input"
                                            value={confirm}
                                            onChange={(event) =>
                                                setConfirm(event.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-xl bg-[#FFE0DA] p-3 text-sm text-[#96332F]"
                                >
                                    {error}
                                </p>
                            )}

                            {success && (
                                <p
                                    role="status"
                                    className="rounded-xl bg-[#D9F3DF] p-3 text-sm"
                                >
                                    {success}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={busy || (mode !== "forgot" && !hasSession)}
                                className="nx-button nx-button-ink w-full justify-center disabled:opacity-50"
                            >
                                {busy && (
                                    <LoaderCircle size={16} className="animate-spin" />
                                )}

                                {mode === "forgot"
                                    ? "Send recovery link"
                                    : "Save password"}
                                <ArrowRight size={17} />
                            </button>
                        </form>
                    )}

                    <Link
                        to="/login"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
                    >
                        <ArrowLeft size={17} />
                        Back to login
                    </Link>
                </section>
            </div>
        </main>
    );
}
