import React from 'react';
import * as THREE from 'three';

interface DrawingCursorProps {
  cursorRef: React.RefObject<THREE.Mesh>;
  currentColor: string;
  visible: boolean;
  isErasing: boolean;
}

const DrawingCursor: React.FC<DrawingCursorProps> = ({ cursorRef, currentColor, visible, isErasing }) => {
  return (
    <mesh ref={cursorRef} position={[0, 0.01, 0]} visible={visible}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial 
        color={isErasing ? '#ff0000' : currentColor}
        emissive={isErasing ? '#ff0000' : currentColor}
        emissiveIntensity={1.5}
        transparent
        opacity={isErasing ? 0.4 : 0.7}
        toneMapped={false}
      />
    </mesh>
  );
};

export default DrawingCursor;