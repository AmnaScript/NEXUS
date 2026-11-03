
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CirclePause,
  CirclePlay,
  Flag,
  Map,
  RotateCcw,
  Siren,
  Volume2,
  VolumeX,
} from "lucide-react";

import DrivingScene from "../features/rescue-run/DrivingScene";
import type {
  CameraMode,
  DrivingData,
} from "../features/rescue-run/DrivingScene";
import MiniMap from "../features/rescue-run/MiniMap";

import {
  HOSPITAL,
  KEY_MAP,
  PICKUPS,
  TOTAL_MISSIONS,
  START,
  distance,
  type GameMode,
  type InputKey,
  type MissionStage,
} from "../features/rescue-run/gameConfig";

import {
  createGameIncident,
  updateGameIncident,
} from "../features/rescue-run/gameIncidentBridge";

type Inputs = Record<InputKey, boolean>;

const EMPTY_INPUTS: Inputs = {
  forward: false,
  back: false,
  left: false,
  right: false,
  brake: false,
};

const BEST_KEY = "nexus-rescue-best-v1";
const MISSION_SECONDS = 95;

function playTone(frequency: number, duration = 0.16) {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);

    oscillator.onended = () => {
      void ctx.close();
    };
  } catch {
    // Sound is optional.
  }
}

function TouchButton({
  label,
  action,
  inputs,
  children,
}: {
  label: string;
  action: InputKey;
  inputs: RefObject<Inputs>;
  children: ReactNode;
}) {
  const setInput = (pressed: boolean) => {
    if (inputs.current) {
      inputs.current[action] = pressed;
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setInput(true);
      }}
      onPointerUp={() => setInput(false)}
      onPointerCancel={() => setInput(false)}
      onLostPointerCapture={() => setInput(false)}
      onContextMenu={(event) => event.preventDefault()}
      className="flex h-14 w-14 touch-none select-none items-center justify-center rounded-2xl border-2 border-white/30 bg-[#1B1F3B]/85 text-white active:bg-[#FF5A4E]"
    >
      {children}
    </button>
  );
}

function loadBestScore(): number {
  try {
    return Math.max(
      0,
      Number(localStorage.getItem(BEST_KEY)) || 0
    );
  } catch {
    return 0;
  }
}

