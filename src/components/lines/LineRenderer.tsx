import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { Line } from '../../types';

interface LineRendererProps {
  lines: Line[];
  visible: boolean;
}

export interface LineRendererHandle {
  getMeshes: () => THREE.Mesh[];
}

const LineRenderer = forwardRef<LineRendererHandle, LineRendererProps>(({ lines, visible }, ref) => {
  const meshRefs = useRef<THREE.Mesh[]>([]);


  useImperativeHandle(ref, () => ({
    getMeshes: () => meshRefs.current.filter(Boolean),
  }));

  const thickLines = useMemo(() => {
    meshRefs.current = [];

    return lines.flatMap((line, lineIndex) => {
      if (line.points.length < 2) return [];

      return line.points.slice(0, -1).map((point, i) => {
        const nextPoint = line.points[i + 1];
        const direction = new THREE.Vector3(nextPoint.x - point.x, 0, nextPoint.z - point.z);
        const length = direction.length();
        direction.normalize();

        const position = new THREE.Vector3(
          (point.x + nextPoint.x) / 2,
          0.02,
          (point.z + nextPoint.z) / 2
        );

        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, direction);
        const angle = Math.acos(up.dot(direction));
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis.normalize(), angle);

        return (
          <mesh
            key={`thick-line-${lineIndex}-${i}`}
            position={[position.x, position.y, position.z]}
            quaternion={quaternion}
            ref={(m) => m && meshRefs.current.push(m)}
          >
            <cylinderGeometry args={[0.03, 0.03, length, 8]} />
            <meshStandardMaterial color={line.color} emissive={line.color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        );
      });
    });
  }, [lines]);

  return <group visible={visible}>{thickLines}</group>;
});

export default LineRenderer;



