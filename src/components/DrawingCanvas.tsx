import React, { forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import DrawingPlane from './DrawingPlane';
import { useDrawStore } from '../store/drawStore';

interface DrawingCanvasHandle {
  scene: THREE.Scene | null;
}

const SceneContent = () => {
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
          enableZoom={true}
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
      <DrawingPlane />

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

// Component to capture the scene ref
const CaptureScene = React.forwardRef<THREE.Scene | null>((props, ref) => {
  const { scene } = useThree();
  React.useEffect(() => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      ref.current = scene;
    }
  }, [scene, ref]);
  return null;
});

const DrawingCanvas = forwardRef<DrawingCanvasHandle>((props, ref) => {
  const sceneRef = React.useRef<THREE.Scene | null>(null);

  // Expose scene to parent
  useImperativeHandle(ref, () => ({
    scene: sceneRef.current,
  }));

  return (
    <Canvas shadows dpr={[1, 2]}>
      <color attach="background" args={['#050505']} />
      <SceneContent />
      <CaptureScene ref={sceneRef} />
    </Canvas>
  );
});

export default DrawingCanvas;






