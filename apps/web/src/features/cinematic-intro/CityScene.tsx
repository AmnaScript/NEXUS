import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CityGround from "./CityGround";
import Roads from "./Roads";
import Buildings from "./Buildings";
import Trees from "./Trees";
import StreetDetails from "./StreetDetails";
import DeliveryRider from "./DeliveryRider";
import IncidentAlert from "./IncidentAlert";
import CityAnimation from "./CityAnimation";

type Props = {
    progress: React.MutableRefObject<{ t: number; reserve: number }>;
};

export default function CityScene({ progress }: Props) {
    return (
        <div className="h-full w-full">
            <Canvas
                orthographic
                camera={{
                    position: [12, 14, 16],
                    zoom: 35,
                    near: 0.1,
                    far: 100,
                }}
                shadows
            >
                <color attach="background" args={["#F7F6F2"]} />

                <ambientLight intensity={0.8} />

                <directionalLight
                    position={[5, 10, 7]}
                    intensity={2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-12}
                    shadow-camera-right={12}
                    shadow-camera-top={12}
                    shadow-camera-bottom={-12}
                />

                <CityGround />
                <Roads />
                <Buildings />
                <Trees />
                <StreetDetails />
                <DeliveryRider />
                <IncidentAlert />
                <CityAnimation progress={progress} />

                <OrbitControls
                    enablePan={false}
                    enableDamping
                    dampingFactor={0.06}
                    rotateSpeed={0.3}
                    enableZoom={false}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.3}
                />
            </Canvas>
        </div>
    );
}