function newRunId(): string {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

export default function PlayPage() {
  const inputs = useRef<Inputs>({ ...EMPTY_INPUTS });
  const currentIncidentId = useRef<string | null>(null);

  const gameRef = useRef({
    mode: "menu" as GameMode,
    stage: "pickup" as MissionStage,
    mission: 0,
    remaining: MISSION_SECONDS,
    score: 0,
    combo: 0,
    lastCollision: MISSION_SECONDS + 10,
    hudAccumulator: 0,
    runId: "",
  });

  const [mode, setMode] = useState<GameMode>("menu");
  const [stage, setStage] = useState<MissionStage>("pickup");
  const [mission, setMission] = useState(0);
  const [remaining, setRemaining] = useState(MISSION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [player, setPlayer] = useState({ ...START });
  const [cameraMode, setCameraMode] =
    useState<CameraMode>("chase");
  const [showMap, setShowMap] = useState(true);
  const [targetDistance, setTargetDistance] = useState(0);
  const [resetId, setResetId] = useState(0);
  const [muted, setMuted] = useState(true);
  const [siren, setSiren] = useState(false);
  const [best, setBest] = useState(loadBestScore);

  function resetControls() {
    Object.assign(inputs.current, EMPTY_INPUTS);
  }

  function updateMode(next: GameMode) {
    gameRef.current.mode = next;
    setMode(next);
  }

  function openMissionIncident(index: number, runId: string) {
    currentIncidentId.current = createGameIncident(
      runId,
      index + 1,
      PICKUPS[index]
    );
  }

  function start() {
    const runId = newRunId();

    gameRef.current = {
      mode: "playing",
      stage: "pickup",
      mission: 0,
      remaining: MISSION_SECONDS,
      score: 0,
      combo: 0,
      lastCollision: MISSION_SECONDS + 10,
      hudAccumulator: 0,
      runId,
    };

    openMissionIncident(0, runId);
    resetControls();

    setStage("pickup");
    setMission(0);
    setRemaining(MISSION_SECONDS);
    setScore(0);
    setCombo(0);
    setSpeed(0);
    setHeading(0);
    setPlayer({ ...START });
    setTargetDistance(distance(START, PICKUPS[0]));
    setResetId((value) => value + 1);
    setMode("playing");
  }

  function pause() {
    if (gameRef.current.mode !== "playing") return;
    resetControls();
    updateMode("paused");
  }

  function resume() {
    if (gameRef.current.mode === "paused") {
      updateMode("playing");
    }
  }

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      const action = KEY_MAP[event.key.toLowerCase()];

      if (action && gameRef.current.mode === "playing") {
        event.preventDefault();
        inputs.current[action] = true;
      }

      if (event.key === "Escape") {
        if (gameRef.current.mode === "playing") {
          Object.assign(inputs.current, EMPTY_INPUTS);
          gameRef.current.mode = "paused";
          setMode("paused");
        } else if (gameRef.current.mode === "paused") {
          gameRef.current.mode = "playing";
          setMode("playing");
        }
      }
    };

    const onUp = (event: KeyboardEvent) => {
      const action = KEY_MAP[event.key.toLowerCase()];

      if (action) {
        event.preventDefault();
        inputs.current[action] = false;
      }
    };

    const onBlur = () => {
      Object.assign(inputs.current, EMPTY_INPUTS);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const onTick = useCallback(
    (dt: number, data: DrivingData) => {
      const game = gameRef.current;
      if (game.mode !== "playing") return;

      game.remaining -= dt;

      if (game.remaining <= 0) {
        game.remaining = 0;
        game.mode = "gameover";

        setRemaining(0);
        setMode("gameover");
        return;
      }

      if (
        data.collision &&
        game.lastCollision - game.remaining > 0.65
      ) {
        game.combo = 0;
        game.score = Math.max(0, game.score - 40);
        game.lastCollision = game.remaining;

        setCombo(0);
        setScore(game.score);
      }

      const currentTarget =
        game.stage === "pickup"
          ? PICKUPS[game.mission]
          : HOSPITAL;

      if (
        distance(data, currentTarget) < 1.4 &&
        data.speed < 4.5
      ) {
        if (game.stage === "pickup") {
          game.stage = "hospital";
          setStage("hospital");

          if (currentIncidentId.current) {
            updateGameIncident(
              currentIncidentId.current,
              "Under Review"
            );
          }

          if (!muted) playTone(680);
        } else {
          if (currentIncidentId.current) {
            updateGameIncident(
              currentIncidentId.current,
              "Resolved"
            );
          }

          game.combo += 1;

          const earned =
            200 +
            Math.floor(game.remaining * 3) +
            game.combo * 60;

          game.score += earned;

          setScore(game.score);
          setCombo(game.combo);

          if (!muted) playTone(880);

          if (game.mission + 1 >= TOTAL_MISSIONS) {
            game.mode = "result";
            setMode("result");

            setBest((previous) => {
              const next = Math.max(previous, game.score);

              try {
                localStorage.setItem(
                  BEST_KEY,
                  String(next)
                );
              } catch {
                // Storage may be disabled.
              }

              return next;
            });
          } else {
            game.mission += 1;
            game.stage = "pickup";
            game.remaining = Math.min(
              115,
              game.remaining + 70
            );

            openMissionIncident(
              game.mission,
              game.runId
            );

            setMission(game.mission);
            setStage("pickup");
          }
        }
      }

      game.hudAccumulator += dt;

      if (game.hudAccumulator >= 0.12) {
        game.hudAccumulator = 0;

        setRemaining(game.remaining);
        setSpeed(data.speed);
        setHeading(data.heading);
        setTargetDistance(
          distance(
            data,
            game.stage === "pickup"
              ? PICKUPS[game.mission]
              : HOSPITAL
          )
        );

        setPlayer({
          x: data.x,
          z: data.z,
        });
      }
    },
    [muted]
  );

  const target =
    stage === "pickup"
      ? PICKUPS[mission]
      : HOSPITAL;

  return (
    <main className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-[#FFF6E5] text-[#1B1F3B]">
      <div className="absolute inset-0">
        <DrivingScene
          inputs={inputs}
          running={mode === "playing"}
          target={target}
          resetId={resetId}
          siren={siren}
          cameraMode={cameraMode}
          onTick={onTick}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-52 bg-gradient-to-b from-[#FFF6E5]/90 to-transparent" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 p-4 sm:p-6">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#1B1F3B] bg-[#FFF6E5] px-4 py-2 text-xs font-bold"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className="pointer-events-auto rounded-full border border-[#1B1F3B] bg-[#FFC93C] px-4 py-2 font-display text-sm font-extrabold">
          NEXUS / RESCUE RUN
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "Enable sound" : "Mute sound"}
            className="pointer-events-auto rounded-full border border-[#1B1F3B] bg-white p-2.5"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setSiren((value) => !value)}
            aria-label="Toggle emergency lights"
            aria-pressed={siren}
            className={`pointer-events-auto rounded-full border border-[#1B1F3B] p-2.5 ${siren ? "bg-[#FF5A4E]" : "bg-white"
              }`}
          >
            <Siren size={18} />
          </button>

          <button
            type="button"
            onClick={() =>
              setCameraMode((previous) =>
                previous === "chase"
                  ? "cockpit"
                  : previous === "cockpit"
                    ? "overhead"
                    : "chase"
              )
            }
            aria-label={`Switch camera. Current view: ${cameraMode}`}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#1B1F3B] bg-white px-3 py-2.5 text-xs font-bold"
          >
            <Camera size={18} />
            <span className="hidden sm:inline">
              {cameraMode.toUpperCase()}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowMap((value) => !value)}
            aria-label={showMap ? "Hide map" : "Show map"}
            aria-pressed={showMap}
            className={`pointer-events-auto rounded-full border border-[#1B1F3B] p-2.5 ${showMap ? "bg-[#FFC93C]" : "bg-white"
              }`}
          >
            <Map size={18} />
          </button>

          <button
            type="button"
            onClick={pause}
            disabled={mode !== "playing"}
            aria-label="Pause"
            className="pointer-events-auto rounded-full border border-[#1B1F3B] bg-white p-2.5 disabled:opacity-50"
          >
            <CirclePause size={18} />
          </button>
        </div>
      </header>

      {mode === "playing" && (
        <>
          <section className="pointer-events-none absolute left-4 top-20 z-20 max-w-[min(75vw,310px)] rounded-2xl border-2 border-[#1B1F3B] bg-[#FFFDF7]/95 p-4 shadow-[4px_4px_0_#1B1F3B] sm:left-6 sm:top-24">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider">
              MISSION {mission + 1} OF {TOTAL_MISSIONS}
            </p>

            <h1 className="mt-1 font-display text-xl font-extrabold">
              {stage === "pickup"
                ? "Reach the patient"
                : "Return to hospital"}
            </h1>

            <p className="mt-1 text-xs">
              {stage === "pickup"
                ? "Follow the map and slow down at the marker."
                : "Deliver the patient to the hospital."}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
              <span>⏱ {Math.ceil(remaining)}s</span>
              <span>↗ {Math.round(targetDistance)}m</span>
              <span>★ {score}</span>
            </div>

            <p className="mt-2 text-[10px] font-semibold text-[#4D7168]">
              Mission incident synchronized with demo
            </p>
          </section>

          <div className="pointer-events-none absolute right-4 top-24 z-20 flex flex-col items-end gap-3 sm:right-6">
            {showMap && (
              <div className="pointer-events-auto">
                <MiniMap
                  player={player}
                  target={target}
                  heading={heading}
                />
              </div>
            )}

            <div className="rounded-2xl border border-[#1B1F3B] bg-[#FFF6E5]/95 px-4 py-2.5 text-center">
              <div className="font-display text-2xl font-extrabold">
                {Math.round(speed * 12)}
                <span className="text-[10px]"> KM/H</span>
              </div>
              <div className="text-[10px] font-bold">
                {cameraMode.toUpperCase()} VIEW
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="pointer-events-auto grid grid-cols-3 gap-1.5">
              <div />
              <TouchButton label="Accelerate" action="forward" inputs={inputs}>
                <ArrowUp />
              </TouchButton>
              <div />
              <TouchButton label="Turn left" action="left" inputs={inputs}>
                <ArrowLeft />
              </TouchButton>
              <TouchButton label="Reverse" action="back" inputs={inputs}>
                <ArrowDown />
              </TouchButton>
              <TouchButton label="Turn right" action="right" inputs={inputs}>
                <ArrowRight />
              </TouchButton>
            </div>

            <div className="pointer-events-auto flex flex-col items-end gap-2">
              <span className="rounded-xl bg-[#1B1F3B]/85 px-3 py-2 text-xs font-bold text-white">
                COMBO ×{combo + 1}
              </span>

              <TouchButton label="Handbrake" action="brake" inputs={inputs}>
                <span className="text-[10px] font-extrabold">BRAKE</span>
              </TouchButton>
            </div>
          </div>
        </>
      )}

      {mode !== "playing" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1B1F3B]/65 p-5">
          <section className="w-full max-w-lg rounded-[26px] border-2 border-[#1B1F3B] bg-[#FFF6E5] p-7 text-center shadow-[7px_8px_0_#1B1F3B] sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FFC93C] px-4 py-2 text-[11px] font-bold">
              {mode === "result" ? <Flag size={17} /> : <Siren size={17} />}
              NEXUS / RESCUE RUN
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold sm:text-5xl">
              {mode === "menu"
                ? "Your city needs you."
                : mode === "paused"
                  ? "Mission paused."
                  : mode === "result"
                    ? "Mission complete!"
                    : "Time's up."}
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#626276]">
              {mode === "menu"
                ? "Find the patients, drive them to the hospital, and complete each rescue before time runs out."
                : mode === "paused"
                  ? "Your timer is stopped."
                  : mode === "result"
                    ? `You completed ${TOTAL_MISSIONS} missions. Score: ${score}. Personal best: ${best}.`
                    : `You earned ${score} points. Your unfinished incident remains open in the demo.`}
            </p>

            {mode === "menu" && (
              <p className="mt-5 rounded-xl bg-[#E6F3E9] p-4 text-left text-xs leading-6">
                Use WASD or arrow keys to drive, Space to brake,
                and Esc to pause. Follow the minimap to your
                destination. Change cameras whenever you like.
                Missions are stored as fictional incidents in
                this browser's public demo.
              </p>
            )}

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {mode === "paused" && (
                <button
                  type="button"
                  onClick={resume}
                  className="nx-button nx-button-yellow"
                >
                  <CirclePlay size={19} />
                  Resume
                </button>
              )}

              <button
                type="button"
                onClick={start}
                className="nx-button nx-button-ink"
              >
                {mode === "menu"
                  ? <CirclePlay size={19} />
                  : <RotateCcw size={19} />}
                {mode === "menu" ? "Start rescue" : "Restart"}
              </button>

              <Link to="/preview" className="nx-button nx-button-paper">
                View incidents
              </Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
