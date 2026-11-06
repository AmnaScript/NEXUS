
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function LoginArtwork() {
  return (
    <svg
      viewBox="0 0 540 430"
      aria-hidden="true"
      className="h-auto w-full"
    >
      <g transform="translate(270 210) scale(1 .66) rotate(-45)">
        {/* Ground */}
        <rect
          x="-205"
          y="-175"
          width="410"
          height="350"
          rx="17"
          fill="#B5E3D3"
          stroke="#1B1F3B"
          strokeWidth="5"
        />

        {/* Streets */}
        <rect x="-21" y="-174" width="42" height="349" fill="#536B79" />
        <rect x="-205" y="-17" width="410" height="37" fill="#536B79" />

        {[-145, -86, 75, 137].map((y) => (
          <rect key={y} x="-2" y={y} width="4" height="23" rx="2" fill="#FFF6E5" />
        ))}

        {[-155, -92, 84, 148].map((x) => (
          <rect key={x} x={x} y="-1" width="26" height="3" rx="2" fill="#FFF6E5" />
        ))}

        {/* Park */}
        <rect x="-188" y="-155" width="148" height="119" rx="10" fill="#85CC82" />
        <path
          d="M-178 -52 C-129 -67 -138 -128 -59 -139"
          fill="none"
          stroke="#FDF1C9"
          strokeWidth="13"
        />

        {[
          [-163, -129],
          [-115, -140],
          [-85, -81],
          [-153, -77],
          [162, 125],
          [100, 141],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="18" fill="#257E54" />
            <circle cx={x - 5} cy={y - 5} r="14" fill="#3DBE7A" />
          </g>
        ))}

        {/* Building block */}
        <rect x="47" y="-146" width="135" height="105" rx="7" fill="#F8E1C7" />
        <rect x="66" y="-135" width="44" height="74" rx="4" fill="#FF8F7A" />
        <rect x="121" y="-135" width="43" height="74" rx="4" fill="#FFC93C" />

        <rect x="-184" y="44" width="141" height="105" rx="7" fill="#FDE5BA" />
        <rect x="-168" y="57" width="112" height="80" rx="4" fill="#FF8F7A" />

        <rect x="48" y="46" width="131" height="105" rx="7" fill="#D3E6EB" />
        <rect x="65" y="64" width="52" height="73" rx="4" fill="#2E9DB0" />
        <rect x="126" y="64" width="36" height="73" rx="4" fill="#FFC93C" />

        {/* Windows */}
        {Array.from({ length: 3 }, (_, row) =>
          Array.from({ length: 3 }, (_, col) => (
            <g key={`${row}-${col}`}>
              <rect
                x={-158 + col * 31}
                y={67 + row * 23}
                width="16"
                height="11"
                rx="2"
                fill="#FFEDE0"
              />
              <rect
                x={73 + col * 27}
                y={73 + row * 20}
                width="14"
                height="10"
                rx="2"
                fill="#C9F3EC"
              />
            </g>
          ))
        )}

        {/* Site marker */}
        <circle cx="0" cy="0" r="32" fill="#FF5A4E" opacity=".2" />
        <circle cx="0" cy="0" r="20" fill="#FF5A4E" stroke="#FFFDF7" strokeWidth="5" />
        <circle cx="0" cy="0" r="6" fill="#FFFDF7" />
      </g>

      {/* Floating callouts */}
      <g>
        <rect
          x="30"
          y="46"
          width="160"
          height="48"
          rx="12"
          fill="#FFFDF7"
          stroke="#1B1F3B"
          strokeWidth="2"
        />
        <circle cx="52" cy="70" r="7" fill="#3DBE7A" />
        <text x="69" y="74" fontSize="12" fontWeight="700" fill="#1B1F3B">
          City connected
        </text>

        <rect
          x="338"
          y="319"
          width="171"
          height="52"
          rx="12"
          fill="#FFC93C"
          stroke="#1B1F3B"
          strokeWidth="2"
        />
        <circle cx="361" cy="345" r="9" fill="#FF5A4E" />
        <text x="379" y="349" fontSize="12" fontWeight="700" fill="#1B1F3B">
          Incident response
        </text>
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) throw authError;

      navigate("/demo", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't sign you in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#FFF6E5] text-[#1B1F3B] lg:grid-cols-[1.03fr_0.97fr]">
      {/* Illustration panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r-2 border-[#1B1F3B] bg-[#2EC4B6] px-9 py-8 lg:flex xl:px-14">
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="nx-display text-3xl font-extrabold">
            nexus<span className="text-[#FFF6E5]">.</span>
          </Link>

          <span className="border-2 border-[#1B1F3B] bg-[#FFC93C] px-3 py-1.5 font-mono text-[10px] font-bold">
            OPERATOR ACCESS
          </span>
        </div>

        {/* Decorative type */}
        <div className="relative z-10 mt-12">
          <p className="nx-eyebrow">
            BEHIND EVERY RESPONSE
          </p>

          <h1 className="nx-display mt-5 max-w-[650px] text-[clamp(3.5rem,5.4vw,6.8rem)] font-extrabold leading-[0.96]">
            Good decisions
            <br />
            start with a
            <br />
            <span className="text-[#FFF6E5]">clear view.</span>
          </h1>

          <p className="mt-6 max-w-[420px] text-base leading-8">
            One place to understand incidents, coordinate
            responses, and keep the bigger picture in sight.
          </p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[590px]">
          <LoginArtwork />
        </div>

        <div className="relative z-10 flex items-center justify-between border-t-2 border-[#1B1F3B] pt-5 text-xs font-bold">
          <span>NEXUS / CITY OPERATIONS</span>
          <span>SIMULATED ENVIRONMENT</span>
        </div>

        <div className="pointer-events-none absolute -bottom-40 -left-36 h-[440px] w-[440px] rounded-full border-[54px] border-[#FFC93C]/45" />
      </section>

      {/* Sign-in panel */}
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-9 xl:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            to="/"
            className="nx-display text-3xl font-extrabold lg:hidden"
          >
            nexus<span className="text-[#FF5A4E]">.</span>
          </Link>

          <Link
            to="/"
            className="nx-link inline-flex items-center gap-2 text-xs font-bold transition hover:text-[#D94B43]"
          >
            <ArrowLeft size={16} />
            Back to website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-14">
          <div className="w-full max-w-[420px]">
            <div className="mb-9 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#1B1F3B] bg-[#FFC93C]">
                <LockKeyhole size={23} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#D44D42]">
                  Restricted workspace
                </p>
                <p className="mt-1 text-xs text-[#67677A]">
                  For authorized operators
                </p>
              </div>
            </div>

            <h2 className="nx-display text-[clamp(2.8rem,5vw,4.4rem)] font-extrabold leading-[0.98]">
              Welcome
              <br />
              <span className="text-[#E74E44]">back.</span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#616173]">
              Sign in to access incident records and the operator
              Control Room.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-6"
            >
              <div>
                <label
                  htmlFor="nexus-email"
                  className="mb-2 block text-sm font-bold"
                >
                  Email address
                </label>

                <input
                  id="nexus-email"
                  className="nx-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="operator@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="nexus-password"
                  className="mb-2 block text-sm font-bold"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="nexus-password"
                    className="nx-input pr-14"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="nx-icon-button absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#65687B] hover:bg-[#F2E8D7]"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#D64D43] underline"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-[#E9A7A1] bg-[#FFE3DC] px-4 py-3 text-sm leading-6 text-[#852F31]"
                >
                  <Radio size={18} className="mt-1 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="nx-button nx-button-ink w-full justify-between"
              >
                {loading ? "Signing in..." : "Enter Control Room"}
                <ArrowRight size={19} />
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 border-t border-[#DCD5C5] pt-6">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#278A5B]"
              />
              <p className="text-xs leading-6 text-[#6E6D7E]">
                This area requires an approved operator account.
                Want to explore without signing in?{" "}
                <Link
                  to="/preview"
                  className="font-bold text-[#1B1F3B] underline underline-offset-4 hover:text-[#D84F45]"
                >
                  Open the public demo.
                </Link>
              </p>
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#DDD6C7] pt-5 text-[11px] text-[#737285]">
          <span>© {new Date().getFullYear()} NEXUS</span>
          <div className="flex items-center gap-2">
            <MapPin size={13} />
            <span>City operations · Demo environment</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
