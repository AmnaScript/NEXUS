export default function CityGround() {
  return (
    <group>
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[14, 0.3, 14]} />
        <meshStandardMaterial color="#E5E9DF" />
      </mesh>
    </group>
  );
}