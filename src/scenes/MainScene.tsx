import React, { useRef, useState, useEffect } from 'react';
import { OrthographicCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import Wall from '../components/Wall/Wall';
import Controls from '../components/Controls/Controls';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';
import ConnectionNodeComponent from '../components/Wall/ConnectionNodeComponent';
import { SimpleWall, ConnectionNode, Slot } from '../types/wall';

const MainScene: React.FC = () => {
  const { is3D } = useConfig();
  const controlsRef = useRef<any>(null);
  const [walls, setWalls] = useState<(SimpleWall | ConnectionNode)[]>([{
    id: 'wall-1',
    position: [0, 0, 0],
    length: 6,
    height: 3,
    thickness: 0.15,
    rotationY: 0,
    isNode: false,
  }]);
  const [selectedWall, setSelectedWall] = useState<string | null>('wall-1');
  const { camera, gl } = useThree();

  // Estado para o popup de configuração (agora no contexto global)
  const { 
    showConfigPopup, 
    setShowConfigPopup, 
    pendingWallConfig, 
    setPendingWallConfig 
  } = useConfig();

  const wallsRef = useRef(walls);

  // Effect para escutar mudanças na configuração pendente
  useEffect(() => {
    const handleWallConfigConfirmed = (event: CustomEvent) => {
      const { length, thickness, direction, config } = event.detail;
      addWallWithConfig(config, length, thickness, direction);
    };

    // Adiciona o listener para o evento customizado
    window.addEventListener('wallConfigConfirmed', handleWallConfigConfirmed as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('wallConfigConfirmed', handleWallConfigConfirmed as EventListener);
    };
  }, []);

  useEffect(() => {
    wallsRef.current = walls;
  }, [walls]);

  // Função para adicionar uma nova parede a partir de uma extremidade
  const handleAddWall = (position: [number, number, number], end: 'A' | 'B', wallId: string) => {
    setPendingWallConfig({ wallIdx: 0, end, slot: 'forward', position, wallId });
    setShowConfigPopup(true);
  };

  // Função para adicionar a parede com as configurações
  const addWallWithConfig = (config: any, length: number, thickness: number, direction: 'front' | 'back' | 'right' | 'left') => {
    // Encontrar a parede de origem
    const wallIdx = wallsRef.current.findIndex(w => !w.isNode && w.id === config.wallId);
    if (wallIdx === -1) return;
    const wallOrig = wallsRef.current[wallIdx] as SimpleWall;

    // Determinar qual extremidade está sendo usada
    const isA = config.end === 'A';
    const nodeKey = isA ? 'nodeA' : 'nodeB';
    let node: ConnectionNode | undefined = wallOrig[nodeKey];
    let updatedWalls = [...wallsRef.current];

    // Se não existe node, criar um novo
    if (!node) {
      node = {
        id: `node-${Date.now()}`,
        position: config.position,
        slots: {
          back: wallOrig, // por padrão, conecta a parede de origem no slot 'front'
        },
        isNode: true,
        thickness: wallOrig.thickness,
        height: wallOrig.height,
        length: wallOrig.length,
        rotationY: wallOrig.rotationY,
      };
      // Atualizar a parede de origem para referenciar o novo node
      updatedWalls[wallIdx] = { ...wallOrig, [nodeKey]: node };
      updatedWalls.push(node);
    }

    // Calcular posição da nova parede de acordo com a direção escolhida
    const angleMap = {
      front: wallOrig.rotationY,
      back: wallOrig.rotationY + Math.PI,
      right: wallOrig.rotationY + Math.PI / 2,
      left: wallOrig.rotationY - Math.PI / 2,
    };
    const angle = angleMap[direction];
    console.log('direction', direction, 'angle', angle, 'angleMap', angleMap);
    const length_offset = (length / 2) + thickness;
    const dx = Math.sin(angle) * length_offset;
    const dz = Math.cos(angle) * length_offset;
    const newPos: [number, number, number] = [
      config.position[0] + dx,
      config.position[1],
      config.position[2] - dz,
    ];

    let newWallNodeA = undefined;
    let newWallNodeB = undefined;

    if (direction === 'front' || direction === 'right' || direction === 'left') {
      newWallNodeA = node;
    } else if (direction === 'back') {
      newWallNodeB = node;
    }

    // Criar a nova parede já conectada ao node
    const newWall: SimpleWall = {
      id: `wall-${Date.now()}`,
      position: newPos,
      length,
      height: 3,
      thickness,
      rotationY: angle,
      ...(newWallNodeA ? { nodeB: newWallNodeA } : {}),
      ...(newWallNodeB ? { nodeA: newWallNodeB } : {}),
    };
    console.log('newWall', newWall);
    // Atualizar o node para referenciar a nova parede no slot correto (exemplo: sempre 'back' para a nova parede)
    node.slots = {
      ...node.slots,
      [direction]: newWall // slot correto
    };

    updatedWalls.push(newWall);
    setWalls(updatedWalls);
    setSelectedWall(newWall.id);
  };

  const handleSelectWall = (id: string) => {
    setSelectedWall(id);
  };

  const handleCanvasClick = (event: any) => {
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
        wall.isNode ? (
          <ConnectionNodeComponent
            key={wall.id}
            node={wall}
            selected={selectedWall === wall.id}
            thickness={wall.thickness}
            height={wall.height}
            length={wall.length}
            rotationY={wall.rotationY}
            showEdges={true}
          />
        ) : (
          <Wall
            key={wall.id}
            position={wall.position}
            length={wall.length}
            height={wall.height}
            thickness={wall.thickness}
            rotation={[0, wall.rotationY, 0]}
            selected={selectedWall === wall.id}
            onClick={() => handleSelectWall(wall.id)}
            wallId={wall.id}
            nodeA={wall.nodeA}
            nodeB={wall.nodeB}
            onAddWall={({ position, end, wallId }) => handleAddWall(position, end, wallId)}
          />
        )
      ))}
      
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} controlsRef={controlsRef} />
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport axisColors={["#ff3653", "#8adb00", "#2c8fff"]} labelColor="white" />
      </GizmoHelper>
    </>
  );
};

export default MainScene;
