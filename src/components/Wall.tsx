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
  selected?: boolean;
  onClick?: (e: any) => void;
}

const Wall: React.FC<WallProps> = ({
  position = [0, 0, 0],
  length = 6,
  height = 3,
  thickness = 0.15,
  rotation = [0, 0, 0],
  showEdges = true,
  selected = false,
  onClick,
}) => {

  const { is3D } = useConfig();

  position[1] = height/2; //y

  return (
    <mesh position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}>
      <boxGeometry args={[thickness, height, length]} />
      {selected && <meshStandardMaterial color="yellow" wireframe={false} />}
      {showEdges && <Edges color="black" />}
    </mesh>
  );
};

export default Wall;
