import React from 'react';
import { Edges } from '@react-three/drei';
import { useConfig } from '../config/ConfigContext';

interface WallProps {
  position?: [number, number, number];
  length?: number;
  height?: number;
  thickness?: number;
  rotation?: [number, number, number]; // ângulo em radianos
  showEdges?: boolean;
}

const Wall: React.FC<WallProps> = ({
  position = [0, 0, 0],
  length = 6,
  height = 3,
  thickness = 0.15,
  rotation = [0, 0, 0],
  showEdges = true,
}) => {

  const { is3D } = useConfig();

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[thickness, height, length]} />
      {/* <meshStandardMaterial color="white" wireframe={false} /> */}
      {showEdges && !is3D && <Edges color="black" />}
    </mesh>
  );
};

export default Wall;
