
import { useEffect } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: MutableRefObject<{
    t: number;
    reserve: number;
  }>;
};

export default function CityAnimation({ progress }: Props) {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.position.set(40, 48, 53);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;

    const t = THREE.MathUtils.clamp(
      progress.current.t,
      0,
      1
    );

    const reserve = Math.max(
      0,
      progress.current.reserve
    );

    // Expanded 45-unit district requires more framing space.
    const initialZoom = Math.min(
      size.width / 64,
      size.height / 59
    );

    const usableHeight = Math.max(
      150,
      size.height - reserve - 16
    );

    const finalZoom = Math.min(
      initialZoom,
      usableHeight / 53
    );

    cam.zoom = THREE.MathUtils.lerp(
      initialZoom,
      finalZoom,
      t
    );

    cam.position.set(
      THREE.MathUtils.lerp(40, 42, t),
      THREE.MathUtils.lerp(48, 50, t),
      THREE.MathUtils.lerp(53, 55, t)
    );

    cam.lookAt(0, 0, 0);

    cam.setViewOffset(
      Math.max(size.width, 1),
      Math.max(size.height, 1),
      0,
      (reserve / 2.1) * t,
      Math.max(size.width, 1),
      Math.max(size.height, 1)
    );

    cam.updateProjectionMatrix();
  });

  return null;
}
