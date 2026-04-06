import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  OrthographicCamera, 
  OrbitControls, 
  ContactShadows, 
  Text, 
  RoundedBox, 
  Float, 
  Box,
  View
} from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';

const THEME = {
  primary: '#6366f1',
  secondary: '#10b981',
  accent: '#f43f5e',
  wall: '#020205',
  floor: '#050510'
};

function CentralHub({ active = true }) {
  const { hubSpring } = useSpring({
    hubSpring: active ? 1 : 0,
    config: { mass: 5, tension: 400, friction: 50 }
  });

  return (
    <a.group position-y={hubSpring.to([0, 1], [-2, 0])} scale={hubSpring}>
      <RoundedBox args={[2, 4, 2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      {[1.5, 0.5, -0.5, -1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 1.01]}>
          <planeGeometry args={[1.6, 0.2]} />
          <meshStandardMaterial color={THEME.primary} emissive={THEME.primary} emissiveIntensity={3} transparent opacity={0.8} />
        </mesh>
      ))}
      <Float speed={5} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[0, 2.5, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color={THEME.secondary} emissive={THEME.secondary} emissiveIntensity={2} />
        </mesh>
      </Float>
    </a.group>
  );
}

function FeatureIcon({ position, type, color, label }: any) {
  const springs = useSpring({
    from: { scale: 0, pos: [position[0], position[1] - 5, position[2]] },
    to: { scale: 1, pos: position },
    delay: 500 + Math.random() * 1000,
    config: { mass: 1, tension: 280, friction: 20 }
  });

  return (
    <a.group position={springs.pos as any} scale={springs.scale as any}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {type === 'TRUCK' && (
          <Box args={[1, 0.5, 0.5]}>
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
          </Box>
        )}
        {type === 'CHART' && (
          <group>
             <Box args={[0.2, 0.8, 0.2]} position={[-0.3, 0, 0]}><meshStandardMaterial color={color} /></Box>
             <Box args={[0.2, 1.2, 0.2]} position={[0, 0.2, 0]}><meshStandardMaterial color={color} /></Box>
             <Box args={[0.2, 0.5, 0.2]} position={[0.3, -0.15, 0]}><meshStandardMaterial color={color} /></Box>
          </group>
        )}
        {type === 'DOC' && <Box args={[0.7, 1, 0.05]}><meshStandardMaterial color="#fff" /></Box>}
        {type === 'PHONE' && (
            <RoundedBox args={[0.6, 1.1, 0.1]} radius={0.05}><meshStandardMaterial color="#222" metalness={1} /></RoundedBox>
        )}
        <Text position={[0, -1, 0]} fontSize={0.2} color="white" fillOpacity={0.5}>{label}</Text>
      </Float>
    </a.group>
  );
}

export const IsometricRoom = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  return (
    <div ref={containerRef} className="w-full h-[600px] relative bg-[#020205] overflow-hidden rounded-[3rem] border border-white/5">
      <View track={containerRef as any}>
        <OrthographicCamera makeDefault position={[10, 10, 10]} zoom={60} near={1} far={1000} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        <group position={[0, -2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color={THEME.floor} roughness={0.8} /></mesh>
          <mesh position={[0, 5, -10]} receiveShadow><boxGeometry args={[20, 10, 0.2]} /><meshStandardMaterial color={THEME.wall} /></mesh>
          <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><boxGeometry args={[20, 10, 0.2]} /><meshStandardMaterial color={THEME.wall} /></mesh>
          <ContactShadows opacity={0.4} scale={20} blur={2.4} far={10} resolution={256} color="#000" />
        </group>
        <CentralHub />
        <FeatureIcon position={[-5, 2, -3]} type="TRUCK" color={THEME.primary} label="SUPPLY_CHAIN" />
        <FeatureIcon position={[5, 2, -3]} type="CHART" color={THEME.secondary} label="STOCK_INTEL" />
        <FeatureIcon position={[-5, 2, 4]} type="DOC" color={THEME.accent} label="LEDGER_0xAF" />
        <FeatureIcon position={[5, 2, 4]} type="PHONE" color="#fff" label="MOBILE_NODE" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} enablePan={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 3} />
        <fog attach="fog" args={['#020205', 15, 30]} />
      </View>
      <div className="absolute top-10 right-10 z-10 text-right pointer-events-none">
         <div className="flex flex-col gap-1 items-end">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] italic">Command_Center_v9.4</span>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic">Lattice_Sync_Active</span>
            </div>
         </div>
      </div>
    </div>
  );
};
