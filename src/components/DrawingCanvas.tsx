import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import DrawingPlane, { DrawingPlaneHandle } from './DrawingPlane';
import { useDrawStore } from '../store/drawStore';
import * as THREE from 'three';

export interface DrawingCanvasHandle {
  getMeshes: () => THREE.Mesh[];
  getRenderer: () => THREE.WebGLRenderer | null;
  getScene: () => THREE.Scene | null;
  getCamera: () => THREE.Camera | null;
}

const SceneContent = ({ planeRef }: { planeRef: React.RefObject<DrawingPlaneHandle> }) => {
  const { cameraEnabled } = useDrawStore();

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fov={50}
        near={0.1}
        far={100}
      />
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

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.LARGE}
          blendFunction={BlendFunction.ADD}
        />
        <Bloom
          intensity={3}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.HUGE}
          blendFunction={BlendFunction.ADD}
          mipmapBlur
          levels={5}
        />
      </EffectComposer>
    </>
  );
};


const ThreeRefs = forwardRef((_, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    getRenderer: () => gl,
    getScene: () => scene,
    getCamera: () => camera,
  }));

  return null;
});

const DrawingCanvas = forwardRef<DrawingCanvasHandle>((props, ref) => {
  const planeRef = useRef<DrawingPlaneHandle>(null);
  const threeRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getMeshes: () => planeRef.current?.getMeshes?.() || [],
    getRenderer: () => threeRef.current?.getRenderer?.() || null,
    getScene: () => threeRef.current?.getScene?.() || null,
    getCamera: () => threeRef.current?.getCamera?.() || null,
  }));

  return (
    <Canvas shadows dpr={[1, 2]}>
      <color attach="background" args={['#050505']} />
      <ThreeRefs ref={threeRef} />
      <SceneContent planeRef={planeRef} />
    </Canvas>
  );
});

export default DrawingCanvas;

























