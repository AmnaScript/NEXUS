import { Suspense } from "react";
import Roads from "./Roads";
import Architecture from "./Architecture";
import Landmarks from "./Landmarks";
import Environment from "./Environment";
import CityTraffic from "../vehicles/CityTraffic";

export default function CityWorld({ showTraffic = true }: { showTraffic?: boolean }) {
    return (
        <group>
            <color attach="background" args={["#FFF6E5"]} />
            <fog attach="fog" args={["#FFF6E5", 42, 80]} />
            <ambientLight intensity={1.1} />
            <hemisphereLight args={["#FFF9E7", "#A1BCAC", 1.1]} />
            <directionalLight position={[-16, 24, 17]} intensity={2.15} color="#FFF1D2" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-19} shadow-camera-right={19} shadow-camera-top={19} shadow-camera-bottom={-19} />
            <Suspense fallback={null}>
                <Roads />
                <Architecture />
                <Landmarks />
                <Environment />
                {showTraffic && <CityTraffic />}
            </Suspense>
        </group>
    );
}
