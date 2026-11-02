
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import CityWorld from "../city-world/CityWorld";
import Vehicle from "../vehicles/Vehicle";

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

  const cameraPosition = useRef(
    new THREE.Vector3(START.x, 11, START.z + 10)
  );

  const cameraTarget = useRef(
    new THREE.Vector3(START.x, 1, START.z)
  );

  const raycaster = useRef(new THREE.Raycaster());
  const nearCollision = useRef(false);

  const ideal = useRef(new THREE.Vector3());
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
      11,
      START.z + 10
    );

    cameraTarget.current.set(
      START.x,
      1,
      START.z
    );

    nearCollision.current = false;
  }, [resetId]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.045);
    const state = driving.current;

    let collision = false;

    // Driving physics
    if (running) {
      const keys = inputs.current;

      const throttle =
        Number(Boolean(keys?.forward)) -
        Number(Boolean(keys?.back));

      const steering =
        Number(Boolean(keys?.left)) -
        Number(Boolean(keys?.right));

      if (throttle !== 0) {
        state.speed +=
          throttle *
          (throttle > 0 ? 6.5 : 8.5) *
          dt;
      } else {
        state.speed *= Math.exp(-1.75 * dt);
      }

      if (keys?.brake) {
        state.speed *= Math.exp(-8 * dt);
      }

      state.speed = THREE.MathUtils.clamp(
        state.speed,
        -3.5,
        10.2
      );

      const steerStrength = Math.min(
        Math.abs(state.speed) / 3.8,
        1
      );

      state.yaw +=
        steering *
        steerStrength *
        (state.speed >= 0 ? 1 : -1) *
        1.65 *
        dt;

      const nextX =
        state.x +
        Math.sin(state.yaw) * state.speed * dt;

      const nextZ =
        state.z +
        Math.cos(state.yaw) * state.speed * dt;

      if (isDrivable(nextX, nextZ)) {
        state.x = nextX;
        state.z = nextZ;
        nearCollision.current = false;
      } else {
        state.speed *= -0.22;

        collision = !nearCollision.current;
        nearCollision.current = true;
      }
    }

    // Update ambulance position
    if (vehicle.current) {
      vehicle.current.position.set(
        state.x,
        0.11,
        state.z
      );

      vehicle.current.rotation.y = state.yaw;

      // Hide vehicle mesh in cockpit mode.
      vehicle.current.visible =
        cameraMode !== "cockpit";
    }

    const forwardX = Math.sin(state.yaw);
    const forwardZ = Math.cos(state.yaw);

    const focusPoint = focus.current;
    const desired = ideal.current;

    // CAMERA 1: COCKPIT
    if (cameraMode === "cockpit") {
      desired.set(
        state.x + forwardX * 0.52,
        1.23,
        state.z + forwardZ * 0.52
      );

      focusPoint.set(
        state.x + forwardX * 12,
        1.16,
        state.z + forwardZ * 12
      );

      cameraPosition.current.lerp(
        desired,
        1 - Math.exp(-14 * dt)
      );

      cameraTarget.current.lerp(
        focusPoint,
        1 - Math.exp(-13 * dt)
      );
    }

    // CAMERA 2: OVERHEAD
    else if (cameraMode === "overhead") {
      desired.set(
        state.x,
        22,
        state.z + 0.01
      );

      focusPoint.set(
        state.x,
        0,
        state.z
      );

      cameraPosition.current.lerp(
        desired,
        1 - Math.exp(-6 * dt)
      );

      cameraTarget.current.lerp(
        focusPoint,
        1 - Math.exp(-7 * dt)
      );
    }

    // CAMERA 3: CHASE
    else {
      const anchor = focusPoint.set(
        state.x,
        1.45,
        state.z
      );

      desired.set(
        state.x - forwardX * 4.2,
        4.25,
        state.z - forwardZ * 4.2
      );

      const direction = rayDirection.current
        .copy(desired)
        .sub(anchor);

      const fullDistance = direction.length();
      direction.normalize();

      // Pull camera closer if tall geometry obstructs it.
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
            hit.distance > 0.7 &&
            hit.point.y > 2 &&
            hit.object.type === "Mesh" &&
            !(
              hit.object as THREE.Mesh
            ).geometry?.type?.includes("Plane")
        );

        if (blocker) {
          desired.copy(anchor).addScaledVector(
            direction,
            Math.max(
              0.8,
              blocker.distance - 0.4
            )
          );
        }
      }

      cameraPosition.current.lerp(
        desired,
        1 - Math.exp(-7 * dt)
      );

      cameraTarget.current.lerp(
        anchor,
        1 - Math.exp(-10 * dt)
      );
    }

    camera.position.copy(cameraPosition.current);
    camera.lookAt(cameraTarget.current);

    // Send movement updates to the game controller.
    if (running) {
      onTick(dt, {
        x: state.x,
        z: state.z,
        heading: state.yaw,
        speed: Math.abs(state.speed),
        distanceToTarget: distance(
          state,
          target
        ),
        collision,
      });
    }
  });

  return (
    <>
      <group ref={world}>
        <CityWorld showTraffic={false} />
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
        position={[
          HOSPITAL.x,
          0.045,
          HOSPITAL.z,
        ]}
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
        far: 135,
      }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
    >
      <Driver {...props} />
    </Canvas>
  );
}
