import React, { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Image, 
  Text, 
  View, 
  PerspectiveCamera, 
  Environment
} from '@react-three/drei';
import * as THREE from 'three';

const items = [
  {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    title: "INDUSTRIAL_AUTOMATION",
    id: "0xAF1"
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    title: "NEURAL_LOGISTICS",
    id: "0xAF2"
  },
  {
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
    title: "SOVEREIGN_DATA",
    id: "0xAF3"
  },
  {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    title: "GLOBAL_LATTICE",
    id: "0xAF4"
  }
];

function Panel({ url, title, id, index, activeIndex }: any) {
  const mesh = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  
  const angle = (index - activeIndex) * (Math.PI / 2);
  const radius = 6;
  const targetX = Math.sin(angle) * radius;
  const targetZ = Math.cos(angle) * radius - radius;

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, 0.1);
    mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetZ, 0.1);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, -angle * 0.5, 0.1);
    
    const scale = hovered ? 1.1 : 1;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, scale, 0.1));
  });

  return (
    <group ref={mesh}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <planeGeometry args={[4, 2.5]} />
        <Suspense fallback={<meshBasicMaterial color="#111" />}>
            <Image 
                url={url} 
                transparent 
                opacity={index === activeIndex ? 1 : 0.3}
                grayscale={index === activeIndex ? 0 : 1}
                toneMapped={false}
            />
        </Suspense>
        
        <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[4.1, 2.6]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={hovered ? 0.2 : 0.05} />
        </mesh>

        <Text
          position={[0, -1.6, 0.1]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {title} // {id}
        </Text>
      </mesh>
    </group>
  );
}

export const ThreeImageSlider = () => {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null!);

  const next = () => setActive((prev) => (prev + 1) % items.length);
  const prev = () => setActive((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <View track={containerRef as any}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <group position={[0, 0.2, 0]}>
          {items.map((item, i) => (
            <Panel 
              key={i} 
              {...item} 
              index={i} 
              activeIndex={active} 
            />
          ))}
        </group>

        <Environment preset="city" />
      </View>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-10 z-10">
         <button onClick={prev} className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-indigo-600 transition-all group shadow-xl">
            <span className="text-white text-[8px] font-black uppercase italic group-hover:scale-110 transition-transform">Prev_Node</span>
         </button>
         
         <div className="flex gap-2">
            {items.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${active === i ? "w-8 bg-indigo-500" : "w-2 bg-white/10"}`} />
            ))}
         </div>

         <button onClick={next} className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-indigo-600 transition-all group shadow-xl">
            <span className="text-white text-[8px] font-black uppercase italic group-hover:scale-110 transition-transform">Next_Node</span>
         </button>
      </div>
    </div>
  );
};
