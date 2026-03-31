import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Float, 
  Text, 
  Html, 
  PerspectiveCamera,
  useCursor,
  RoundedBox,
  View
} from '@react-three/drei';
import * as THREE from 'three';

const slides = [
  { title: "NEURAL_AI", subtitle: "MISSION_CRITICAL", desc: "Predictive Velocity & Fiscal Forecasting.", color: "#6366f1", icon: "🧠" },
  { title: "PROD_HUB", subtitle: "INDUSTRIAL_CORE", desc: "OEE Analytics & Quality Zenith.", color: "#f43f5e", icon: "🏭" },
  { title: "FLEET_LINK", subtitle: "LOGISTICS_SYNC", desc: "Geospatial Tracking & Autonomous Logic.", color: "#10b981", icon: "🚚" },
  { title: "FISCAL_INTEL", subtitle: "FORENSIC_LEDGER", desc: "Audit Logs & Automated Vault.", color: "#f59e0b", icon: "📊" }
];

function Card({ data, index, activeIndex, onClick }: any) {
  const mesh = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const angle = (index - activeIndex) * (Math.PI / 2.5);
  const targetX = Math.sin(angle) * 8;
  const targetZ = Math.cos(angle) * 8 - 8;
  const targetRotationY = -angle * 0.5;

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, 0.1);
    mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetZ, 0.1);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetRotationY, 0.1);
    if (index === activeIndex) {
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, Math.sin(state.clock.elapsedTime) * 0.2, 0.1);
    } else {
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, 0, 0.1);
    }
  });

  const isActive = index === activeIndex;

  return (
    <group ref={mesh} onClick={() => onClick(index)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <RoundedBox args={[5, 7, 0.15]} radius={0.4} smoothness={4}>
        <meshPhysicalMaterial 
          color={isActive ? data.color : "#ffffff"} 
          transparent 
          opacity={isActive ? 0.4 : 0.1} 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.9} 
          thickness={1.5} 
          toneMapped={false}
        />
      </RoundedBox>
      <Text position={[0, 1.5, 0.2]} fontSize={0.4} color="white" anchorX="center" anchorY="middle" font={undefined}>
        {data.title}
      </Text>
      <Text position={[0, 0.9, 0.2]} fontSize={0.12} color={data.color} anchorX="center" anchorY="middle" letterSpacing={0.4} font={undefined}>
        {data.subtitle}
      </Text>
      <Html position={[0, -1.2, 0.2]} transform distanceFactor={4} center>
         <div className="w-64 text-center select-none pointer-events-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 italic leading-relaxed">{data.desc}</p>
         </div>
      </Html>
      <Float speed={isActive ? 4 : 1} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[0, 2.8, 0.4]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={isActive ? 5 : 0.5} toneMapped={false} />
        </mesh>
      </Float>
      {isActive && <pointLight position={[0, 0, 1]} distance={8} intensity={5} color={data.color} />}
    </group>
  );
}

export const ThreeSlider = () => {
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null!);

  const advance = (delta: number) => {
    setActive((prev) => (prev + delta + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isHovering) return;
    const interval = window.setInterval(() => advance(1), 8000);
    return () => window.clearInterval(interval);
  }, [isHovering]);

  return (
    <div 
      ref={containerRef} 
      className="h-[600px] w-full relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <View track={containerRef as any}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={40} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 15, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
        <group position={[0, 0, 0]}>
          {slides.map((slide, i) => (
            <Card key={i} data={slide} index={i} activeIndex={active} onClick={setActive} />
          ))}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow opacity={0.2} transparent>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial opacity={0.4} />
        </mesh>
        <fog attach="fog" args={['#020205', 8, 20]} />
      </View>

      {/* UI Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
         <button onClick={() => advance(-1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl">‹</button>
         
         <div className="flex items-center gap-4">
            {slides.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} className="group flex flex-col items-center gap-2">
                <span className={`text-[8px] font-black transition-colors duration-500 ${active === i ? "text-indigo-500" : "text-white/20"}`}>0{i + 1}</span>
                <div className={`h-1 rounded-full transition-all duration-700 ${active === i ? "bg-indigo-500 w-16" : "bg-white/10 w-8 group-hover:bg-white/30"}`} />
                </button>
            ))}
         </div>

         <button onClick={() => advance(1)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl">›</button>
      </div>
    </div>
  );
};
