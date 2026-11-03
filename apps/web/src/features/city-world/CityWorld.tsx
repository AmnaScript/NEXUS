
import { Suspense } from "react";
import type { RefObject } from "react";

import Roads from "./Roads";
import Architecture from "./Architecture";
import Landmarks from "./Landmarks";
import Environment from "./Environment";
import OuterDistricts from "./OuterDistricts";
import CityTraffic from "../vehicles/CityTraffic";

type PlayerTrafficInfo = {
    x: number;
    z: number;
    siren: boolean;
};

type Props = {
    showTraffic?: boolean;
    trafficPaused?: boolean;
    playerRef?: RefObject<PlayerTrafficInfo>;
};

export default function CityWorld({
    showTraffic = true,
    trafficPaused = false,
    playerRef,
}: Props) {
    return (
        <group>
            <color attach="background" args={["#FFF6E5"]} />
            <fog attach="fog" args={["#FFF6E5", 62, 115]} />

            <ambientLight intensity={1.1} />

            <hemisphereLight
                args={["#FFF9E7", "#A1BCAC", 1.1]}
            />

            <directionalLight
                position={[-20, 30, 21]}
                intensity={2.15}
                color="#FFF1D2"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-25}
                shadow-camera-right={25}
                shadow-camera-top={25}
                shadow-camera-bottom={-25}
            />

            <Suspense fallback={null}>
                <Roads />
                <Architecture />
                <Landmarks />
                <OuterDistricts />
                <Environment />

                {showTraffic && (
                    <CityTraffic
                        paused={trafficPaused}
                        playerRef={playerRef}
                    />
                )}
            </Suspense>
        </group>
    );
}
