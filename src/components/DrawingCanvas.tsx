import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import DrawingPlane, { DrawingPlaneHandle } from './DrawingPlane';
import { useDrawStore } from '../store/drawStore';

export interface DrawingCanvasHandle {
  getMeshes: () => THREE.Mesh[];
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle>((props, ref) => {
  const planeRef = useRef<DrawingPlaneHandle>(null);
  const { cameraEnabled } = useDrawStore();

  useImperativeHandle(ref, () => ({
    getMeshes: () => planeRef.current?.getMeshes() || [],
  }));

  return (
    <Canvas shadows dpr={[1, 2]}>
      <color attach="background" args={['#050505']} />
      <PerspectiveCamera makeDefault position={[0, 10, 10]} fov={50} />
      {cameraEnabled && (
        <OrbitControls
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
          enableZoom
          minDistance={5}
          maxDistance={20}
        />
      )}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <DrawingPlane ref={planeRef} />
    </Canvas>
  );
});

export default DrawingCanvas;



