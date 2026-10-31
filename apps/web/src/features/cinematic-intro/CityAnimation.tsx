import { useEffect } from "react";
import { useFrame,  useThree } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: React.MutableRefObject<{ t: number; reserve: number }>;
};

export default function CityAnimation({ progress }: Props) {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.position.set(12, 14, 16);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;
    const { t, reserve } = progress.current;

    // full-size city at the start
    const startZoom = Math.min(size.width / 17, size.height / 15);

    // end size: the city fits in the space above the text
    const availableHeight = Math.max(size.height - reserve, 140);
    const endZoom = Math.min(startZoom, availableHeight / 14);

    cam.zoom = THREE.MathUtils.lerp(startZoom, endZoom, t);

    // move the city up by half the reserved space, so it stays
    // centered in the area above the text
    cam.setViewOffset(
      size.width,
      size.height,
      0,
      (reserve / 2) * t,
      size.width,
      size.height
    );

    cam.updateProjectionMatrix();
  });

  return null;
}