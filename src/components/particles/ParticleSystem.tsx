import React, { useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface Particle {
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
  isWhite: boolean;
}

interface ParticleSystemProps {
  isDrawing: boolean;
  currentColor: string;
  isErasing: boolean;
  cursorPosition: THREE.Vector3;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  isDrawing,
  currentColor,
  isErasing,
  cursorPosition,
}) => {
  const particlesRef = useRef<Particle[]>([]);
  const particleGeometry = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());

  // 1) create a round texture via canvas once
  const circleTexture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    // draw a filled circle
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 2) plug that texture into the PointsMaterial
  const particleMaterial = useRef(
    new THREE.PointsMaterial({
      size: 0.05,
      emissive: currentColor,
      emissiveIntensity: 2,
      map: circleTexture,
      alphaTest: 0.2,             // cut out the transparent bits
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );

  const maxParticles = 5000;

  const addParticles = useCallback((position: THREE.Vector3, color: string) => {
    const colorObj = new THREE.Color(color);
    for (let i = 0; i < 25; i++) {
      const speed = 0.08 + Math.random() * 0.12;
      const isWhite = Math.random() > 0.6;
      const particle: Particle = {
        position: [
          position.x + (Math.random() - 0.5) * 0.1,
          0.05 + Math.random() * 0.15,
          position.z + (Math.random() - 0.5) * 0.1,
        ],
        velocity: [
          (Math.random() - 0.5) * speed * 0.5,
          speed,
          (Math.random() - 0.5) * speed * 0.5,
        ],
        life: 1.0,
        isWhite,
      };
      particlesRef.current.push(particle);
      if (particlesRef.current.length > maxParticles) {
        particlesRef.current.shift();
      }
    }
  }, []);

  // buffers (you can hoist these out if you like)
  const positions = new Float32Array(maxParticles * 3);
  const colors = new Float32Array(maxParticles * 3);

  useFrame(() => {
    if (isDrawing && !isErasing) {
      addParticles(cursorPosition, currentColor);
    }

    let aliveCount = 0;
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    for (const particle of particlesRef.current) {
      particle.position[0] += particle.velocity[0];
      particle.position[1] += particle.velocity[1];
      particle.position[2] += particle.velocity[2];
      particle.life -= 0.012;

      if (particle.life > 0) {
        // write position
        positions[aliveCount * 3] = particle.position[0];
        positions[aliveCount * 3 + 1] = particle.position[1];
        positions[aliveCount * 3 + 2] = particle.position[2];

        // write color
        if (particle.isWhite) {
          const v = Math.sqrt(
            particle.velocity[0] ** 2 +
              particle.velocity[1] ** 2 +
              particle.velocity[2] ** 2
          );
          const intensity = Math.min(1, v * 5) * particle.life;
          colors.set([intensity, intensity, intensity], aliveCount * 3);
        } else {
          const c = new THREE.Color(currentColor);
          const v = Math.sqrt(
            particle.velocity[0] ** 2 +
              particle.velocity[1] ** 2 +
              particle.velocity[2] ** 2
          );
          const boost = Math.min(1, v * 3);
          colors.set(
            [
              c.r * particle.life * (1 + boost) * 2,
              c.g * particle.life * (1 + boost) * 2,
              c.b * particle.life * (1 + boost) * 2,
            ],
            aliveCount * 3
          );
        }
        aliveCount++;
      }
    }

    // update geometry
    particleGeometry.current.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions.subarray(0, aliveCount * 3), 3)
    );
    particleGeometry.current.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors.subarray(0, aliveCount * 3), 3)
    );
  });

  return <points geometry={particleGeometry.current} material={particleMaterial.current} />;
};

export default ParticleSystem;
