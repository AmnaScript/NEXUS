
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/demo", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl border border-[#DFE4E0] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold tracking-[0.25em] text-[#217F79]">
          NEXUS / CITY OPERATIONS
        </p>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#142D2A]">
          Operator sign in
        </h1>

        <p className="mt-2 text-sm text-[#617078]">
          Access the city incident control room.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#142D2A]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#DFE4E0] px-4 py-3 outline-none focus:border-[#217F79]"
              placeholder="operator@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#142D2A]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#DFE4E0] px-4 py-3 outline-none focus:border-[#217F79]"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#217F79] px-5 py-3 font-semibold text-white transition hover:bg-[#196660] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in to control room"}
          </button>
        </form>
      </div>
    </main>
  );
}
