import React from 'react';
import Wall from './Wall';
import * as THREE from 'three';

export type ConnectionSlot = 'forward' | 'right' | 'left';
export interface ConnectionPoint {
  forward: number | null;
  right: number | null;
  left: number | null;
}

export interface WallData {
  position: [number, number, number];
  length?: number;
  height?: number;
  thickness?: number;
  rotationY?: number;
  connectionA: ConnectionPoint;
  connectionB: ConnectionPoint;
}

interface WallWithArrowsProps extends WallData {
  showArrows?: boolean;
  onAddWall?: (end: 'A' | 'B', slot: ConnectionSlot) => void;
  onSelect?: () => void;
  selected?: boolean;
}

const arrowColor = '#1976d2';
const arrowSize = 0.5;
const arrowRadius = 0.2;

const WallWithArrows: React.FC<WallWithArrowsProps> = ({
  position,
  length = 6,
  height = 3,
  thickness = 0.15,
  rotationY = 0,
  connectionA,
  connectionB,
  showArrows = false,
  onAddWall,
  onSelect,
  selected = false,
}) => {
  // Cálculo das extremidades (A = início, B = fim)
  const halfLen = length / 2;
  const dir = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
  const perp = new THREE.Vector3(Math.sin(rotationY + Math.PI / 2), 0, Math.cos(rotationY + Math.PI / 2));
  const A = [
    position[0] - dir.x * halfLen,
    position[1],
    position[2] - dir.z * halfLen,
  ] as [number, number, number];
  const B = [
    position[0] + dir.x * halfLen,
    position[1],
    position[2] + dir.z * halfLen,
  ] as [number, number, number];

  // Função para desenhar uma seta em um ponto
  const Arrow = ({ pos, rot, onClick, visible }: { pos: [number, number, number], rot: [number, number, number], onClick: () => void, visible: boolean }) => (
    visible ? (
      <mesh position={pos} rotation={rot} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <coneGeometry args={[arrowRadius, arrowSize, 16]} />
        <meshStandardMaterial color={arrowColor} />
      </mesh>
    ) : null
  );

  return (
    <>
      <Wall
        position={position}
        length={length}
        height={height}
        thickness={thickness}
        rotation={[0, rotationY, 0]}
        onClick={onSelect}
        selected={selected}
      />
      {showArrows && (
        <>
          {/* Extremidade A */}
          <Arrow
            pos={[A[0] + dir.x * -arrowSize, A[1], A[2] + dir.z * -arrowSize]}
            rot={[-Math.PI / 2, 0, -rotationY]}
            onClick={() => onAddWall && onAddWall('A', 'forward')}
            visible={connectionA.forward === null}
          />
          <Arrow
            pos={[A[0] + perp.x * arrowSize, A[1], A[2] + perp.z * arrowSize]}
            rot={[-Math.PI / 2, 0, -rotationY - Math.PI / 2]}
            onClick={() => onAddWall && onAddWall('A', 'right')}
            visible={connectionA.right === null}
          />
          <Arrow
            pos={[A[0] - perp.x * arrowSize, A[1], A[2] - perp.z * arrowSize]}
            rot={[-Math.PI / 2, 0, -rotationY + Math.PI / 2]}
            onClick={() => onAddWall && onAddWall('A', 'left')}
            visible={connectionA.left === null}
          />
          {/* Extremidade B */}
          <Arrow
            pos={[B[0] + dir.x * arrowSize, B[1], B[2] + dir.z * arrowSize]}
            rot={[Math.PI / 2, 0, -rotationY]}
            onClick={() => onAddWall && onAddWall('B', 'forward')}
            visible={connectionB.forward === null}
          />
          <Arrow
            pos={[B[0] + perp.x * arrowSize, B[1], B[2] + perp.z * arrowSize]}
            rot={[Math.PI / 2, 0, -rotationY - Math.PI / 2]}
            onClick={() => onAddWall && onAddWall('B', 'right')}
            visible={connectionB.right === null}
          />
          <Arrow
            pos={[B[0] - perp.x * arrowSize, B[1], B[2] - perp.z * arrowSize]}
            rot={[Math.PI / 2, 0, -rotationY + Math.PI / 2]}
            onClick={() => onAddWall && onAddWall('B', 'left')}
            visible={connectionB.left === null}
          />
        </>
      )}
    </>
  );
};

export default WallWithArrows;
