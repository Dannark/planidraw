import React from 'react';
import * as THREE from 'three';
import { ConnectionNode } from '../../types/wall';
import { Edges } from '@react-three/drei';

interface ConnectionNodeComponentProps {
  node: ConnectionNode;
  selected: boolean;
  thickness?: number;
  height?: number;
  length?: number;
  rotationY?: number;
  showEdges?: boolean;
}

const ConnectionNodeComponent: React.FC<ConnectionNodeComponentProps> = ({ node, selected, thickness = 0.15, height = 3, length = 0.15, rotationY = 0, showEdges = true }) => {
  // Calcular direção para deslocar o node ao lado da extremidade
  const dir = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
  const offset = dir.clone().multiplyScalar(thickness / 2);
  const adjustedPosition: [number, number, number] = [
    node.position[0] + offset.x,
    node.position[1],
    node.position[2] - offset.z,
  ];

  return (
    <mesh position={adjustedPosition}>
      <boxGeometry args={[thickness, height, thickness]} />
      {/* <meshStandardMaterial color={selected ? '#ff9800' : '#1976d2'} transparent opacity={0.5} /> */}
      <meshStandardMaterial color={'grey'} transparent opacity={0.5} />
      {showEdges && <Edges color="black" />}
    </mesh>
  );
};

export default ConnectionNodeComponent;
