'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InteractiveNebulaShaderProps {
  className?: string;
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ===================== SHADER DEFINITION =====================
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    vec3 g = a0 * vec3(m.x, x12.x, x12.z) + h * vec3(m.y, x12.y, x12.w);
    vec3 norm = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 r = g * norm;
    return 130.0 * dot(m, r);
  }

  void main() {
    vec2 uv = vUv;
    float t = iTime * 0.2;
    
    // Liquid movement simulation
    float n1 = snoise(uv * 3.0 + t);
    float n2 = snoise(uv * 6.0 - t * 0.5 + n1);
    float n3 = snoise(uv * 2.0 + t * 0.3 + n2);
    
    // Create base nebula colors
    vec3 color1 = vec3(0.1, 0.2, 0.6) * 1.5; // Brighter Deep Indigo
    vec3 color2 = vec3(0.5, 0.2, 0.8) * 1.5; // Brighter Deep Purple
    vec3 color3 = vec3(0.05, 0.05, 0.15); // Subtle deep base as requested
    
    vec3 mixedColor = mix(color1, color2, n1 * 0.5 + 0.5);
    mixedColor = mix(mixedColor, color3 + color1 * 0.2, n2 * 0.3 + 0.3);
    
    // Glowing highlights - boosted
    float glow = pow(max(0.0, n3), 2.5) * 2.0;
    mixedColor += vec3(0.4, 0.5, 1.0) * glow;
    
    // Add "stars" (static grain)
    float stars = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    if(stars > 0.998) mixedColor += 0.4;

    gl_FragColor = vec4(mixedColor, 1.0);
  }
`;

const LiquidShaderMaterial = shaderMaterial(
  { iTime: 0, iResolution: new THREE.Vector2(1, 1) },
  vertexShader,
  fragmentShader
);

extend({ LiquidShaderMaterial });

function ShaderPlane() {
  const materialRef = useRef<any>(null!);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.iTime = state.clock.elapsedTime;
    const { width, height } = state.size;
    materialRef.current.iResolution.set(width, height);
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
      <liquidShaderMaterial ref={materialRef} transparent={true} />
    </mesh>
  );
}

export function InteractiveNebulaShader({
  className = "",
}: InteractiveNebulaShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize fix: Ensure the renderer updates its size correctly on mount and resize
  React.useEffect(() => {
    const handleResize = () => {
      // Fiber handles this naturally, but an explicit trigger helps with some browser locks
      window.dispatchEvent(new Event('resize'));
    };
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100); // Delayed trigger for layout settle
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-0 overflow-hidden bg-black", // Keep black base in shader for contrast
        className
      )}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{
          antialias: true,
          alpha: true, // Allow transparency as requested
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ShaderPlane />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black/80" />
    </div>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      liquidShaderMaterial: any;
    }
  }
}
