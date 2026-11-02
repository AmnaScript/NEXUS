
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type TimeOfDay = "day" | "night";

export default function Atmosphere({
    timeOfDay,
}: {
    timeOfDay: TimeOfDay;
}) {
    const { scene } = useThree();
    const sun = useRef<THREE.DirectionalLight>(null);
    const ambient = useRef<THREE.AmbientLight>(null);
    const hemisphere = useRef<THREE.HemisphereLight>(null);
    const blend = useRef(timeOfDay === "night" ? 1 : 0);

    const dayBackground = useRef(new THREE.Color("#FFF6E5"));
    const nightBackground = useRef(new THREE.Color("#15233D"));
    const daySun = useRef(new THREE.Color("#FFF1D2"));
    const nightSun = useRef(new THREE.Color("#8CACE8"));

    useEffect(() => {
        scene.background = new THREE.Color("#FFF6E5");
        scene.fog = new THREE.Fog("#FFF6E5", 40, 80);

        return () => {
            scene.fog = null;
        };
    }, [scene]);

    useFrame((_, dt) => {
        const target = timeOfDay === "night" ? 1 : 0;
        blend.current = THREE.MathUtils.damp(
            blend.current,
            target,
            2.3,
            dt
        );

        const t = blend.current;
        const background = scene.background;

        if (background instanceof THREE.Color) {
            background.copy(dayBackground.current).lerp(nightBackground.current, t);
        }

        if (scene.fog instanceof THREE.Fog) {
            scene.fog.color.copy(dayBackground.current).lerp(nightBackground.current, t);
        }

        if (sun.current) {
            sun.current.intensity = THREE.MathUtils.lerp(2.15, 0.4, t);
            sun.current.color.copy(daySun.current).lerp(nightSun.current, t);
        }

        if (ambient.current) {
            ambient.current.intensity = THREE.MathUtils.lerp(1.05, 0.36, t);
        }

        if (hemisphere.current) {
            hemisphere.current.intensity = THREE.MathUtils.lerp(1.1, 0.55, t);
        }
    });

    return (
        <>
            <ambientLight ref={ambient} intensity={1.05} />

            <hemisphereLight
                ref={hemisphere}
                args={["#FFF9E7", "#A1BCAC", 1.1]}
            />

            <directionalLight
                ref={sun}
                position={[-16, 24, 17]}
                intensity={2.15}
                color="#FFF1D2"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-18}
                shadow-camera-right={18}
                shadow-camera-top={18}
                shadow-camera-bottom={-18}
                shadow-camera-near={1}
                shadow-camera-far={65}
                shadow-bias={-0.00015}
            />

            <directionalLight
                position={[8, 10, -8]}
                color="#98B6DA"
                intensity={0.22}
            />
        </>
    );
}
