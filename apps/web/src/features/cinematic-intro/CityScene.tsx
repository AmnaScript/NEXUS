import type { MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import CityWorld from "../city-world/CityWorld";
import CityAnimation from "./CityAnimation";

type Props = { progress: MutableRefObject<{ t: number; reserve: number }> };

export default function CityScene({ progress }: Props) {
    return (
        <div className="h-full w-full">
            <Canvas orthographic camera={{ position: [26, 32, 36], zoom: 30, near: 0.1, far: 160 }} shadows dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
                <CityWorld />
                <CityAnimation progress={progress} />
            </Canvas>
        </div>
    );
}
