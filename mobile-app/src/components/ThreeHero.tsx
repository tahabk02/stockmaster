import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Optimized dynamic resolution for Three.js ecosystem
let Canvas: any = null;
let useFrame: any = null;
let THREE: any = null;

const resolveThree = () => {
  try {
    THREE = require('three');
    const fiber = require('@react-three/fiber');
    Canvas = fiber.Canvas;
    useFrame = fiber.useFrame;
    return true;
  } catch (e) {
    return false;
  }
};

const isThreeAvailable = resolveThree();

function RotatingShape({ color, size }: { color: string, size: number }) {
  const mesh = useRef<any>(null!);
  
  if (useFrame) {
    useFrame((state: any, delta: number) => {
      if (mesh.current) {
        mesh.current.rotation.x += delta * 0.5;
        mesh.current.rotation.y += delta * 0.2;
        mesh.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.2;
      }
    });
  }

  if (!THREE) return null;

  return (
    <mesh ref={mesh} scale={size}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

function TechParticles() {
  const points = useRef<any>(null!);
  const count = 300;
  
  // Memoize positions to prevent regeneration on every render
  const positions = useRef(new Float32Array(count * 3)).current;
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
  }, []);

  if (useFrame) {
    useFrame((state: any, delta: number) => {
      if (points.current) {
        points.current.rotation.y += delta * 0.05;
      }
    });
  }

  if (!THREE) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#6366f1" transparent opacity={0.6} />
    </points>
  );
}

export function ThreeHero({ color = "#6366f1" }: { color?: string }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!isThreeAvailable || !Canvas || !THREE) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.circle,
            { backgroundColor: color },
            { transform: [{ rotate }] },
          ]}
        />
        <View style={[styles.overlay, { borderColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RotatingShape color={color} size={1.5} />
        <TechParticles />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: -40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    opacity: 0.2,
  },
  overlay: {
    position: "absolute",
    width: "90%",
    height: "90%",
    borderRadius: 32,
    borderWidth: 1,
    opacity: 0.1,
  },
});
