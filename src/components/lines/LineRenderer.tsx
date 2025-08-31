import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '../../types';

interface LineRendererProps {
  lines: Line[];
  visible: boolean;
}

const LineRenderer: React.FC<LineRendererProps> = ({ lines, visible }) => {
  const lineMeshRefs = useRef<{ [key: string]: THREE.Mesh | null }>({});

  const lineElements = useMemo(() => {
    return lines.map((line, lineIndex) => {
      if (line.points.length < 2) return null;

      const positions: number[] = [];
      const colors: number[] = [];
      const lineColor = new THREE.Color(line.color);
      
      for (let i = 0; i < line.points.length - 1; i++) {
        const point = line.points[i];
        const nextPoint = line.points[i + 1];
        
        positions.push(point.x, 0.01, point.z);
        positions.push(nextPoint.x, 0.01, nextPoint.z);
        
        colors.push(lineColor.r, lineColor.g, lineColor.b);
        colors.push(lineColor.r, lineColor.g, lineColor.b);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 3,
        transparent: true,
        opacity: 0.8,
      });

      if (!lineMeshRefs.current[lineIndex]) {
        lineMeshRefs.current[lineIndex] = null;
      }

      return (
        <line key={`line-${lineIndex}`} ref={(ref) => (lineMeshRefs.current[lineIndex] = ref)}>
          <bufferGeometry attach="geometry" {...geometry} />
          <lineBasicMaterial attach="material" {...material} />
        </line>
      );
    });
  }, [lines]);

  const thickLines = useMemo(() => {
    return lines.map((line, lineIndex) => {
      if (line.points.length < 2) return null;

      return line.points.map((point, i) => {
        if (i === line.points.length - 1) return null;
        
        const nextPoint = line.points[i + 1];
        const direction = new THREE.Vector3(
          nextPoint.x - point.x,
          0,
          nextPoint.z - point.z
        );
        const length = direction.length();
        direction.normalize();
        
        const position = new THREE.Vector3(
          (point.x + nextPoint.x) / 2,
          0.02,
          (point.z + nextPoint.z) / 2
        );
        
        const quaternion = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, direction).normalize();
        const angle = Math.acos(up.dot(direction));
        quaternion.setFromAxisAngle(axis, angle);
        
        return (
          <mesh
            key={`thick-line-${lineIndex}-${i}`}
            position={[position.x, position.y, position.z]}
            quaternion={quaternion}
          >
            <cylinderGeometry args={[0.03, 0.03, length, 8]} />
            <meshStandardMaterial 
              color={line.color}
              emissive={line.color}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        );
      });
    });
  }, [lines]);

  return (
    <group visible={visible}>
      {lineElements}
      {thickLines}
    </group>
  );
};

export default LineRenderer;