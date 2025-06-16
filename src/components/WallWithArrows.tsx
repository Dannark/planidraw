import React from 'react';
import Wall from './Wall';
import * as THREE from 'three';

export interface WallData {
  position: [number, number, number];
  length?: number;
  height?: number;
  thickness?: number;
  rotationZ?: number;
}

interface WallWithArrowsProps extends WallData {
  showArrows?: boolean;
  onAddWall?: (direction: 'start' | 'end') => void;
  onSelect?: () => void;
  selected?: boolean;
}

const WallWithArrows: React.FC<WallWithArrowsProps> = ({
  position,
  length = 6,
  height = 3,
  thickness = 0.15,
  rotationZ = 0,
  showArrows = false,
  onAddWall,
  onSelect,
  selected = false,
}) => {
  // Calcula as extremidades
  const halfLen = length / 2;
  // Direção ao longo do eixo Z considerando rotação Z
  const dir = new THREE.Vector3(Math.sin(rotationZ), 0, Math.cos(rotationZ));
  const margin = 0.3;
  const start = [
    position[0] - dir.x * halfLen,
    position[1],
    position[2] - dir.z * halfLen - margin,
  ] as [number, number, number];
  const end = [
    position[0] + dir.x * halfLen,
    position[1],
    position[2] + dir.z * halfLen + margin,
  ] as [number, number, number];

  return (
    <>
      <Wall
        position={position}
        length={length}
        height={height}
        thickness={thickness}
        rotation={[0, 0, rotationZ]}
        onClick={onSelect}
      />
      {showArrows && (
        <>
          {/* Seta início */}
          <mesh
            position={start}
            rotation={[-Math.PI / 2, 0, -rotationZ]}
            onClick={(e) => { e.stopPropagation(); onAddWall && onAddWall('start'); }}
          >
            <coneGeometry args={[0.2, 0.5, 16]} />
            <meshStandardMaterial color="#1976d2" />
          </mesh>
          {/* Seta fim */}
          <mesh
            position={end}
            rotation={[Math.PI / 2, 0, -rotationZ]}
            onClick={(e) => { e.stopPropagation(); onAddWall && onAddWall('end'); }}
          >
            <coneGeometry args={[0.2, 0.5, 16]} />
            <meshStandardMaterial color="#1976d2" />
          </mesh>
        </>
      )}
    </>
  );
};

export default WallWithArrows;
