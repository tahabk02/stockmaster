import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Html, View, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const NetworkSphere = () => {
  const group = useRef<THREE.Group>(null!);
  const count = 20;
  
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 2.5;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            if (nodes[i].distanceTo(nodes[j]) < 2.5) {
                lines.push([nodes[i], nodes[j]]);
            }
        }
    }
    return lines;
  }, [nodes]);

  useFrame((state) => {
    if (group.current) {
        group.current.rotation.y += 0.002;
        group.current.rotation.x = Math.sin(state.clock.getElapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <Sphere args={[2.4, 32, 32]}>
         <meshBasicMaterial color="#6366f1" transparent opacity={0.05} wireframe />
      </Sphere>
      {nodes.map((pos, i) => (
         <group key={i} position={pos}>
            <mesh>
               <sphereGeometry args={[0.08, 16, 16]} />
               <meshStandardMaterial color="#fff" emissive="#6366f1" emissiveIntensity={2} />
            </mesh>
            {i % 3 === 0 && (
                <Html distanceFactor={8}>
                    <div className="text-[6px] font-black text-indigo-400 bg-black/50 backdrop-blur-md px-1 py-0.5 rounded border border-indigo-500/30 whitespace-nowrap">
                        NODE_0x{i}
                    </div>
                </Html>
            )}
         </group>
      ))}
      {connections.map((line, i) => (
         <Line key={i} points={line} color="#6366f1" transparent opacity={0.2} lineWidth={1} />
      ))}
    </group>
  );
};

export const AllianceNetwork3D = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
      <View track={containerRef as any}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <NetworkSphere />
      </View>
    </div>
  );
};
