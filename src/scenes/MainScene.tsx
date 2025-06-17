import React, { useRef, useState, useEffect } from 'react';
import { OrthographicCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import Wall from '../components/Wall/Wall';
import Controls from '../components/Controls/Controls';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';

interface SimpleWall {
  id: string;
  position: [number, number, number];
  length: number;
  height: number;
  thickness: number;
  rotationY: number;
}

const MainScene: React.FC = () => {
  const { is3D } = useConfig();
  const controlsRef = useRef<any>(null);
  const [walls, setWalls] = useState<SimpleWall[]>([
    {
      id: 'wall-1',
      position: [0, 0, 0],
      length: 6,
      height: 3,
      thickness: 0.15,
      rotationY: 0,
    }
  ]);
  const [selectedWall, setSelectedWall] = useState<string | null>('wall-1');
  const { camera, gl } = useThree();

  // Estado para o popup de configuração (agora no contexto global)
  const { 
    showConfigPopup, 
    setShowConfigPopup, 
    pendingWallConfig, 
    setPendingWallConfig 
  } = useConfig();

  // Effect para escutar mudanças na configuração pendente
  useEffect(() => {
    const handleWallConfigConfirmed = (event: CustomEvent) => {
      const { length, thickness, config } = event.detail;
      addWallWithConfig(config, length, thickness);
    };

    // Adiciona o listener para o evento customizado
    window.addEventListener('wallConfigConfirmed', handleWallConfigConfirmed as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('wallConfigConfirmed', handleWallConfigConfirmed as EventListener);
    };
  }, []);

  // Função para adicionar uma nova parede
  const handleAddWall = () => {
    // Armazena a configuração pendente e mostra o popup
    setPendingWallConfig({ wallIdx: 0, end: 'A', slot: 'forward' });
    setShowConfigPopup(true);
  };

  // Função para adicionar a parede com as configurações
  const addWallWithConfig = (config: any, length: number, thickness: number) => {
    const newWall: SimpleWall = {
      id: `wall-${Date.now()}`,
      position: [3, 0, 0], // Posição simples ao lado da primeira parede
      length: length,
      height: 3,
      thickness: thickness,
      rotationY: 0,
    };
    
    setWalls(prevWalls => [...prevWalls, newWall]);
    setSelectedWall(newWall.id);
  };

  const handleSelectWall = (id: string) => {
    setSelectedWall(id);
  };

  const handleCanvasClick = (event: any) => {
    console.log('handleCanvasClick', event);
    setSelectedWall(null);
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
      
      {/* Plano invisível para capturar cliques em lugares vazios */}
      <mesh 
        position={[0, -1, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleCanvasClick}
      >
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={1}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={'#717171'}
        cellColor={'#f6f6f6'}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={true}
      />
      
      {walls.map((wall) => (
        <Wall
          key={wall.id}
          position={wall.position}
          length={wall.length}
          height={wall.height}
          thickness={wall.thickness}
          rotation={[0, wall.rotationY, 0]}
          selected={selectedWall === wall.id}
          onClick={() => handleSelectWall(wall.id)}
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
