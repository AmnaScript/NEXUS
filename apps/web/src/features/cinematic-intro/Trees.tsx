type TreeProps = {
  position: [number, number, number];
  scale?: number;
};

function Tree({ position, scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.7, 8]} />
        <meshStandardMaterial color="#8B7865" />
      </mesh>

      {/* Lower foliage */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color="#699B82" flatShading />
      </mesh>

      {/* Upper foliage */}
      <mesh position={[0.12, 1.55, 0]} castShadow>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial color="#86B49A" flatShading />
      </mesh>
    </group>
  );
}

export default function Trees() {
  const positions: [number, number, number][] = [
    [-5.5, 0, -5.5],
    [-2.3, 0, -4.8],
    [5.5, 0, -5.5],
    [2.3, 0, -4.8],
    [-5.5, 0, 5.5],
    [-2.3, 0, 4.8],
    [5.5, 0, 5.5],
    [2.3, 0, 4.8],
  ];

  return (
    <group>
      {positions.map((position, index) => (
        <Tree
          key={index}
          position={position}
          scale={index % 2 === 0 ? 0.9 : 0.7}
        />
      ))}
    </group>
  );
}