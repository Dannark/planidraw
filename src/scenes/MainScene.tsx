import React, { useRef, useState } from 'react';
import { OrthographicCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import WallWithArrows, { WallData } from '../components/WallWithArrows';
import Controls from '../components/Controls';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';

const defaultWall: WallData = {
  position: [0, 0, 0],
  length: 6,
  height: 3,
  thickness: 0.15,
  rotationZ: 0,
};

const MainScene: React.FC = () => {
  const { is3D } = useConfig();
  const halfWallThickness = 0.15 / 2;
  const controlsRef = useRef<any>(null);
  const [walls, setWalls] = useState<WallData[]>([defaultWall]);
  const [selectedWall, setSelectedWall] = useState<number | null>(0);

  // Função para adicionar uma nova parede na extremidade
  const handleAddWall = (index: number, direction: 'start' | 'end') => {
    const wall = walls[index];
    const length = wall.length ?? 6;
    const thickness = wall.thickness ?? 0.15;
    const angle = wall.rotationZ ?? 0;
    // Calcula o deslocamento para a nova parede
    const dx = Math.sin(angle) * length;
    const dz = Math.cos(angle) * length;
    // Posição da nova parede
    let newPos: [number, number, number];
    if (direction === 'end') {
      newPos = [
        wall.position[0] + dx,
        wall.position[1],
        wall.position[2] + dz,
      ];
    } else {
      newPos = [
        wall.position[0] - dx,
        wall.position[1],
        wall.position[2] - dz,
      ];
    }
    setWalls(prevWalls => {
      const newWalls = [...prevWalls, {
        position: newPos,
        length: wall.length,
        height: wall.height,
        thickness: wall.thickness,
        rotationZ: wall.rotationZ,
      }];
      setSelectedWall(newWalls.length - 1);
      return newWalls;
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
          onAddWall={(direction) => handleAddWall(idx, direction)}
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
