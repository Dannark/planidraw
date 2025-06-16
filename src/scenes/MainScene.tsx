import React, { useRef, useState } from 'react';
import { OrthographicCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import WallWithArrows, { WallData, ConnectionPoint, ConnectionSlot } from '../components/WallWithArrows';
import Controls from '../components/Controls';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';

const emptyConnection: ConnectionPoint = { forward: null, right: null, left: null };

const defaultWall: WallData = {
  position: [0, 0, 0],
  length: 6,
  height: 3,
  thickness: 0.15,
  rotationY: 0,
  connectionA: { ...emptyConnection },
  connectionB: { ...emptyConnection },
};

const MainScene: React.FC = () => {
  const { is3D } = useConfig();
  const controlsRef = useRef<any>(null);
  const [walls, setWalls] = useState<WallData[]>([defaultWall]);
  const [selectedWall, setSelectedWall] = useState<number | null>(0);

  // Função para adicionar uma nova parede a partir de uma extremidade e direção
  const handleAddWall = (wallIdx: number, end: 'A' | 'B', slot: ConnectionSlot) => {
    setWalls(prevWalls => {
      const wall = prevWalls[wallIdx];
      const length = wall.length ?? 6;
      const angle = wall.rotationY ?? 0;
      // Cálculo do ângulo de rotação (em Y)
      let newAngle = angle;
      if (slot === 'right') newAngle += Math.PI / 2;
      if (slot === 'left') newAngle -= Math.PI / 2;
      // Ponto de conexão (extremidade)
      const basePos = end === 'A'
        ? [
            wall.position[0] - Math.sin(angle) * (length / 2),
            wall.position[1],
            wall.position[2] - Math.cos(angle) * (length / 2),
          ]
        : [
            wall.position[0] + Math.sin(angle) * (length / 2),
            wall.position[1],
            wall.position[2] + Math.cos(angle) * (length / 2),
          ];
      // Offset para o centro da nova parede
      const dx = Math.sin(newAngle) * (length / 2);
      const dz = Math.cos(newAngle) * (length / 2);
      const newPos: [number, number, number] = [
        basePos[0] + dx,
        basePos[1],
        basePos[2] + dz,
      ];
      // Nova parede
      const newWall: WallData = {
        position: newPos,
        length: wall.length,
        height: wall.height,
        thickness: wall.thickness,
        rotationY: newAngle,
        connectionA: { ...emptyConnection },
        connectionB: { ...emptyConnection },
      };
      // Atualiza conexões
      const newWalls = prevWalls.map((w, idx) => {
        if (idx === wallIdx) {
          const updated = { ...w };
          if (end === 'A') updated.connectionA = { ...updated.connectionA, [slot]: prevWalls.length };
          if (end === 'B') updated.connectionB = { ...updated.connectionB, [slot]: prevWalls.length };
          return updated;
        }
        return w;
      });
      // Marca a conexão "de onde veio" na nova parede (tail)
      let tailEnd: 'A' | 'B';
      let tailSlot: ConnectionSlot;
      if (slot === 'forward') {
        tailEnd = 'A';
        tailSlot = 'forward';
      } else if (slot === 'right') {
        tailEnd = 'A';
        tailSlot = 'left';
      } else {
        tailEnd = 'A';
        tailSlot = 'right';
      }
      if (end === 'B') {
        tailEnd = tailEnd === 'A' ? 'B' : 'A';
      }
      if (tailEnd === 'A') {
        newWall.connectionA = { ...newWall.connectionA, [tailSlot]: wallIdx };
      } else {
        newWall.connectionB = { ...newWall.connectionB, [tailSlot]: wallIdx };
      }
      setSelectedWall(newWalls.length); // Seleciona a nova parede
      return [...newWalls, newWall];
    });
  };

  // Função para selecionar uma parede
  const handleSelectWall = (index: number) => {
    setSelectedWall(index);
  };

  return (
    <>
      {!is3D && (
        <OrthographicCamera
          makeDefault
          position={[0, 10, 0]}
          up={[0, 0, -1]}
          near={1}
          far={1000}
          zoom={100}
        />
      )}
      <ambientLight intensity={10} />
      <pointLight position={[10, 10, 10]} />
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={'#717171'}
        cellColor={'#888'}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={true}
      />
      {walls.map((wall, idx) => (
        <WallWithArrows
          key={idx}
          {...wall}
          showArrows={!is3D && selectedWall === idx}
          selected={selectedWall === idx}
          onAddWall={(end, slot) => handleAddWall(idx, end, slot)}
          onSelect={() => handleSelectWall(idx)}
        />
      ))}
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} controlsRef={controlsRef} />
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport axisColors={["#ff3653", "#8adb00", "#2c8fff"]} labelColor="white" />
      </GizmoHelper>
    </>
  );
};

export default MainScene;
