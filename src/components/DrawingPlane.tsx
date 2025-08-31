import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useDrawStore } from '../store/drawStore';
import { useDrawing } from '../hooks/useDrawing';
import ParticleSystem from './particles/ParticleSystem';
import LineRenderer from './lines/LineRenderer';
import DrawingCursor from './cursor/DrawingCursor';

const DrawingPlane: React.FC = () => {
  const planeRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, mouse } = useThree();
  const { 
    lines, 
    addPointToCurrentLine, 
    startNewLine, 
    endCurrentLine, 
    currentColor, 
    showLines, 
    isErasing,
    cameraEnabled 
  } = useDrawStore();
  
  const { isDrawing, handlePointerDown, handlePointerMove, handlePointerUp } = useDrawing({
    enabled: !cameraEnabled,
    planeRef,
    addPointToCurrentLine,
    startNewLine,
    endCurrentLine,
  });

  // Cursor position for visual feedback
  const cursorRef = useRef<THREE.Mesh>(null);
  const cursorPosition = useRef(new THREE.Vector3(0, 0.01, 0));

  useFrame(() => {
    if (!planeRef.current) return;

    // Update cursor position
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeRef.current);
    
    if (intersects.length > 0) {
      cursorPosition.current.copy(intersects[0].point);
      cursorPosition.current.y = 0.01; // Slightly above the plane
      
      if (cursorRef.current) {
        cursorRef.current.position.copy(cursorPosition.current);
      }
    }
  });

  return (
    <group>
      <Plane
        ref={planeRef}
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <meshStandardMaterial
          color="#111111"
          roughness={1}
          metalness={0}
          flatShading={true}
          side={THREE.DoubleSide}
        />
      </Plane>

      <DrawingCursor
        cursorRef={cursorRef}
        currentColor={currentColor}
        visible={!isDrawing}
        isErasing={isErasing}
      />

      <LineRenderer lines={lines} visible={showLines} />
      
      <ParticleSystem
        isDrawing={isDrawing}
        currentColor={currentColor}
        isErasing={isErasing}
        cursorPosition={cursorPosition.current}
      />
    </group>
  );
};

export default DrawingPlane;