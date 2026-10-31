import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({
    children,
}: {
    children: ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        let active = true;

        supabase.auth.getUser().then(({ data, error }) => {
            if (!active) return;
            setAuthenticated(!error && !!data.user);
            setLoading(false);
        }).catch(() => {
            if (active) {
                setAuthenticated(false);
                setLoading(false);
            }
        });

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
                if (!active) return;
                if (!session) {
                    setAuthenticated(false);
                    setLoading(false);
                }
            });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Checking operator session...
            </div>
        );
    }

    return authenticated
        ? <>{children}</>
        : <Navigate to="/login" replace />;
}