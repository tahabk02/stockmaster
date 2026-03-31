import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, 
  Line, 
  Points, 
  PointMaterial, 
  PerspectiveCamera, 
  OrbitControls,
  Html,
  View,
  Float
} from '@react-three/drei';
import * as THREE from 'three';

const THEME = {
  primary: '#00f3ff',
  secondary: '#ffffff',
  bg: '#020205'
};

function DataPulse({ start, end, speed = 1, color = THEME.primary }: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * speed) % 1;
    if (mesh.current) {
      mesh.current.position.lerpVectors(start, end, t);
      const opacity = Math.sin(t * Math.PI);
      if (mesh.current.material) {
        (mesh.current.material as THREE.MeshStandardMaterial).opacity = opacity;
      }
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={10} 
        transparent 
        toneMapped={false}
      />
    </mesh>
  );
}

const NetworkLattice = () => {
  const group = useRef<THREE.Group>(null!);
  const nodeCount = 12;
  
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < nodeCount; i++) {
      temp.push(new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ));
    }
    return temp;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodeCount; i++) {
      const targetCount = 2;
      for (let j = 0; j < targetCount; j++) {
        const targetIdx = Math.floor(Math.random() * nodeCount);
        if (targetIdx !== i) {
          lines.push({ start: nodes[i], end: nodes[targetIdx] });
        }
      }
    }
    return lines;
  }, [nodes]);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={group}>
      {/* Background Data Field */}
      <Points positions={new Float32Array(1500 * 3).map(() => (Math.random() - 0.5) * 15)} stride={3}>
        <PointMaterial 
          transparent 
          color={THEME.primary} 
          size={0.02} 
          sizeAttenuation={true} 
          depthWrite={false} 
          opacity={0.4}
        />
      </Points>

      {/* Nodes */}
      {nodes.map((pos, i) => (
        <group key={i} position={pos}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[0.1, 16, 16]}>
                <meshStandardMaterial 
                    color={THEME.primary} 
                    emissive={THEME.primary} 
                    emissiveIntensity={5} 
                    toneMapped={false}
                />
            </Sphere>
            {/* Outer Glow Sphere */}
            <Sphere args={[0.15, 16, 16]}>
                <meshBasicMaterial color={THEME.primary} transparent opacity={0.2} wireframe />
            </Sphere>
          </Float>
          <Html distanceFactor={10}>
             <div className="bg-black/80 border border-cyan-500/30 px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                <p className="text-[6px] font-black text-cyan-400 italic">NODE_0x{i}</p>
             </div>
          </Html>
        </group>
      ))}

      {/* Connection Lines & Data Pulses */}
      {connections.map((line, i) => (
        <React.Fragment key={i}>
          <Line 
            points={[line.start, line.end]} 
            color={THEME.primary} 
            transparent 
            opacity={0.15} 
            lineWidth={1} 
          />
          <DataPulse start={line.start} end={line.end} speed={0.3 + Math.random() * 0.4} />
        </React.Fragment>
      ))}
    </group>
  );
};

export const PayloopVisual = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  return (
    <div ref={containerRef} className="w-full h-[600px] relative bg-[#020205] overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="absolute top-10 left-10 z-10 space-y-2 pointer-events-none">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#00f3ff]" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.6em] italic">Live_Stock_Telemetry</h3>
         </div>
         <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Protocol_0x99_Active // Data_Flow_Sovereign</p>
      </div>

      <div className="absolute bottom-10 right-10 z-10 text-right pointer-events-none">
         <p className="text-[24px] font-black text-white italic uppercase tracking-tighter">Payloop<span className="text-cyan-500">_OS</span></p>
         <div className="h-1 w-32 bg-cyan-500/20 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-500 animate-[pulse_2s_infinite]" style={{ width: '60%' }} />
         </div>
      </div>

      <View track={containerRef as any}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color={THEME.primary} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />
        
        <Suspense fallback={null}>
          <NetworkLattice />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 3} 
        />
        <fog attach="fog" args={['#020205', 5, 15]} />
      </View>
    </div>
  );
};
