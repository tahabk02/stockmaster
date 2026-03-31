import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial, View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  return (
    <Points positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6366f1"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function IndustrialCore() {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
        mesh.current.rotation.x = time * 0.2;
        mesh.current.rotation.y = time * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[2, 0]} />
        <MeshDistortMaterial
          color="#6366f1"
          speed={3}
          distort={0.4}
          radius={1}
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6366f1"
          emissiveIntensity={2}
          roughness={0}
        />
      </Sphere>
      
      <group rotation={[Math.PI / 4, 0, 0]}>
         <mesh>
            <torusGeometry args={[3, 0.02, 16, 100]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
         </mesh>
      </group>
      <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
         <mesh>
            <torusGeometry args={[3.5, 0.01, 16, 100]} />
            <meshStandardMaterial color="#6366f1" transparent opacity={0.2} />
         </mesh>
      </group>
    </Float>
  );
}

export const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <View track={containerRef as any}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        <IndustrialCore />
        <ParticleField />
        
        <fog attach="fog" args={['#020205', 5, 20]} />
      </View>
    </div>
  );
};
