import React from 'react';
import { Edges } from '@react-three/drei';
import { useConfig } from '../../config/ConfigContext';
import * as THREE from 'three';
import './Wall.css';
import { ConnectionNode } from '../../types/wall';

interface WallProps {
  position?: [number, number, number];
  length?: number;
  height?: number;
  thickness?: number;
  rotation?: [number, number, number]; // ângulo em radianos
  showEdges?: boolean;
  selected?: boolean;
  onClick?: (e: any) => void;
  onAddWall?: (params: { position: [number, number, number], end: 'A' | 'B', wallId: string }) => void;
  wallId?: string;
  nodeA?: ConnectionNode;
  nodeB?: ConnectionNode;
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
  onAddWall,
  wallId,
  nodeA,
  nodeB,
}) => {

  const { is3D } = useConfig();

  position[1] = height/2; //y

  // Cálculo das extremidades (A = início, B = fim)
  const halfLen = length / 2;
  const dir = new THREE.Vector3(Math.sin(rotation[1]), 0, Math.cos(rotation[1]));
  
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

  // Função para renderizar um botão de adição
  const AddButton = ({ pos, end }: { pos: [number, number, number], end: 'A' | 'B' }) => (
    <mesh
      position={pos}
      onClick={(e) => { e.stopPropagation(); onAddWall && onAddWall({ position: pos, end, wallId: wallId! }); }}>
      <boxGeometry args={[0.3, height+0.1, 0.3]} />
      <meshStandardMaterial color="#2196F3" transparent opacity={0.8} />
    </mesh>
  );

  return (
    <>
      <mesh position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}>
        <boxGeometry args={[thickness, height, length]} />
        {selected && <meshStandardMaterial color="yellow" wireframe={false} />}
        {showEdges && <Edges color="black" />}
      </mesh>
      
      {/* Botões de extremidade apenas para a parede selecionada */}
      {selected && onAddWall && (
        <>
          {/* Botão na extremidade A (início) */}
          {!nodeA && (
            <AddButton
              pos={A}
              end="A"
            />
          )}
          
          {/* Botão na extremidade B (fim) */}
          {!nodeB && (
            <AddButton
              pos={B}
              end="B"
            />
          )}
        </>
      )}
    </>
  );
};

export default Wall; 