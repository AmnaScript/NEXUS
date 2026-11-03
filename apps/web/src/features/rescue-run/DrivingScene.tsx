
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import CityWorld from "../city-world/CityWorld";
import Vehicle from "../vehicles/Vehicle";
import { checkTrafficCollision } from "../vehicles/trafficSimulation";

import {
  HOSPITAL,
  START,
  distance,
  isDrivable,
  type InputKey,
  type Position2,
} from "./gameConfig";

export type CameraMode = "chase" | "cockpit" | "overhead";

type InputState = Record<InputKey, boolean>;

export type DrivingData = {
  x: number;
  z: number;
  heading: number;
  speed: number;
  distanceToTarget: number;
  collision: boolean;
};

type Props = {
  inputs: RefObject<InputState>;
  running: boolean;
  target: Position2;
  resetId: number;
  siren: boolean;
  cameraMode: CameraMode;
  onTick: (dt: number, data: DrivingData) => void;
};

function TargetMarker({ target }: { target: Position2 }) {
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ring.current) return;

    const p = clock.elapsedTime * 2.8;
    ring.current.rotation.y = p;
    ring.current.position.y = 0.65 + Math.sin(p) * 0.14;
  });

  return (
    <group position={[target.x, 0, target.z]}>
      <mesh
        position={[0, 0.09, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.9, 1.12, 40]} />
        <meshBasicMaterial
          color="#FF5A4E"
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>

      <mesh ref={ring} position={[0, 0.65, 0]}>
        <torusGeometry args={[0.65, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#FFC93C"
          emissive="#FFC93C"
          emissiveIntensity={1.5}
        />
      </mesh>

      <mesh position={[0, 2.35, 0]}>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial
          color="#FF5A4E"
          emissive="#FF5A4E"
          emissiveIntensity={0.7}
        />
      </mesh>
    </group>
  );
}

function Driver({
  inputs,
  running,
  target,
  resetId,
  siren,
  cameraMode,
  onTick,
}: Props) {
  const vehicle = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const driving = useRef({
    x: START.x,
    z: START.z,
    yaw: Math.PI,
    speed: 0,
  });

  const playerTrafficRef = useRef({
    x: START.x,
    z: START.z,
    siren: false,
  });

  const cameraPosition = useRef(
    new THREE.Vector3(START.x, 10, START.z + 9)
  );

  const cameraTarget = useRef(
    new THREE.Vector3(START.x, 1.1, START.z)
  );

  const raycaster = useRef(new THREE.Raycaster());
  const collisionLatch = useRef(false);
  const desired = useRef(new THREE.Vector3());
  const focus = useRef(new THREE.Vector3());
  const rayDirection = useRef(new THREE.Vector3());

  useEffect(() => {
    driving.current = {
      x: START.x,
      z: START.z,
      yaw: Math.PI,
      speed: 0,
    };

    cameraPosition.current.set(
      START.x,
      10,
      START.z + 9
    );

    cameraTarget.current.set(
      START.x,
      1.1,
      START.z
    );

    collisionLatch.current = false;

    playerTrafficRef.current.x = START.x;
    playerTrafficRef.current.z = START.z;
    playerTrafficRef.current.siren = false;
  }, [resetId]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.045);
    const state = driving.current;
    let collision = false;

    if (running) {
      const keys = inputs.current;

      const throttle =
        Number(Boolean(keys?.forward)) -
        Number(Boolean(keys?.back));

      const steering =
        Number(Boolean(keys?.left)) -
        Number(Boolean(keys?.right));

      if (throttle !== 0) {
        const acceleration =
          throttle > 0 ? 6.2 : 8.0;

        state.speed +=
          throttle * acceleration * dt;
      } else {
        state.speed *= Math.exp(-1.85 * dt);
      }

      if (keys?.brake) {
        state.speed *= Math.exp(-9.5 * dt);
      }

      state.speed = THREE.MathUtils.clamp(
        state.speed,
        -3.2,
        9.5
      );

      if (Math.abs(state.speed) < 0.025) {
        state.speed = 0;
      }

      const steerStrength = THREE.MathUtils.clamp(
        Math.abs(state.speed) / 3.6,
        0,
        1
      );

      const reverseFactor =
        state.speed >= 0 ? 1 : -1;

      state.yaw +=
        steering *
        reverseFactor *
        steerStrength *
        1.72 *
        dt;

      const nextX =
        state.x +
        Math.sin(state.yaw) * state.speed * dt;

      const nextZ =
        state.z +
        Math.cos(state.yaw) * state.speed * dt;

      const roadAllowed = isDrivable(nextX, nextZ);

      const hitVehicle = checkTrafficCollision(
        nextX,
        nextZ,
        0.38
      );

      if (roadAllowed && !hitVehicle) {
        state.x = nextX;
        state.z = nextZ;
        collisionLatch.current = false;
      } else {
        // Small rebound and loss of momentum.
        state.speed = -state.speed * 0.14;

        collision = !collisionLatch.current;
        collisionLatch.current = true;
      }
    }

    playerTrafficRef.current.x = state.x;
    playerTrafficRef.current.z = state.z;
    playerTrafficRef.current.siren = running && siren;

    if (vehicle.current) {
      vehicle.current.position.set(
        state.x,
        0.11,
        state.z
      );

      vehicle.current.rotation.y = state.yaw;
      vehicle.current.visible = cameraMode !== "cockpit";
    }

    const forwardX = Math.sin(state.yaw);
    const forwardZ = Math.cos(state.yaw);

    const targetPoint = focus.current;
    const wanted = desired.current;

    if (cameraMode === "cockpit") {
      wanted.set(
        state.x + forwardX * 0.54,
        1.25,
        state.z + forwardZ * 0.54
      );

      targetPoint.set(
        state.x + forwardX * 12,
        1.2,
        state.z + forwardZ * 12
      );

      cameraPosition.current.lerp(
        wanted,
        1 - Math.exp(-14 * dt)
      );

      cameraTarget.current.lerp(
        targetPoint,
        1 - Math.exp(-14 * dt)
      );
    } else if (cameraMode === "overhead") {
      wanted.set(state.x, 24, state.z + 0.01);
      targetPoint.set(state.x, 0, state.z);

      cameraPosition.current.lerp(
        wanted,
        1 - Math.exp(-6 * dt)
      );

      cameraTarget.current.lerp(
        targetPoint,
        1 - Math.exp(-7 * dt)
      );
    } else {
      const anchor = targetPoint.set(
        state.x,
        1.5,
        state.z
      );

      wanted.set(
        state.x - forwardX * 3.7,
        3.8,
        state.z - forwardZ * 3.7
      );

      const direction = rayDirection.current
        .copy(wanted)
        .sub(anchor);

      const fullDistance = direction.length();

      direction.normalize();

      if (world.current) {
        raycaster.current.set(anchor, direction);
        raycaster.current.far = fullDistance;

        const hits =
          raycaster.current.intersectObjects(
            world.current.children,
            true
          );

        const blocker = hits.find(
          (hit) =>
            hit.distance > 0.65 &&
            hit.point.y > 1.9 &&
            hit.object instanceof THREE.Mesh &&
            hit.object.geometry?.type !== "PlaneGeometry"
        );

        if (blocker) {
          wanted.copy(anchor).addScaledVector(
            direction,
            Math.max(0.7, blocker.distance - 0.45)
          );
        }
      }

      cameraPosition.current.lerp(
        wanted,
        1 - Math.exp(-8 * dt)
      );

      cameraTarget.current.lerp(
        anchor,
        1 - Math.exp(-10 * dt)
      );
    }

    camera.position.copy(cameraPosition.current);
    camera.lookAt(cameraTarget.current);

    if (running) {
      onTick(dt, {
        x: state.x,
        z: state.z,
        heading: state.yaw,
        speed: Math.abs(state.speed),
        distanceToTarget: distance(state, target),
        collision,
      });
    }
  });

  return (
    <>
      <group ref={world}>
        <CityWorld
          showTraffic
          trafficPaused={!running}
          playerRef={playerTrafficRef}
        />
      </group>

      <group
        ref={vehicle}
        position={[START.x, 0.11, START.z]}
      >
        <Vehicle
          kind="ambulance"
          sirenOn={siren}
          lightsOn
        />
      </group>

      <TargetMarker target={target} />

      <mesh
        position={[HOSPITAL.x, 0.045, HOSPITAL.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.3, 1.4, 48]} />
        <meshBasicMaterial
          color="#2EC4B6"
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

export default function DrivingScene(props: Props) {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 10, 14],
        fov: 65,
        near: 0.07,
        far: 170,
      }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <Driver {...props} />
    </Canvas>
  );
}
