
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
    camera.position.set(26, 32, 36);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;
    const { t, reserve } = progress.current;

    const safeT = THREE.MathUtils.clamp(t, 0, 1);

    // Scene bounds are now approximately 30 x 30 world units.
    // A conservative camera fit prevents outer districts
    // from being cropped on typical laptop screens.
    const startZoom = Math.min(
      size.width / 43,
      size.height / 38
    );

    const availableHeight = Math.max(
      170,
      size.height - reserve - 14
    );

    const endZoom = Math.min(
      startZoom,
      availableHeight / 34
    );

    cam.zoom = THREE.MathUtils.lerp(
      startZoom,
      endZoom,
      safeT
    );

    cam.position.set(
      THREE.MathUtils.lerp(26, 27, safeT),
      THREE.MathUtils.lerp(32, 34, safeT),
      THREE.MathUtils.lerp(36, 38, safeT)
    );

    cam.lookAt(0, 0, 0);

    // Shift visual framing toward the space above hero copy.
    cam.setViewOffset(
      Math.max(size.width, 1),
      Math.max(size.height, 1),
      0,
      (reserve / 2.1) * safeT,
      Math.max(size.width, 1),
      Math.max(size.height, 1)
    );

    cam.updateProjectionMatrix();
  });

  return null;
}
