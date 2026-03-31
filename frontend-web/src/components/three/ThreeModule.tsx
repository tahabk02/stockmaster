import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, TorusKnot, Sphere, Icosahedron, Box, OrbitControls, View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const NeuralScene = ({ color }: { color: string }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1.5, 32, 32]} ref={mesh}>
        <MeshDistortMaterial 
          color={color} 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0} 
          metalness={0.1} 
          distort={0.4} 
          speed={2}
        />
      </Sphere>
      <Sphere args={[1.8, 32, 32]}>
           <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </Sphere>
    </Float>
  );
};

const IndustrialScene = ({ color }: { color: string }) => {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={1}>
      <TorusKnot args={[1, 0.3, 128, 16]}>
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={1} 
          emissive={color}
          emissiveIntensity={0.2}
        />
      </TorusKnot>
    </Float>
  );
};

const FleetScene = ({ color }: { color: string }) => {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
      if (group.current) {
          group.current.rotation.y += 0.005;
      }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={group}>
          <Sphere args={[1.2, 32, 32]}>
              <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
          </Sphere>
          <Sphere args={[1, 32, 32]}>
              <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
          </Sphere>
          {[0, 1, 2].map(i => (
              <group key={i} rotation={[i, i * 2, 0]}>
                  <mesh position={[1.8, 0, 0]}>
                      <Sphere args={[0.08, 16, 16]}>
                          <meshBasicMaterial color="white" />
                      </Sphere>
                  </mesh>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[1.8, 0.01, 16, 64]} />
                      <meshBasicMaterial color={color} transparent opacity={0.1} />
                  </mesh>
              </group>
          ))}
      </group>
    </Float>
  );
};

const FiscalScene = ({ color }: { color: string }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group>
          <Icosahedron args={[1.5, 0]}>
              <meshPhysicalMaterial 
                  color={color}
                  roughness={0}
                  metalness={0.8}
                  transmission={0.6}
                  thickness={2}
                  clearcoat={1}
              />
          </Icosahedron>
          <Box args={[2.2, 2.2, 2.2]}>
              <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
          </Box>
      </group>
    </Float>
  );
};

export const ThreeModule = ({ type, color }: { type: 'NEURAL' | 'INDUSTRIAL' | 'FLEET' | 'FISCAL', color: string }) => {
  const containerRef = useRef<HTMLDivElement>(null!);
  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] relative">
      <View track={containerRef as any}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={color} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="white" />
        
        {type === 'NEURAL' && <NeuralScene color={color} />}
        {type === 'INDUSTRIAL' && <IndustrialScene color={color} />}
        {type === 'FLEET' && <FleetScene color={color} />}
        {type === 'FISCAL' && <FiscalScene color={color} />}

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </View>
    </div>
  );
};
