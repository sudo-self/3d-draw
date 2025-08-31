import { useRef, useCallback, RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Point, Line } from '../types';

interface UseDrawingProps {
  enabled: boolean;
  planeRef: RefObject<THREE.Mesh>;
  startNewLine: (point: Point, color: string) => void;
  addPointToCurrentLine: (point: Point) => void;
  endCurrentLine: () => void;
}

export function useDrawing({
  enabled,
  planeRef,
  startNewLine,
  addPointToCurrentLine,
  endCurrentLine,
}: UseDrawingProps) {
  const isDrawing = useRef(false);
  const { raycaster, camera, mouse } = useThree();

  const getIntersectionPoint = useCallback((): Point | null => {
    if (!planeRef.current) return null;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeRef.current);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      return { x: point.x, y: point.y, z: point.z };
    }
    
    return null;
  }, [planeRef, raycaster, camera, mouse]);

  const handlePointerDown = useCallback((event: THREE.Event) => {
    if (!enabled) return;
    
    event.stopPropagation();
    
    const point = getIntersectionPoint();
    if (!point) return;
    
    isDrawing.current = true;
    startNewLine(point, ''); // Color is managed in the store
  }, [enabled, getIntersectionPoint, startNewLine]);

  const handlePointerMove = useCallback((event: THREE.Event) => {
    if (!enabled) return;
    
    event.stopPropagation();
    
    if (!isDrawing.current) return;
    
    const point = getIntersectionPoint();
    if (!point) return;
    
    addPointToCurrentLine(point);
  }, [enabled, getIntersectionPoint, addPointToCurrentLine]);

  const handlePointerUp = useCallback((event: THREE.Event) => {
    event.stopPropagation();
    
    if (!isDrawing.current) return;
    
    isDrawing.current = false;
    endCurrentLine();
  }, [endCurrentLine]);

  return {
    isDrawing: isDrawing.current,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}