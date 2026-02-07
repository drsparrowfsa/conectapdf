'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';

function Box() {
    return (
        <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
}

export default function TestHero() {
    return (
        <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center text-white">
            <h1 className="z-10 text-4xl font-bold mb-4">Teste de Renderização 3D</h1>
            <div className="absolute inset-0">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Box />
                </Canvas>
            </div>
        </div>
    );
}
