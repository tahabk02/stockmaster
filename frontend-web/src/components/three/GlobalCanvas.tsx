import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, View } from '@react-three/drei';
import * as THREE from 'three';

export const GlobalCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('Sovereign_Canvas: WebGL Context Lost. Attempting recovery...');
    };

    const handleContextRestored = () => {
      console.info('Sovereign_Canvas: WebGL Context Restored.');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      shadows={{ type: THREE.PCFShadowMap }}
      gl={{ 
        alpha: true, 
        antialias: false, // Performance optimization
        stencil: false, 
        depth: true,
        powerPreference: 'high-performance',
        desynchronized: true, // Lower latency
      }}
      dpr={1} // Lock to 1 for maximum performance stability on lower-end devices
      frameloop="demand" // Change to demand to save resources when nothing changes
    >
      <View.Port />
      <Preload all />
    </Canvas>
  );
};
