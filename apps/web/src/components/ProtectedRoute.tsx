
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { supabase } from "../lib/supabase";
import { operatorApi } from "../lib/operatorApi";
import RouteLoading from "./RouteLoading";

type AccessState = "checking" | "allowed" | "login" | "denied" | "error";

export default function ProtectedRoute({
    children,
}: {
    children: ReactNode;
}) {
    const [state, setState] = useState<AccessState>("checking");

    useEffect(() => {
        let active = true;

        async function verify() {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (!active) return;

                if (error || !data.session) {
                    setState("login");
                    return;
                }

                try {
                    await operatorApi.me();
                    if (active) setState("allowed");
                } catch (cause) {
                    if (!active) return;

                    if (
                        cause instanceof Error &&
                        (
                            cause.message.includes("operator access") ||
                            cause.message.includes("Administrator access") ||
                            cause.message.includes("403")
                        )
                    ) {
                        setState("denied");
                    } else {
                        setState("error");
                    }
                }
            } catch {
                if (active) setState("error");
            }
        }

        void verify();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (event) => {
                if (!active) return;

                if (event === "SIGNED_OUT") {
                    setState("login");
                }
            }
        );

        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    if (state === "checking") {
        return <RouteLoading />;
    }

    if (state === "login") {
        return <Navigate to="/login" replace />;
    }

    if (state === "allowed") {
        return <>{children}</>;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FFF6E5] px-5 text-[#1B1F3B]">
            <section className="w-full max-w-lg rounded-[22px] border-2 border-[#1B1F3B] bg-[#FFFCF5] p-8">
                <ShieldAlert size={37} className="text-[#FF5A4E]" />

                <h1 className="nx-display mt-5 text-3xl font-extrabold">
                    {state === "denied"
                        ? "Operator access required."
                        : "Unable to verify access."}
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#686778]">
                    {state === "denied"
                        ? "Your Supabase account is signed in, but it does not have active operator permission."
                        : "NEXUS could not reach the authorization service. Try reloading when the API is available."}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="nx-button nx-button-ink"
                        onClick={() => window.location.reload()}
                    >
                        Retry verification
                    </button>

                    <Link to="/" className="nx-button nx-button-paper">
                        Home
                    </Link>

                    <button
                        type="button"
                        className="nx-button nx-button-paper"
                        onClick={() =>
                            void supabase.auth.signOut().then(() => {
                                window.location.assign("/login");
                            })
                        }
                    >
                        Sign out
                    </button>
                </div>
            </section>
        </main>
    );
}
